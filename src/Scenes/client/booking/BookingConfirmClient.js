import { Scenes } from "../../settings/scenes"
import { Timetable } from "../../../../lib/model/timetable"
import { BookingSelectDayClient } from "./BookingSelectDayClient"
import { Keyboard } from "telegram-keyboard"
import { Users } from "../../../../lib/model/users"
import { BookingStatus, getCurrentDayStats } from "../../../strings/constants"
import { Stats } from "../../../../lib/model/stats"
import { Scene } from "../../settings/Scene"
import { Crons } from "../../../Crons/Crons"
import { CronNotifyTraining } from "../../../Crons/CronNotifyTraining"
import { Helpers } from "../../../strings/Helpers"
import { StudiaStats } from "../../../../lib/model/studies-stats"
import { CronAbonement } from "../../../Crons/CronAbonement"
import { CronAbonementTwentyDays } from "../../../Crons/CronAbonementTwentyDays"

export class BookingConfirmClient extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
    this.timetableIndex = null
    this.itemIndex = null
    this.timetables = null
    this.schedule = []
  }

  async enter() {
    await this.initTimetableIndex()
    this.checkUsing()
    await this.pushToClients()
    await this.startCron()
    await this.successBookingMessage()
    await this.changeScene(Scenes.Client.Booking.ConfirmBooking)
  }

  async handler() {
    await this.initTimetableIndex()

    const ACTION_BUTTON_CANCEL = this.ctx.i18n.t("bCancel")

    if (!this.payload) {
      return await this.error()
    }

    if (this.payload === ACTION_BUTTON_CANCEL) {
      this.checkRemoveUsing()
      await this.removeFromClients()
      await this.next(BookingSelectDayClient)
    }
  }

  async initTimetableIndex() {
    const { studia, location } = this.user.state
    const { timeMs } = this.user.state.select
    this.schedule = await Timetable.findOne({ studia, location })
    this.timetables = this.schedule.trainer.timetables
    this.timetableIndex = this.timetables.findIndex(timetable => timetable.timeMs === timeMs)
  }

  async startCron() {
    const abonement = this.user.state.abonement

    if (abonement?.activated === false) {
      await Users.updateOne(
        { id: this.user.id },
        { "state.abonement.select": this.user.state.select }
      )
      await this.getActualUser()
      await new CronAbonement(this.user).start()
      await new CronAbonementTwentyDays(this.user).start()
    }

    await new CronNotifyTraining(this.user).start()
  }

  async successBookingMessage() {
    const keyboard = Keyboard.make([this.ctx.i18n.t("bCancel")]).reply()
    await this.ctx.reply(
      this.ctx.i18n.t("confirmBooking", { countDays: this.user.abonementDays - 1 }),
      keyboard
    )
  }

  async pushToClients() {
    const { studia, location } = this.user.state
    this.schedule.trainer.timetables[this.timetableIndex].clients.push({
      id: this.user.id,
      tgID: this.user.tgID,
      name: this.user.name,
      surname: this.user.surname,
      phone: this.user.phone,
      age: this.user.age,
      weight: this.user.weight,
      height: this.user.height,
      selectItem: this.user.state.select.inventoryItem,
    })

    await this.schedule.save()
    await Users.updateOne(
      { id: this.user.id },
      {
        "state.booking.lastBooking": Date.now(),
        "state.booking.status": BookingStatus.Booked,
      }
    )
    await Stats.updateOne({ date: Helpers.getCurrentDayStats() }, { $inc: { bookingTraining: 1 } })
    await StudiaStats.updateOne(
      { date: Helpers.getCurrentDayStats(), studia, location },
      { $inc: { bookingTraining: 1 } }
    )
  }

  async removeFromClients() {
    const { studia, location } = this.user.state
    const clients = this.schedule.trainer.timetables[this.timetableIndex].clients
    const clientIndex = clients.findIndex(client => client.id === this.user.id)
    this.schedule.trainer.timetables[this.timetableIndex].clients.splice(clientIndex, 1)

    Crons.clear(this.user.tgID)

    await this.schedule.save()
    await Users.updateOne(
      { id: this.user.id },
      { "state.select": {}, crons: {}, "state.booking.status": BookingStatus.Free }
    )
    await Stats.updateOne({ date: Helpers.getCurrentDayStats() }, { $inc: { bookingTraining: -1 } })
    await StudiaStats.updateOne(
      { date: Helpers.getCurrentDayStats(), studia, location },
      { $inc: { bookingTraining: -1 } }
    )
  }

  checkUsing() {
    const { inventoryItem } = this.user.state.select
    if (inventoryItem) {
      this.initInventoryItemIndex()
      this.editInventoryItem(inventoryItem)
    } else {
      this.editMaxClients()
    }
  }

  checkRemoveUsing() {
    const { inventoryItem } = this.user.state.select
    if (inventoryItem) {
      this.initInventoryItemIndex()
      this.removeInventoryItem(inventoryItem)
    } else {
      this.removeMaxClients()
    }
  }

  editInventoryItem(inventoryItem) {
    const inventory = this.timetables[this.timetableIndex].inventory
    const countItems = inventory[this.itemIndex].count
    inventory[this.itemIndex] = {
      name: inventoryItem,
      count: countItems - 1,
    }
    this.schedule.trainer.timetables[this.timetableIndex].inventory = inventory
  }

  removeInventoryItem(inventoryItem) {
    const inventory = this.timetables[this.timetableIndex].inventory
    const countItems = inventory[this.itemIndex].count
    inventory[this.itemIndex] = {
      name: inventoryItem,
      count: countItems + 1,
    }
    this.schedule.trainer.timetables[this.timetableIndex].inventory = inventory
  }

  editMaxClients() {
    this.schedule.trainer.timetables[this.timetableIndex].maxClients -= 1
  }

  removeMaxClients() {
    this.schedule.trainer.timetables[this.timetableIndex].maxClients += 1
  }

  initInventoryItemIndex() {
    const { inventoryItem } = this.user.state.select
    const inventory = this.timetables[this.timetableIndex].inventory
    this.itemIndex = inventory.findIndex(item => item.name === inventoryItem)
  }
}

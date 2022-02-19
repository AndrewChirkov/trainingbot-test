import { Users } from "../../../../lib/model/users"
import { Scenes } from "../../settings/scenes"
import { Timetable } from "../../../../lib/model/timetable"
import { NotifyWaitingWithCancelClient } from "./NotifyWaitingWithCancelClient"
import { Stats } from "../../../../lib/model/stats"
import { BookingStatus, getCurrentDayStats } from "../../../strings/constants"
import { Scene } from "../../settings/Scene"
import { BookingSelectDayClient } from "../booking/BookingSelectDayClient"
import { Crons } from "../../../Crons/Crons"
import { bot, i18n } from "../../../main"
import { Keyboard } from "telegram-keyboard"
import { Helpers } from "../../../strings/Helpers"
import { StudiaStats } from "../../../../lib/model/studies-stats"

export class NotifyTrainingClient extends Scene {
  constructor(user, ctx = null) {
    super(user, ctx)
    this.payload = ctx?.message?.text
    this.timeday = ""
    this.time = ""
    this.timetableIndex = null
    this.itemIndex = null
    this.timetables = null
    this.schedule = []
  }

  async enter() {
    this.initTime()
    await this.notifyMessage()
    await this.changeScene(Scenes.Client.Notify.BeforeTraining)
  }

  async handler() {
    await this.initTimetableIndex()

    const ACTION_BUTTON_POSTPONE = this.ctx.i18n.t("bPostpone")
    const ACTION_BUTTON_IM_READY = this.ctx.i18n.t("bImReady")

    if (!this.payload) {
      return await this.error()
    }

    if (this.payload === ACTION_BUTTON_POSTPONE) {
      this.checkRemoveUsing()
      await this.removeFromClients()
      await this.next(BookingSelectDayClient)
    }

    if (this.payload === ACTION_BUTTON_IM_READY) {
      await this.next(NotifyWaitingWithCancelClient)
    }
  }

  initTime() {
    const selectedTimeMs = this.user.state.select.timeMs
    const selectedHours = this.generateHoursFromTimeMs(selectedTimeMs)

    if (selectedHours >= 15) {
      this.time = "12:00"
      this.timeday = i18n.t(this.language, "evening")
    } else if (selectedHours < 15) {
      this.time = "23:00"
      this.timeday = i18n.t(this.language, "morning")
    }
  }

  async notifyMessage() {
    const keyboard = Keyboard.make(
      [i18n.t(this.language, "bImReady"), i18n.t(this.language, "bPostpone")],
      {
        columns: 1,
      }
    ).reply()

    bot.telegram
      .sendMessage(
        this.user.tgID,
        i18n.t(this.language, "notifyBeforeTraining", { timeday: this.timeday, time: this.time }),
        keyboard
      )
      .catch(e => console.log(e))
  }

  async initTimetableIndex() {
    const { studia, location } = this.user.state
    const { timeMs } = this.user.state.select
    this.schedule = await Timetable.findOne({ studia, location })
    this.timetables = this.schedule.trainer.timetables
    this.timetableIndex = this.timetables.findIndex(timetable => timetable.timeMs === timeMs)
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

  checkRemoveUsing() {
    const { inventoryItem } = this.user.state.select
    if (inventoryItem) {
      this.initInventoryItemIndex()
      this.removeInventoryItem(inventoryItem)
    } else {
      this.removeMaxClients()
    }
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

  removeMaxClients() {
    this.schedule.trainer.timetables[this.timetableIndex].maxClients += 1
  }

  initInventoryItemIndex() {
    const { inventoryItem } = this.user.state.select
    const inventory = this.timetables[this.timetableIndex].inventory
    this.itemIndex = inventory.findIndex(item => item.name === inventoryItem)
  }

  generateHoursFromTimeMs(timeMs) {
    const date = new Date(timeMs)
    return date.getHours()
  }
}

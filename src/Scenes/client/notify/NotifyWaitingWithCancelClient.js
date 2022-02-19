import { getTasks } from "node-cron"
import { Keyboard } from "telegram-keyboard"
import { Timetable } from "../../../../lib/model/timetable"
import { Scenes } from "../../settings/scenes"
import { BookingSelectDayClient } from "../booking/BookingSelectDayClient"
import { Users } from "../../../../lib/model/users"
import { BookingStatus } from "../../../strings/constants"
import { Scene } from "../../settings/Scene"
import { Crons } from "../../../Crons/Crons"
import { bot, i18n } from "../../../main"
import { Helpers } from "../../../strings/Helpers"
import { Stats } from "../../../../lib/model/stats"
import { StudiaStats } from "../../../../lib/model/studies-stats"

export class NotifyWaitingWithCancelClient extends Scene {
  constructor(user, ctx = null) {
    super(user, ctx)
    this.payload = ctx?.message?.text
    this.timetableIndex = null
    this.itemIndex = null
    this.timetables = null
    this.schedule = []
  }

  async enter() {
    await this.enterMessage()
    await this.changeScene(Scenes.Client.Notify.WaitingCheckIn)
  }

  async enterMessage() {
    const keyboard = Keyboard.make([i18n.t(this.language, "bPostpone")])
      .oneTime()
      .reply()
    bot.telegram
      .sendMessage(this.user.tgID, i18n.t(this.language, "oneHourNotify"), keyboard)
      .catch(e => console.log(e))
  }

  async handler() {
    await this.initTimetableIndex()

    const ACTION_BUTTON_POSTPONE = this.ctx.i18n.t("bPostpone")

    if (!this.payload) {
      return await this.error()
    }

    if (this.payload === ACTION_BUTTON_POSTPONE) {
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

  initInventoryItemIndex() {
    const { inventoryItem } = this.user.state.select
    const inventory = this.timetables[this.timetableIndex].inventory
    this.itemIndex = inventory.findIndex(item => item.name === inventoryItem)
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
}

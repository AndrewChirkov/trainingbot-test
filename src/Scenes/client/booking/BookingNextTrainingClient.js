import { Scenes } from "../../settings/scenes"
import { Users } from "../../../../lib/model/users"
import { Scene } from "../../settings/Scene"
import { Keyboard } from "telegram-keyboard"
import { BookingSelectDayClient } from "./BookingSelectDayClient"
import { CronNextTraining } from "../../../Crons/CronNextTraining"
import { bot, i18n } from "../../../main"
import { Crons } from "../../../Crons/Crons"

export class BookingNextTrainingClient extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx?.message?.text
    this.notifyNextDay = false
  }

  async enter() {
    this.initNotify()
    await this.checkNotify()
    await this.changeScene(Scenes.Client.Booking.NextTraining)
  }

  async reenter() {
    await this.next(BookingNextTrainingClient)
  }

  async handler() {
    const ACTION_BUTTON_SELECT_DAY = this.ctx.i18n.t("bSelectDay")
    const ACTION_BUTTON_NEXT_DAY_NOTIFY = this.ctx.i18n.t("bNextDayNotify")

    if (!this.payload) {
      return await this.error()
    }

    if (this.payload === ACTION_BUTTON_SELECT_DAY) {
      await Users.updateOne({ id: this.user.id }, { crons: {}, "state.select": {} })

      Crons.clear(this.user.tgID)

      await this.next(BookingSelectDayClient)
    } else if (this.payload === ACTION_BUTTON_NEXT_DAY_NOTIFY) {
      Crons.clear(this.user.tgID)

      await this.startCron()
      await this.reenter()
    }
  }

  async startCron() {
    await new CronNextTraining(this.user).start()
  }

  async checkNotify() {
    if (this.notifyNextDay) {
      await this.nextTrainingWithMessage()
    } else {
      await this.nextTrainingWithoutMessage()
    }
  }

  async nextTrainingWithMessage() {
    await bot.telegram.sendMessage(this.user.tgID, i18n.t(this.language, "nextDayBookingNotify"))
  }

  async nextTrainingWithoutMessage() {
    const keyboard = Keyboard.make([
      [i18n.t(this.language, "bSelectDay")],
      [this.notifyNextDay === true ? "" : i18n.t(this.language, "bNextDayNotify")],
    ]).reply()

    await bot.telegram.sendMessage(
      this.user.tgID,
      i18n.t(this.language, "offerBookingNext"),
      keyboard
    )
  }

  initNotify() {
    this.notifyNextDay = this.user.crons?.notifyNextDay ?? false
  }
}

import { Keyboard } from "telegram-keyboard"
import { Timetable } from "../../../../lib/model/timetable"
import { Users } from "../../../../lib/model/users"
import { Helpers } from "../../../strings/Helpers"
import { Scene } from "../../settings/Scene"
import { Scenes } from "../../settings/scenes"
import { BookingConfirmClient } from "./BookingConfirmClient"
import { BookingSelectTimeClient } from "./BookingSelectTimeClient"

export class BookingInfoClient extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
    this.trainer = null
    this.date = null
  }

  async enter() {
    await this.initTrainer()
    await this.changeScene(Scenes.Client.Booking.Info)
    await this.checkTrainer()
  }

  async handler() {
    const ACTION_BUTTON_CONTINUE = this.ctx.i18n.t("bContinue")
    const ACTION_BUTTON_BACK = this.ctx.i18n.t("bBack")

    if (!this.payload) {
      return await this.error()
    }

    if (this.payload === ACTION_BUTTON_CONTINUE) {
      return await this.next(BookingConfirmClient)
    } else if (this.payload === ACTION_BUTTON_BACK) {
      return await this.next(BookingSelectTimeClient)
    }
  }

  async initTrainer() {
    const { studia, location } = this.user.state
    const { timeMs } = this.user.state.select

    const schedule = await Timetable.findOne({ studia, location })
    const timetables = schedule.trainer.timetables
    const timetableIndex = timetables.findIndex(timetable => timetable.timeMs === timeMs)

    this.trainer = timetables[timetableIndex].trainer
  }

  async checkTrainer() {
    if (this.trainer?.tgID) {
      await this.bookingInfoMessage()
    } else {
      await this.next(BookingConfirmClient)
    }
  }

  async bookingInfoMessage() {
    const { monthReal, day, dayOfWeek, time } = this.user.state.select
    const trainer = await Users.findOne(
      { tgID: this.trainer.tgID },
      { rating: 1, name: 1, surname: 1 }
    )

    const keyboard = Keyboard.make([this.ctx.i18n.t("bContinue"), this.ctx.i18n.t("bBack")], {
      columns: 1,
    }).reply()

    await this.ctx.reply(
      this.ctx.i18n.t("bookingInfo", {
        dayOfWeek: Helpers.getDayOfWeek(dayOfWeek, this.ctx),
        month: Helpers.timeFix(monthReal),
        day: Helpers.timeFix(day),
        time,
        trainer,
      }),
      keyboard
    )
  }
}

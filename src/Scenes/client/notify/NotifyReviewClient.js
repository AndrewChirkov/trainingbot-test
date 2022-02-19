import { Keyboard } from "telegram-keyboard"
import { Timetable } from "../../../../lib/model/timetable"
import { Users } from "../../../../lib/model/users"
import { getCurrentDayStats, Mark } from "../../../strings/constants"
import { Scenes } from "../../settings/scenes"
import { BookingStatus } from "../../../strings/constants"
import { Stats } from "../../../../lib/model/stats"
import { Scene } from "../../settings/Scene"
import { BookingNextTrainingClient } from "../booking/BookingNextTrainingClient"
import { Helpers } from "../../../strings/Helpers"
import { StudiaStats } from "../../../../lib/model/studies-stats"

export class NotifyReviewClient extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
    this.timetableIndex = null
    this.itemIndex = null
    this.timetables = null
    this.schedule = []
    this.rate = null
    this.mark = null
  }

  async enter() {
    await this.enterMessage()
    await this.changeScene(Scenes.Client.Notify.ReviewTraining)
  }

  async enterMessage() {
    const keyboard = Keyboard.make([this.ctx.i18n.t("bSkip")]).reply()

    await this.ctx.reply(this.ctx.i18n.t("reviewTraining"), keyboard)
  }

  async handler() {
    this.mark = this.user.temp.mark
    await this.initTimetableIndex()

    const ACTION_BUTTON_SKIP = this.ctx.i18n.t("bSkip")

    if (!this.payload) {
      return await this.error()
    }

    if (this.payload === ACTION_BUTTON_SKIP) {
      this.generateRate()
      await this.setTrainerRating()
      await this.pushToRates()
      return await this.next(BookingNextTrainingClient)
    }

    if (this.payload) {
      this.generateRateWithReview()
      await this.setTrainerRating()
      await this.pushToRates()
      return await this.next(BookingNextTrainingClient)
    }
  }

  async initTimetableIndex() {
    const { studia, location } = this.user.state
    const { timeMs } = this.user.state.select
    this.schedule = await Timetable.findOne({ studia, location })
    this.timetables = this.schedule.trainer.timetables
    this.timetableIndex = this.timetables.findIndex(timetable => timetable.timeMs === timeMs)
  }

  async pushToRates() {
    const { studia, location } = this.user.state

    this.schedule.trainer.timetables[this.timetableIndex].rates.push(this.rate)

    await this.schedule.save()
    await Users.updateOne(
      { id: this.user.id },
      {
        "state.booking.status": BookingStatus.Free,
      }
    )
    await Stats.updateOne({ date: Helpers.getCurrentDayStats() }, { $inc: { reviewsTraining: 1 } })
    await StudiaStats.updateOne(
      { date: Helpers.getCurrentDayStats(), studia, location },
      { $inc: { reviewsTraining: 1 } }
    )
  }

  async setTrainerRating() {
    const trainer = this.schedule.trainer.timetables[this.timetableIndex].trainer

    if (this.mark === Mark.Like) {
      await Users.updateOne({ tgID: trainer.tgID }, { $inc: { rating: 1 } })
    } else if (this.mark === Mark.Dislike) {
      await Users.updateOne({ tgID: trainer.tgID }, { $inc: { rating: -1 } })
    }
  }

  generateRate() {
    this.rate = {
      id: this.user.tgID,
      mark: this.mark,
    }
  }

  generateRateWithReview() {
    this.rate = {
      id: this.user.tgID,
      mark: this.mark,
      review: this.payload,
    }
  }
}

import { Scenes } from "../../settings/scenes"
import { Users } from "../../../../lib/model/users"
import { Timetable } from "../../../../lib/model/timetable"
import { BookingStatus, Mark } from "../../../strings/constants"
import { Stats } from "../../../../lib/model/stats"
import { getCurrentDayStats } from "../../../strings/constants"
import { Scene } from "../../settings/Scene"
import { Keyboard } from "telegram-keyboard"
import { NotifyReviewClient } from "./NotifyReviewClient"
import { bot, i18n } from "../../../main"
import { BookingNextTrainingClient } from "../booking/BookingNextTrainingClient"
import { Helpers } from "../../../strings/Helpers"
import { StudiaStats } from "../../../../lib/model/studies-stats"

export class NotifyRateClient extends Scene {
  constructor(user, ctx = null) {
    super(user, ctx)
    this.payload = ctx?.message?.text
    this.rate = null
    this.mark = null
  }

  async enter() {
    await this.enterMessage()
    await this.changeScene(Scenes.Client.Notify.RateTraining)
  }

  async enterMessage() {
    const keyboard = Keyboard.make([
      ["👎", "😐", "👍"],
      [i18n.t(this.language, "bImSkipped")],
    ]).reply()
    bot.telegram
      .sendMessage(this.user.tgID, i18n.t(this.language, "rateTraining"), keyboard)
      .catch(e => console.log(e))
  }

  async handler() {
    const ACTION_MARK_DISLIKE = "👎"
    const ACTION_MARK_LIKE = "👍"
    const ACTION_MARK_NEUTRAL = "😐"
    const ACTION_MARK_SKIPPED = this.ctx.i18n.t("bImSkipped")

    if (!this.payload) {
      return await this.error()
    }

    if (this.payload === ACTION_MARK_DISLIKE) {
      this.mark = Mark.Dislike
      await this.saveMark()
      await this.next(NotifyReviewClient)
    } else if (this.payload === ACTION_MARK_NEUTRAL) {
      this.mark = Mark.Neutral
      await this.saveMark()
      await this.next(NotifyReviewClient)
    } else if (this.payload === ACTION_MARK_LIKE) {
      this.mark = Mark.Like
      await this.saveMark()
      await this.next(NotifyReviewClient)
    } else if (this.payload === ACTION_MARK_SKIPPED) {
      await this.initTimetableIndex()
      this.generateRate()
      await this.pushToRates()
      await this.next(BookingNextTrainingClient)
    }
  }

  async initTimetableIndex() {
    const { studia, location } = this.user.state
    const { timeMs } = this.user.state.select
    this.schedule = await Timetable.findOne({ studia, location })
    this.timetables = this.schedule.trainer.timetables
    this.timetableIndex = this.timetables.findIndex(timetable => timetable.timeMs === timeMs)
  }

  async saveMark() {
    await Users.updateOne(
      { id: this.user.id },
      {
        "temp.mark": this.mark,
      }
    )
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
    await Stats.updateOne({ date: Helpers.getCurrentDayStats() }, { $inc: { skippedTraining: 1 } })
    await StudiaStats.updateOne(
      { date: Helpers.getCurrentDayStats(), studia, location },
      { $inc: { reviewsTraining: 1 } }
    )
  }

  generateRate() {
    this.rate = {
      id: this.user.tgID,
      mark: Mark.Skipped,
    }
  }
}

import { Keyboard } from "telegram-keyboard"
import { Timetable } from "../../../../../lib/model/timetable"
import { i18n } from "../../../../main"
import { Scenes } from "../../../settings/scenes"
import { Users } from "../../../../../lib/model/users"
import { Scene } from "../../../settings/Scene"
import { MainMenuTrainer } from "../../Menu/MainMenuTrainer"

export class CheckReviewsTrainer extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
    this.rates = null
    this.rate = null
    this.ratesWithReviewCount = null
    this.currentReview = null
    this.timetableIndex = null
  }

  async enter() {
    await this.initReviews()
    await this.changeScene(Scenes.Trainer.TimetableCheck.ReviewsTraining)
  }

  async reenter() {
    await this.next(CheckReviewsTrainer)
  }

  async handler() {
    const ACTION_BUTTON_SKIP = this.ctx.i18n.t("bSkip")
    const ACTION_BUTTON_MAIN_MENU = this.ctx.i18n.t("bMainMenu")
    const { studia, location } = this.user.state
    const { timeMs, currentReview } = this.user.state.check
    const schedule = await Timetable.findOne({ studia, location })
    const timetables = schedule.trainer.timetables

    this.timetableIndex = timetables.findIndex(timetable => timetable.timeMs === timeMs)
    this.rates = schedule.trainer.timetables[this.timetableIndex].rates
    this.rate = this.rates[this.rates.length - 1]

    const reviewIndex = this.rates.findIndex(review => review.id === currentReview?.id)

    if (!this.payload) {
      return await this.error()
    }

    if (this.payload === ACTION_BUTTON_SKIP) {
      schedule.trainer.timetables[this.timetableIndex].rates[reviewIndex] = {
        ...currentReview,
      }
      await schedule.save()
      return await this.reenter()
    } else if (this.payload === ACTION_BUTTON_MAIN_MENU) {
      return await this.next(MainMenuTrainer)
    }

    if (this.payload) {
      schedule.trainer.timetables[this.timetableIndex].rates[reviewIndex] = {
        ...currentReview,
        answer: this.payload,
      }
      await schedule.save()

      const client = await Users.findOne({ tgID: currentReview.id }, { language: 1 })
      this.ctx.telegram
        .sendMessage(
          currentReview.id,
          i18n.t(client.language, "reviewMessageTrainer", {
            review: currentReview.review,
            answer: this.payload,
          })
        )
        .catch(e => console.log(e))
      return await this.reenter()
    }
  }

  async initReviews() {
    this.rates = this.user.state.check.rates
    this.ratesWithReviewCount = this.user.state.check.countReviewMsg

    if (this.ratesWithReviewCount > 0) {
      this.rate = this.rates[this.rates.length - 1]
      this.currentReview = this.rates.pop()

      await this.selectReviewMessage()
      await Users.updateOne(
        { id: this.user.id },
        {
          "state.check.countReviewMsg": this.ratesWithReviewCount - 1,
          "state.check.currentReview": this.currentReview,
          $pop: { "state.check.rates": 1 },
        }
      )
    } else {
      await this.notFoundReviewsMessage()
    }
  }

  async selectReviewMessage() {
    const client = await Users.findOne({ tgID: this.rate.id }, { name: 1, surname: 1 })
    const keyboard = Keyboard.make([this.ctx.i18n.t("bSkip"), this.ctx.i18n.t("bMainMenu")], {
      columns: 1,
    }).reply()

    await this.ctx.reply(
      this.ctx.i18n.t("reviewMessage", {
        client,
        rate: this.rate,
      }),
      keyboard
    )
  }

  async notFoundReviewsMessage() {
    const keyboard = Keyboard.make([this.ctx.i18n.t("bMainMenu")]).reply()
    await this.ctx.reply(this.ctx.i18n.t("notReviewsAboutTraining"), keyboard)
  }
}

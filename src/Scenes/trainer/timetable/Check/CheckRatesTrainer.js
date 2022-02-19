import { Timetable } from "../../../../../lib/model/timetable"
import { Scenes } from "../../../settings/scenes"
import { MainMenuTrainer } from "../../Menu/MainMenuTrainer"
import { Users } from "./../../../../../lib/model/users"
import { Keyboard } from "telegram-keyboard"
import { Mark } from "../../../../strings/constants"
import { Scene } from "../../../settings/Scene"
import { CheckReviewsTrainer } from "./CheckReviewsTrainer"

export class CheckRatesTrainer extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
    this.timetable = null
    this.rates = null
    this.ratesWithReviewsMsg = []
    this.ratesWithReviewCount = 0
    this.countRates = {
      likes: 0,
      dislikes: 0,
      neutrals: 0,
      skipped: 0,
    }
  }

  async enter() {
    await this.initRates()
    this.initCountRates()
    await this.viewRatesMessage()
    await this.changeScene(Scenes.Trainer.TimetableCheck.RatesTraining)
  }

  async reenter() {
    await this.next(CheckRatesTrainer)
  }

  async handler() {
    const ratesWithReviewCount = this.user.state.check.countReviewMsg
    const ACTION_BUTTON_MAIN_MENU = this.ctx.i18n.t("bMainMenu")
    const ACTION_BUTTON_UPDATE = this.ctx.i18n.t("bUpdate")
    const ACTION_BUTTON_REVIEWS = this.ctx.i18n.t("bReviewsMsg", { rates: ratesWithReviewCount })

    if (!this.payload) {
      return await this.error()
    }

    if (this.payload === ACTION_BUTTON_MAIN_MENU) {
      await this.next(MainMenuTrainer)
      await Users.updateOne({ id: this.user.id }, { "state.check": {} })
    } else if (this.payload === ACTION_BUTTON_UPDATE) {
      await this.reenter()
    } else if (this.payload === ACTION_BUTTON_REVIEWS) {
      await this.next(CheckReviewsTrainer)
    }
  }

  async initRates() {
    const { studia, location } = this.user.state
    const { timeMs } = this.user.state.check
    const schedule = await Timetable.findOne({ studia, location })

    this.timetable = schedule.trainer.timetables.find(timetable => timetable.timeMs === timeMs)
    this.rates = this.timetable.rates
  }

  async viewRatesMessage() {
    const keyboard = Keyboard.make(
      [
        this.ctx.i18n.t("bUpdate"),
        this.ctx.i18n.t("bReviewsMsg", { rates: this.ratesWithReviewCount }),
        this.ctx.i18n.t("bMainMenu"),
      ],
      { columns: 1 }
    ).reply()

    await this.ctx.reply(this.ctx.i18n.t("ratesTraining", { count: this.countRates }), keyboard)
    await Users.updateOne(
      { id: this.user.id },
      {
        "state.check.rates": this.ratesWithReviewsMsg,
        "state.check.countReviewMsg": this.ratesWithReviewCount,
      }
    )
  }

  initCountRates() {
    this.rates.forEach(rate => {
      if (rate.mark === Mark.Like) {
        this.countRates.likes++
      } else if (rate.mark === Mark.Dislike) {
        this.countRates.dislikes++
      } else if (rate.mark === Mark.Neutral) {
        this.countRates.neutrals++
      } else if (rate.mark === Mark.Skipped) {
        this.countRates.skipped++
      }

      if (rate.review && !rate.answer) {
        this.ratesWithReviewsMsg.push(rate)
        this.ratesWithReviewCount += 1
      }
    })
  }
}

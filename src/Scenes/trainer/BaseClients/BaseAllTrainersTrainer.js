import { Keyboard } from "telegram-keyboard"
import { Users } from "../../../../lib/model/users"
import { Account, TrainerRole } from "../../../strings/constants"
import { Scene } from "../../settings/Scene"
import { Scenes } from "../../settings/scenes"
import { MainMenuTrainer } from "../Menu/MainMenuTrainer"

export class BaseAllTrainersTrainer extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
    this.queryPayload = ctx.callbackQuery?.data
    this.trainersView = []
  }

  async enter() {
    await this.initTrainers()
    await this.enterMessage()
    await this.changeScene(Scenes.Trainer.Clients.AllTrainers)
  }

  async enterMessage() {
    const keyboard = Keyboard.inline(this.trainersView, { columns: 1 })
    const keyboardNavigation = Keyboard.make([this.ctx.i18n.t("bMainMenu")]).reply()

    await this.ctx.reply(this.ctx.i18n.t("baseTrainers"), keyboard)
    await this.ctx.reply(this.ctx.i18n.t("ratingCompetitionInfo"), keyboardNavigation)
  }

  async handler() {
    const ACTION_BUTTON_MAIN_MENU = this.ctx.i18n.t("bMainMenu")

    if (this.queryPayload) {
      await this.ctx.answerCbQuery()
    }

    if (this.payload === ACTION_BUTTON_MAIN_MENU) {
      await this.next(MainMenuTrainer)
    }
  }

  async initTrainers() {
    const { studia } = this.user.state
    const { name, surname, rating } = this.user
    const trainers = await Users.find({
      "state.studia": studia,
      account: Account.Trainer,
    })

    trainers.forEach(trainer => {
      if (trainer.tgID !== this.user.tgID) {
        this.trainersView.push(`${trainer.name} ${trainer.surname} - 👍 ${trainer.rating}`)
      }
    })

    this.trainersView.unshift(`${name} ${surname} - 👍 ${rating}`)
  }
}

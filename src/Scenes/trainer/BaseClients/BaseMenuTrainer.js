import { Keyboard } from "telegram-keyboard"
import { Scene } from "../../settings/Scene"
import { Scenes } from "../../settings/scenes"
import { MainMenuTrainer } from "../Menu/MainMenuTrainer"
import { BaseAllClientsTrainer } from "./BaseAllClientsTrainer"
import { BaseAllTrainersTrainer } from "./BaseAllTrainersTrainer"

export class BaseMenuTrainer extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
  }

  async enter() {
    await this.enterMessage()
    await this.changeScene(Scenes.Trainer.Clients.Menu)
  }

  async enterMessage() {
    const keyboard = Keyboard.make(
      [
        [this.ctx.i18n.t("bBaseAllClients"), this.ctx.i18n.t("bBaseAllTrainers")],
        [this.ctx.i18n.t("bBack")],
      ],
      {
        pattern: [2, 1],
      }
    ).reply()

    await this.ctx.reply(this.ctx.i18n.t("selectBase"), keyboard)
  }

  async handler() {
    const ACTION_CLIENTS = this.ctx.i18n.t("bBaseAllClients")
    const ACTION_TRAINERS = this.ctx.i18n.t("bBaseAllTrainers")
    const ACTION_BUTTON_BACK = this.ctx.i18n.t("bBack")

    if (!this.payload) {
      return await this.error()
    }

    if (this.payload === ACTION_CLIENTS) {
      await this.next(BaseAllClientsTrainer)
    } else if (this.payload === ACTION_TRAINERS) {
      await this.next(BaseAllTrainersTrainer)
    } else if (this.payload === ACTION_BUTTON_BACK) {
      await this.next(MainMenuTrainer)
    }
  }
}

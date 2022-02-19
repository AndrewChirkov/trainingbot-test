import { Scenes } from "./../../settings/scenes"
import { Keyboard } from "telegram-keyboard"
import { MessagesSelectTypeTrainer } from "./MessagesSelectTypeTrainer"
import { MainMenuTrainer } from "../Menu/MainMenuTrainer"
import { Scene } from "../../settings/Scene"

export class MessagesSendOneUserTrainer extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
  }

  async enter() {
    await this.enterMessage()
    await this.changeScene(Scenes.Trainer.Messages.SendOneUser)
  }

  async enterMessage() {
    const keyboard = Keyboard.make([this.ctx.i18n.t("bBack")]).reply()
    await this.ctx.reply(this.ctx.i18n.t("typeMsgOneDescription"), keyboard)
  }

  async handler() {
    const ACTION_BUTTON_BACK = this.ctx.i18n.t("bBack")
    const tempMessageClient = this.user.temp?.messages?.editClient

    if (!this.payload) {
      return await this.error()
    }

    if (this.payload === ACTION_BUTTON_BACK) {
      return await this.next(MessagesSelectTypeTrainer)
    }

    if (this.payload) {
      this.ctx.telegram
        .sendMessage(
          tempMessageClient,
          this.ctx.i18n.t("msgFromTrainerToOneUser", { message: this.payload })
        )
        .catch(e => console.log(e))
      await this.successSendingMessage()
      await this.next(MainMenuTrainer)
    }
  }

  async successSendingMessage() {
    await this.ctx.reply(this.ctx.i18n.t("msgSuccessOne"))
  }
}

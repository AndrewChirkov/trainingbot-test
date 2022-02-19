import { Keyboard } from "telegram-keyboard"
import { Scenes } from "../../settings/scenes"
import { checkRole } from "../../../strings/constants"
import { Scene } from "../../settings/Scene"
import { MessagesSelectOneUserTrainer } from "./MessagesSelectOneUserTrainer"
import { MessagesSelectDayTrainer } from "./MessagesSelectDayTrainer"
import { MainMenuTrainer } from "../Menu/MainMenuTrainer"
import { MessageSendAllUsersTrainer } from "./MessageSendAllUsersTrainer"
import { Helpers } from "../../../strings/Helpers"

export class MessagesSelectTypeTrainer extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
  }

  async enter() {
    await this.enterMessage()
    await this.changeScene(Scenes.Trainer.Messages.SelectType)
  }

  async enterMessage() {
    const role = this.user.state.role
    const keyboard = Keyboard.make(
      [
        Helpers.checkRole(role) ? this.ctx.i18n.t("bMsgAllStudia") : "",
        this.ctx.i18n.t("bMsgOneUser"),
        this.ctx.i18n.t("bMsgAllTraining"),
        this.ctx.i18n.t("bMainMenu"),
      ],
      { columns: 1 }
    ).reply()

    await this.ctx.replyWithMarkdown(this.ctx.i18n.t("typesMsgDescription"), keyboard)
  }

  async handler() {
    const ACTION_MESSAGE_ALL_STUDIA = this.ctx.i18n.t("bMsgAllStudia")
    const ACTION_MESSAGE_ONE_USER = this.ctx.i18n.t("bMsgOneUser")
    const ACTION_MESSAGE_ALL_TRAINING = this.ctx.i18n.t("bMsgAllTraining")
    const ACTION_BUTTON_MAIN_MENU = this.ctx.i18n.t("bMainMenu")

    if (!this.payload) {
      return await this.error()
    }

    switch (this.payload) {
      case ACTION_MESSAGE_ALL_TRAINING:
        await this.next(MessagesSelectDayTrainer)
        break
      case ACTION_MESSAGE_ONE_USER:
        await this.next(MessagesSelectOneUserTrainer)
        break
      case ACTION_MESSAGE_ALL_STUDIA:
        await this.next(MessageSendAllUsersTrainer)
        break
      case ACTION_BUTTON_MAIN_MENU:
        await this.next(MainMenuTrainer)
        break
    }
  }
}

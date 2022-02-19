import { Users } from "../../../../lib/model/users"
import { Scenes } from "../../settings/scenes"
import { MessagesSelectTypeTrainer } from "./MessagesSelectTypeTrainer"
import { Keyboard } from "telegram-keyboard"
import { MainMenuTrainer } from "../Menu/MainMenuTrainer"
import { Account } from "../../../strings/constants"
import { Scene } from "../../settings/Scene"

export class MessageSendAllUsersTrainer extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
    this.clientsCount = []
    this.maybeTime = 0
  }

  async enter() {
    await this.initClients()
    await this.checkClientsCount()
    await this.changeScene(Scenes.Trainer.Messages.SendAllUsers)
  }

  async handler() {
    const ACTION_BUTTON_BACK = this.ctx.i18n.t("bBack")

    if (!this.payload) {
      return await this.error()
    }

    if (this.payload === ACTION_BUTTON_BACK) {
      return await this.next(MessagesSelectTypeTrainer)
    }

    if (this.payload) {
      const { studia } = this.user.state
      const clients = await Users.find({
        "state.studia": studia,
        account: Account.Client,
      })
      this.maybeTime = Math.round(clients.length * 0.5)

      await this.sendingMessages()

      for await (let client of clients) {
        try {
          await this.sendMessageToClient(client)
        } catch (e) {
          console.log(e)
        }
      }

      await this.successSendingMessages()
      await this.next(MainMenuTrainer)
    }
  }

  async initClients() {
    const { studia } = this.user.state
    const clients = await Users.find({
      "state.studia": studia,
      account: Account.Client,
    })

    this.clientsCount = clients.length
  }

  async checkClientsCount() {
    if (this.clientsCount > 0) {
      await this.typingForUsersMessage()
    } else {
      await this.notFoundClientsMessage()
    }
  }

  async sendMessageToClient(client) {
    return new Promise(resolve => {
      setTimeout(async () => {
        this.ctx.telegram
          .sendMessage(
            client.tgID,
            this.ctx.i18n.t("msgFromTrainerToAll", { message: this.payload })
          )
          .then()
          .catch(e => console.log(e))
          .finally(() => resolve())
      }, 500)
    })
  }

  async typingForUsersMessage() {
    const keyboard = Keyboard.make([this.ctx.i18n.t("bBack")]).reply()
    await this.ctx.reply(this.ctx.i18n.t("typeMsgAllDescription"), keyboard)
  }

  async notFoundClientsMessage() {
    const keyboard = Keyboard.make([this.ctx.i18n.t("bBack")]).reply()
    await this.ctx.reply(this.ctx.i18n.t("notMessagesClients"), keyboard)
  }

  async sendingMessages() {
    await this.ctx.reply(this.ctx.i18n.t("sendingMsgAllUsers", { maybeTime: this.maybeTime }))
  }

  async successSendingMessages() {
    await this.ctx.reply(this.ctx.i18n.t("msgSuccessAll"))
  }
}

import { Scenes } from "../../settings/scenes"
import { MainMenuTrainer } from "../Menu/MainMenuTrainer"
import { Timetable } from "../../../../lib/model/timetable"
import { Keyboard } from "telegram-keyboard"
import { MessagesSelectTimeTrainer } from "./MessagesSelectTimeTrainer"
import { Scene } from "../../settings/Scene"

export class MessageSendAllTrainingTrainer extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
    this.maybeTime = 0
  }

  async enter() {
    await this.enterMessage()
    await this.changeScene(Scenes.Trainer.Messages.SendMessageAllTraining)
  }

  async enterMessage() {
    const keyboard = Keyboard.make([this.ctx.i18n.t("bBack")]).reply()
    await this.ctx.reply(this.ctx.i18n.t("typeMsgTrainingDescription"), keyboard)
  }

  async handler() {
    const ACTION_BUTTON_BACK = this.ctx.i18n.t("bBack")

    if (!this.payload) {
      return await this.error()
    }

    if (this.payload === ACTION_BUTTON_BACK) {
      return await this.next(MessagesSelectTimeTrainer)
    }

    if (this.payload) {
      const timeMs = this.user.state.messages.timeMs
      const { studia, location } = this.user.state
      const schedule = await Timetable.findOne({ studia, location })
      const timetable = schedule.trainer.timetables.find(timetable => timetable.timeMs === timeMs)
      const clients = timetable.clients
      this.maybeTime = Math.round(clients.length * 0.5)

      await this.sendingMessages()

      for await (let client of clients) {
        await this.sendMessageToClient(client)
      }

      await this.successSendingMessages()
      await this.next(MainMenuTrainer)
    }
  }

  async sendMessageToClient(client) {
    return new Promise(resolve => {
      setTimeout(async () => {
        this.ctx.telegram
          .sendMessage(
            client.tgID,
            this.ctx.i18n.t("msgFromTrainerToTraining", { message: this.payload })
          )
          .catch(e => console.log(e))
          .finally(() => resolve())
        resolve()
      }, 500)
    })
  }

  async sendingMessages() {
    await this.ctx.reply(this.ctx.i18n.t("sendingMsgAllUsers", { maybeTime: this.maybeTime }))
  }

  async successSendingMessages() {
    await this.ctx.reply(this.ctx.i18n.t("msgSuccessTraining"))
  }
}

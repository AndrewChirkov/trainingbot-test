import { Scenes } from "../../settings/scenes"
import { SelectStudiaClient } from "./SelectStudiaClient"
import { Stats } from "../../../../lib/model/stats"
import { Scene } from "../../settings/Scene"
import { Keyboard } from "telegram-keyboard"
import { Helpers } from "../../../strings/Helpers"

export class ConfirmRegisterClient extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
  }

  async enter() {
    await this.enterMessage()
    await this.changeScene(Scenes.Client.Register.ConfirmRegister)
  }

  async enterMessage() {
    const keyboard = Keyboard.make([this.ctx.i18n.t("bSend")]).reply()
    await this.ctx.reply(this.ctx.i18n.t("confirmRegister"), keyboard)
  }

  async handler() {
    if (this.payload) {
      await Stats.updateOne(
        { date: Helpers.getCurrentDayStats() },
        { $inc: { newUsers: 1, newClients: 1 } }
      )
      await this.next(SelectStudiaClient)
    } else {
      await this.error()
    }
  }
}

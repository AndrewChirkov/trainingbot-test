import { Markup } from "telegraf"
import { Scenes } from "../../settings/scenes"
import { Users } from "../../../../lib/model/users"
import { ConfirmRegisterClient } from "./ConfirmRegisterClient"
import { Scene } from "../../settings/Scene"
import { Keyboard } from "telegram-keyboard"

export class SelectPhoneClient extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.phone = ctx.message.contact?.phone_number
  }

  async enter() {
    await this.enterMessage()
    await this.changeScene(Scenes.Client.Register.Phone)
  }

  async enterMessage() {
    const keyboard = Keyboard.make([Markup.contactRequestButton(this.ctx.i18n.t("bPhone"))]).reply()
    await this.ctx.reply(this.ctx.i18n.t("enterPhone"), keyboard)
  }

  async handler() {
    if (this.phone) {
      await Users.updateOne({ tgID: this.user.tgID }, { phone: this.phone })
      await this.next(ConfirmRegisterClient)
    } else {
      await this.errorPhone()
    }
  }

  async errorPhone() {
    await this.ctx.reply(this.ctx.i18n.t("phoneValidate"))
  }
}

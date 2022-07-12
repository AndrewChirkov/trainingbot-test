import { Users } from "../../../lib/model/users"
import { Languages } from "../../strings/constants"
import { Scenes } from "../settings/scenes"
import { SelectAccount } from "./SelectAccount"
import { Keyboard } from "telegram-keyboard"
import { Scene } from "../settings/Scene"
import { i18n } from "../../main"

export class SelectLanguage extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
  }

  async enter() {
    await this.enterMessage()
    await this.changeScene(Scenes.All.Language)
  }

  async enterMessage() {
    const keyboard = Keyboard.make([["🇺🇦"]])
      .oneTime()
      .reply()

    await this.ctx.reply(i18n.t(Languages.UK, "selectLanguage"), keyboard)
  }

  async handler() {
    const ACTION_LANGUAGE_RU = "🇷🇺"
    const ACTION_LANGUAGE_UA = "🇺🇦"

    if (!this.payload) {
      return await this.error()
    }

    if (this.payload === ACTION_LANGUAGE_RU) {
      await Users.updateOne({ tgID: this.user.tgID }, { language: Languages.RU })
      this.changeLocale(Languages.RU)
      await this.next(SelectAccount)
    } else if (this.payload === ACTION_LANGUAGE_UA) {
      await Users.updateOne({ tgID: this.user.tgID }, { language: Languages.UK })
      this.changeLocale(Languages.UK)
      await this.next(SelectAccount)
    }
  }

  changeLocale(locale) {
    this.ctx.i18n.locale(locale)
  }
}

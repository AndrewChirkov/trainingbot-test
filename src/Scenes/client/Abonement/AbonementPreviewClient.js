import { Keyboard } from "telegram-keyboard"
import { Users } from "../../../../lib/model/users"
import { Scene } from "../../settings/Scene"
import { Scenes } from "../../settings/scenes"
import { SelectLocationClient } from "../register/SelectLocationScene"
import { AbonementBuyClient } from "./AbonementBuyClient"

export class AbonementPreviewClient extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
  }

  async enter() {
    await this.enterMessage()
    await this.changeScene(Scenes.Client.Abonement.Preview)
  }

  async enterMessage() {
    const keyboard = Keyboard.make([["7 дней", "12 дней"], [this.ctx.i18n.t("bBack")]], {
      pattern: [2, 1],
    }).reply()

    await this.ctx.reply("Выберите абоненемент, который хотите приобрести.", keyboard)
  }

  async handler() {
    const ACTION_BUTTON_BACK = this.ctx.i18n.t("bBack")
    const ACTION_TWELVE_DAYS = "12 дней"
    const ACTION_SEVEN_DAYS = "7 дней"

    if (!this.payload) {
      return await this.error()
    }

    if (this.payload === ACTION_SEVEN_DAYS) {
      await this.setBuyItem(7)
      await this.next(AbonementBuyClient)
    } else if (this.payload === ACTION_TWELVE_DAYS) {
      await this.setBuyItem(12)
      await this.next(AbonementBuyClient)
    } else if (this.payload === ACTION_BUTTON_BACK) {
      await this.next(SelectLocationClient)
    }
  }

  async setBuyItem(days) {
    const item = {}

    if (days === 7) {
      item.id = 1
      item.title = `Абонемент - ${this.payload}`
      item.price = 7999900
    }

    if (days === 12) {
      item.id = 2
      item.title = `Абонемент - ${this.payload}`
      item.price = 9229900
    }

    await Users.updateOne(
      { id: this.user.id },
      {
        "state.buyItem": item,
      }
    )
  }
}

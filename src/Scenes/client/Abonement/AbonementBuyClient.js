import { Keyboard } from "telegram-keyboard"
import { Scene } from "../../settings/Scene"
import { Scenes } from "../../settings/scenes"
import { AbonementPreviewClient } from "./AbonementPreviewClient"

export class AbonementBuyClient extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
  }

  async enter() {
    await this.enterMessage()
    await this.invoiceMessage()
    await this.changeScene(Scenes.Client.Abonement.Buy)
  }

  async enterMessage() {
    const keyboard = Keyboard.make([this.ctx.i18n.t("bBack")]).reply()

    await this.ctx.reply(`Оплачивайте абонемент прямо в нашем боте!`, keyboard)
  }

  async handler() {
    const ACTION_BUTTON_BACK = this.ctx.i18n.t("bBack")

    if (this.payload === ACTION_BUTTON_BACK) {
      await this.next(AbonementPreviewClient)
    }
  }

  async invoiceMessage() {
    const buyItem = this.user.state.buyItem

    await this.ctx.replyWithInvoice({
      title: buyItem.title,
      description: "Абонемент для занятий",
      payload: this.user.tgID,
      provider_token: process.env.PROVIDER_TOKEN,
      currency: "UAH",
      prices: [{ label: buyItem.title, amount: buyItem.price }],
      photo_url: "https://i.ibb.co/C2P57QR/abonement.png",
      photo_width: 500,
      photo_height: 500,
    })
  }
}

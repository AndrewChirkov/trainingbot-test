import { Keyboard } from "telegram-keyboard"
import { Scenes } from "../../settings/scenes"
import { BookingSelectDayClient, enterSelectDayScene } from "./BookingSelectDayClient"
import { SelectLocationClient } from "../register/SelectLocationScene"
import { Scene } from "../../settings/Scene"

export class BookingOfferClient extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
  }

  async enter() {
    await this.enterMessage()
    await this.changeScene(Scenes.Client.Booking.OfferBooking)
  }

  async enterMessage() {
    const keyboard = Keyboard.make([this.ctx.i18n.t("bBooking"), this.ctx.i18n.t("bBack")], {
      columns: 1,
    }).reply()

    await this.ctx.reply(this.ctx.i18n.t("offerBooking"), keyboard)
  }

  async handler() {
    const ACTION_BUTTON_BACK = this.ctx.i18n.t("bBack")
    const ACTION_BUTTON_BOOKING = this.ctx.i18n.t("bBooking")

    if (!this.payload) {
      return await this.error()
    }

    if (this.payload === ACTION_BUTTON_BACK) {
      return this.next(SelectLocationClient)
    } else if (this.payload === ACTION_BUTTON_BOOKING) {
      return this.next(BookingSelectDayClient)
    } else {
      return await this.error()
    }
  }
}

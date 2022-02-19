import { Scenes } from "./../../settings/scenes"
import { Keyboard } from "telegram-keyboard"
import { BookingSelectDayClient } from "./BookingSelectDayClient"
import { Scene } from "../../settings/Scene"

export class BookingNotFreePlacesClient extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
  }

  async enter() {
    await this.enterMessage()
    await this.changeScene(Scenes.Client.Booking.NotMaxClients)
  }

  async enterMessage() {
    const keyboard = Keyboard.make([this.ctx.i18n.t("bSelectOtherDate")]).reply()
    await this.ctx.reply("К сожалению нет свободных мест на эту тренировку.", keyboard)
  }

  async handler() {
    const ACTION_SELECT_OTHER_DATE = this.ctx.i18n.t("bSelectOtherDate")

    if (!this.payload) {
      return await this.error()
    }

    if (this.payload === ACTION_SELECT_OTHER_DATE) {
      await this.next(BookingSelectDayClient)
    }
  }
}

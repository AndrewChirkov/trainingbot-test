import { Scenes } from "../../settings/scenes"
import { BookingSelectDayClient } from "./BookingSelectDayClient"
import { BookingSelectInventoryClient } from "./BookingSelectInventoryClient"
import { Users } from "../../../../lib/model/users"
import { Keyboard } from "telegram-keyboard"
import { Scene } from "../../settings/Scene"

export class BookingNotFreeItemClient extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
  }

  async enter() {
    await this.enterMessage()
    await this.changeScene(Scenes.Client.Booking.NotInventoryItem)
  }

  async enterMessage() {
    const keyboard = Keyboard.make(
      [this.ctx.i18n.t("bSelectOtherDate"), this.ctx.i18n.t("bSelectOtherSize")],
      {
        columns: 1,
      }
    )
      .oneTime()
      .reply()
    await this.ctx.reply(this.ctx.i18n.t("notEnoughItem"), keyboard)
  }

  async handler() {
    const ACTION_SELECT_OTHER_DATE = this.ctx.i18n.t("bSelectOtherDate")
    const ACTION_SELECT_OTHER_SIZE = this.ctx.i18n.t("bSelectOtherSize")

    if (!this.payload) {
      return await this.error()
    }

    if (this.payload === ACTION_SELECT_OTHER_DATE) {
      await this.next(BookingSelectDayClient)
    } else if (this.payload === ACTION_SELECT_OTHER_SIZE) {
      await Users.updateOne({ id: this.user.id }, { "state.rememberItem": null })
      await this.next(BookingSelectInventoryClient)
    } else {
      await this.error()
    }
  }
}

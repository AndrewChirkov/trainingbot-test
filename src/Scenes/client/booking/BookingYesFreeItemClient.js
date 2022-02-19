import { Scenes } from "../../settings/scenes"
import { BookingSelectInventoryClient } from "./BookingSelectInventoryClient"
import { Users } from "../../../../lib/model/users"
import { Keyboard } from "telegram-keyboard"
import { Scene } from "../../settings/Scene"
import { BookingInfoClient } from "./BookingInfoClient"

export class BookingYesFreeItemClient extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
  }

  async enter() {
    await this.enterMessage()
    await this.changeScene(Scenes.Client.Booking.YesInventoryItem)
  }

  async enterMessage() {
    const keyboard = Keyboard.make([this.ctx.i18n.t("bYes"), this.ctx.i18n.t("bSelectOtherSize")], {
      columns: 1,
    })
      .oneTime()
      .reply()

    await this.ctx.reply(this.ctx.i18n.t("yesEnoughItem"), keyboard)
  }

  async handler() {
    const ACTION_SELECT_OTHER_SIZE = this.ctx.i18n.t("bSelectOtherSize")
    const ACTION_BUTTON_YES = this.ctx.i18n.t("bYes")

    if (!this.payload) {
      return await this.error()
    }

    if (this.payload === ACTION_BUTTON_YES) {
      await this.next(BookingInfoClient)
    } else if (this.payload === ACTION_SELECT_OTHER_SIZE) {
      await Users.updateOne({ id: this.user.id }, { "state.rememberItem": null })
      await this.next(BookingSelectInventoryClient)
    } else {
      await this.error()
    }
  }
}

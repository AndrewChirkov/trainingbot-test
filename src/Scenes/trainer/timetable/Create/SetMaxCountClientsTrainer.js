import { Users } from "../../../../../lib/model/users"
import { Scenes } from "../../../settings/scenes"
import { Keyboard } from "telegram-keyboard"
import { Scene } from "../../../settings/Scene"
import { SelectInventoryTrainer } from "./SelectInventoryTrainer"
import { DefaultInventory } from "../../../../strings/constants"

export class SetMaxCountClientsTrainer extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
  }

  async enter() {
    await this.enterMessage()
    await this.changeScene(Scenes.Trainer.TimetableCreate.MaxCountClients)
  }

  async enterMessage() {
    const keyboard = Keyboard.make([this.ctx.i18n.t("bBack")]).reply()
    await this.ctx.reply(this.ctx.i18n.t("setMaxCountClients"), keyboard)
  }

  async handler() {
    const ACTION_BUTTON_BACK = this.ctx.i18n.t("bBack")
    const maxClients = Number(this.payload)
    const isValidCount = isNaN(maxClients) === false

    if (!this.payload) {
      return await this.error()
    }

    if (this.payload === ACTION_BUTTON_BACK) {
      return await this.next(SelectInventoryTrainer)
    }

    if (isValidCount) {
      await Users.updateOne(
        { id: this.user.id },
        {
          "state.inventory": DefaultInventory,
          "state.inventoryUsing": false,
          "state.maxClientsUsing": true,
          "state.maxClients": maxClients,
        }
      )
      await this.next(SelectInventoryTrainer)
    } else {
      await this.error()
    }
  }
}

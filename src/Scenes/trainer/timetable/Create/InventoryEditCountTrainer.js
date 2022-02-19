import { Scenes } from "../../../settings/scenes"
import { Timetable } from "../../../../../lib/model/timetable"
import { Users } from "../../../../../lib/model/users"
import { Keyboard } from "telegram-keyboard"
import { InventoryUsingTrainer } from "./InventoryUsingTrainer"
import { Scene } from "../../../settings/Scene"

export class InventoryEditCountTrainer extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
    this.inventory = user.state.inventory
    this.nameEditingItem = user.temp?.editingItem
    this.editingItem = null
  }

  async enter() {
    await this.initEditingItem()
    await this.enterMessage()
    await this.changeScene(Scenes.Trainer.TimetableCreate.InventoryEditCount)
  }

  async enterMessage() {
    const countItem = this.viewCountItem()
    const keyboard = Keyboard.make([[this.ctx.i18n.t("bBack")]]).reply()
    await this.ctx.reply(countItem, keyboard)
  }

  async handler() {
    const ACTION_BUTTON_BACK = this.ctx.i18n.t("bBack")
    const count = Number(this.payload)
    const isValidCount = isNaN(count) === false

    if (!this.payload) {
      return await this.error()
    }

    if (this.payload === ACTION_BUTTON_BACK) {
      return await this.next(InventoryUsingTrainer)
    }

    if (this.payload && isValidCount) {
      await Users.updateOne(
        { id: this.user.id, "state.inventory.name": this.nameEditingItem },
        {
          "state.inventoryUsing": true,
          "state.maxClientsUsing": false,
          "state.maxClients": null,
          $set: {
            "state.inventory.$.count": count,
          },
        }
      )
      await this.next(InventoryUsingTrainer)
    } else {
      await this.error()
    }
  }

  async initEditingItem() {
    this.editingItem = await this.inventory.find(item => item.name === this.nameEditingItem)
  }

  viewCountItem() {
    const count =
      this.editingItem.count > 0
        ? this.ctx.i18n.t("yourCountItem", { count: this.editingItem.count })
        : ""
    return `${this.ctx.i18n.t("enterCountItem", { name: this.editingItem.name })} ${count}`
  }
}

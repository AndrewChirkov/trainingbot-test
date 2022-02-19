import { Scenes } from "../../../settings/scenes"
import { Users } from "../../../../../lib/model/users"
import { Keyboard } from "telegram-keyboard"
import { SelectInventoryTrainer } from "./SelectInventoryTrainer"
import { Scene } from "../../../settings/Scene"
import { InventoryEditCountTrainer } from "./InventoryEditCountTrainer"
import { SelectDayTrainer } from "./SelectDayTrainer"
import { SelectMonthTrainer } from "./SelectMonthTrainer"

export class InventoryUsingTrainer extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
    this.inventory = user.state.inventory
    this.viewInventory = []
  }

  async enter() {
    await this.initInventory()
    await this.enterMessage()
    await this.changeScene(Scenes.Trainer.TimetableCreate.InventoryUsing)
  }

  async enterMessage() {
    const keyboard = Keyboard.make([
      this.viewInventory,
      [this.ctx.i18n.t("bBack"), this.ctx.i18n.t("bGoCalendar")],
    ],{pattern: [4,2]}).reply()

    await this.ctx.reply(this.ctx.i18n.t("imUsingInventory"), keyboard)
  }

  async handler() {
    const ACTION_BUTTON_BACK = this.ctx.i18n.t("bBack")
    const ACTION_BUTTON_GO_CALENDAR = this.ctx.i18n.t("bGoCalendar")
    const ACTION_BUTTON_ADD_ITEM = this.ctx.i18n.t("bAddItem")

    if (!this.payload) {
      return await this.error()
    }

    for (const item of this.inventory) {
      if (this.payload === item.name) {
        await this.setEditingItem(item)
        return await this.next(InventoryEditCountTrainer)
      }
    }

    switch (this.payload) {
      case ACTION_BUTTON_BACK:
        await this.next(SelectInventoryTrainer)
        break
      case ACTION_BUTTON_GO_CALENDAR:
        await this.checkSelectedType()
        break
      case ACTION_BUTTON_ADD_ITEM:
        //Function in development
        break
    }
  }

  async initInventory() {
    this.inventory.forEach(item => {
      this.viewInventory.push(item.name)
    })
  }

  async setEditingItem(item) {
    await Users.updateOne({ id: this.user.id }, { "temp.editingItem": item.name })
  }

  async checkSelectedType() {
    const { maxClientsUsing, inventoryUsing } = this.user.state

    if (inventoryUsing || maxClientsUsing) {
      await this.next(SelectMonthTrainer)
    } else {
      await this.warningTypeMessage()
    }
  }

  async warningTypeMessage() {
    await this.ctx.reply(this.ctx.i18n.t("warningNotTypeInventory"))
  }
}

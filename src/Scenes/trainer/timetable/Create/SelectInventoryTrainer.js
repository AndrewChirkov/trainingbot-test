import { Scenes } from "../../../settings/scenes"
import { Timetable } from "../../../../../lib/model/timetable"
import { DefaultInventory, LocationStatus } from "../../../../strings/constants"
import { Users } from "../../../../../lib/model/users"
import { Keyboard } from "telegram-keyboard"
import { Scene } from "../../../settings/Scene"
import { MainMenuTrainer } from "../../Menu/MainMenuTrainer"
import { InventoryUsingTrainer } from "./InventoryUsingTrainer"
import { SelectMonthTrainer } from "./SelectMonthTrainer"
import { SetMaxCountClientsTrainer } from "./SetMaxCountClientsTrainer"

export class SelectInventoryTrainer extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
  }

  async enter() {
    await this.enterMessage()
    await this.initInventory()
    await this.changeScene(Scenes.Trainer.TimetableCreate.Inventory)
  }

  async enterMessage() {
    const { maxClientsUsing, inventoryUsing } = this.user.state
    let keyboard = Keyboard.make([
      [this.ctx.i18n.t("bInventoryUsing")],
      [this.ctx.i18n.t("bMaxCountClients")],
      [this.ctx.i18n.t("bMainMenu"), this.ctx.i18n.t("bGoCalendar")],
    ]).reply()

    if (maxClientsUsing) {
      keyboard = Keyboard.make([
        [this.ctx.i18n.t("bInventoryUsing")],
        [this.ctx.i18n.t("bMaxCountClients") + " ✅"],
        [this.ctx.i18n.t("bMainMenu"), this.ctx.i18n.t("bGoCalendar")],
      ]).reply()
    }

    if (inventoryUsing) {
      keyboard = Keyboard.make([
        [this.ctx.i18n.t("bInventoryUsing") + " ✅"],
        [this.ctx.i18n.t("bMaxCountClients")],
        [this.ctx.i18n.t("bMainMenu"), this.ctx.i18n.t("bGoCalendar")],
      ]).reply()
    }

    await this.ctx.reply(this.ctx.i18n.t("imUsingInventory"), keyboard)
  }

  async handler() {
    const ACTION_BUTTON_INVENTORY_USING = this.ctx.i18n.t("bInventoryUsing")
    const ACTION_BUTTON_SET_MAX_CLIENTS = this.ctx.i18n.t("bMaxCountClients")
    const ACTION_BUTTON_INVENTORY_USING_SELECT = this.ctx.i18n.t("bInventoryUsing") + " ✅"
    const ACTION_BUTTON_SET_MAX_CLIENTS_SELECT = this.ctx.i18n.t("bMaxCountClients") + " ✅"
    const ACTION_BUTTON_MAIN_MENU = this.ctx.i18n.t("bMainMenu")
    const ACTION_BUTTON_GO_CALENDAR = this.ctx.i18n.t("bGoCalendar")

    if (!this.payload) {
      return await this.error()
    }

    switch (this.payload) {
      case ACTION_BUTTON_INVENTORY_USING:
      case ACTION_BUTTON_INVENTORY_USING_SELECT:
        await this.next(InventoryUsingTrainer)
        break
      case ACTION_BUTTON_SET_MAX_CLIENTS:
      case ACTION_BUTTON_SET_MAX_CLIENTS_SELECT:
        await this.next(SetMaxCountClientsTrainer)
        break
      case ACTION_BUTTON_GO_CALENDAR:
        await this.checkSelectedType()
        break
      case ACTION_BUTTON_MAIN_MENU:
        await this.next(MainMenuTrainer)
        break
    }
  }

  async initInventory() {
    const { studia, location } = this.user.state
    const isTrainerExist = await this.checkIsTrainerExist()

    if (!isTrainerExist) {
      const trainer = this.generateTrainer()

      await Users.updateOne(
        { id: this.user.id },
        {
          "state.inventory": DefaultInventory,
        }
      )
      await Timetable.updateOne({ studia, location }, { trainer, status: LocationStatus.Ok })
    }
  }

  async checkIsTrainerExist() {
    const { studia, location } = this.user.state
    const schedule = await Timetable.findOne({ studia, location }, { "trainer.id": 1 })
    if (schedule.trainer.id) {
      return true
    } else {
      return false
    }
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

  generateTrainer() {
    return {
      id: this.user.id,
      tgID: this.user.tgID,
      name: this.user.name,
      surname: this.user.surname,
      phone: this.user.phone,
      timetables: [],
    }
  }
}

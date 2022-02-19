import { Scenes } from "../../settings/scenes"
import { checkRole } from "../../../strings/constants"
import { Keyboard } from "telegram-keyboard"
import { Users } from "./../../../../lib/model/users"
import { Scene } from "../../settings/Scene"
import { SelectLocationTrainer } from "../timetable/Create/SelectLocationTrainer"
import { SelectInventoryTrainer } from "../timetable/Create/SelectInventoryTrainer"
import { CheckSelectDayTrainer } from "../timetable/Check/CheckSelectDayTrainer"
import { BaseAllClientsTrainer } from "../BaseClients/BaseAllClientsTrainer"
import { MessagesSelectTypeTrainer } from "../Messages/MessagesSelectTypeTrainer"
import { Helpers } from "../../../strings/Helpers"
import { BaseMenuTrainer } from "../BaseClients/BaseMenuTrainer"
import { RefLinkTrainer } from "../Link/RefLinkTrainer"

export class MainMenuTrainer extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
    this.role = user.state.role
    this.location = user.state.location
  }

  async enter() {
    await this.enterMessage()
    await this.changeScene(Scenes.Trainer.Actions)
  }

  async enterMessage() {
    const menu = [
      Helpers.checkRole(this.role) ? this.ctx.i18n.t("bCreateTimetable") : "",
      this.ctx.i18n.t("bCheckTimetable"),
      this.ctx.i18n.t("bBaseClients"),
      this.ctx.i18n.t("bMessages"),
      this.ctx.i18n.t("bStudiaRef"),
    ]

    const buildMenu = Keyboard.make(menu, { pattern: [2, 2, 2, 1] })
    const buildNavigation = Keyboard.make([this.ctx.i18n.t("bSelectLocation")])
    const keyboard = Keyboard.combine(buildMenu, buildNavigation).oneTime().reply()

    await this.ctx.reply(this.ctx.i18n.t("selectAction", { location: this.location }), keyboard)
  }

  async handler() {
    const ACTION_BUTTON_SELECT_LOCATION = this.ctx.i18n.t("bSelectLocation")
    const ACTION_BUTTON_BASE_CLIENTS = this.ctx.i18n.t("bBaseClients")
    const ACTION_BUTTON_MESSAGES = this.ctx.i18n.t("bMessages")
    const ACTION_CREATE_TIMETABLE = this.ctx.i18n.t("bCreateTimetable")
    const ACTION_CHECK_TIMETABLE = this.ctx.i18n.t("bCheckTimetable")
    const ACTION_STUDIA_REF = this.ctx.i18n.t("bStudiaRef")


    if (!this.payload) {
      return await this.error()
    }

    switch (this.payload) {
      case ACTION_BUTTON_SELECT_LOCATION:
        await this.next(SelectLocationTrainer)
        break
      case ACTION_BUTTON_BASE_CLIENTS:
        await this.next(BaseMenuTrainer)
        break
      case ACTION_CREATE_TIMETABLE:
        await this.next(SelectInventoryTrainer)
        break
      case ACTION_CHECK_TIMETABLE:
        await this.next(CheckSelectDayTrainer)
        break
      case ACTION_BUTTON_MESSAGES:
        await this.next(MessagesSelectTypeTrainer)
        break
      case ACTION_STUDIA_REF: 
        await this.next(RefLinkTrainer)
        break
      default:
        await this.error()
        break
    }
  }
}

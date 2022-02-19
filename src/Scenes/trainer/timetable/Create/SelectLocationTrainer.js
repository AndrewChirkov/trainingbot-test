import { Scenes } from "../../../settings/scenes"
import { Timetable } from "../../../../../lib/model/timetable"
import { checkRole, LocationStatus } from "../../../../strings/constants"
import { Keyboard } from "telegram-keyboard"
import { Users } from "../../../../../lib/model/users"
import { Scene } from "../../../settings/Scene"
import { CreateLocationTrainer } from "./CreateLocationTrainer"
import { MainMenuTrainer } from "../../Menu/MainMenuTrainer"
import { EditStudiaMenuTrainer } from "../../Edit/EditStudiaMenuTrainer"
import { Helpers } from "../../../../strings/Helpers"

export class SelectLocationTrainer extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
    this.locations = new Set([])
    this.role = user.state.role
  }

  async enter() {
    await this.initLocations()
    await this.selectLocationMessage()
    await this.changeScene(Scenes.Trainer.TimetableCreate.SelectLocation)
  }

  async reenter() {
    await this.next(SelectLocationTrainer)
  }

  async handler() {
    const ACTION_BUTTON_UPDATE = this.ctx.i18n.t("bUpdate")
    const ACTION_BUTTON_ADD_LOCATION = this.ctx.i18n.t("bAddLocation")
    const ACTION_BUTTON_EDIT_STUDIA = this.ctx.i18n.t("bStudiaInfo")
    const tempLocations = this.user.temp.locations ?? []

    if (!this.payload) {
      return await this.error()
    }

    for (let location of tempLocations) {
      if (this.payload === location) {
        await Users.updateOne({ id: this.user.id }, { "state.location": location })
        return await this.next(MainMenuTrainer)
      }
    }

    if (this.payload === ACTION_BUTTON_ADD_LOCATION) {
      await this.next(CreateLocationTrainer)
    } else if (this.payload === ACTION_BUTTON_EDIT_STUDIA) {
      await this.next(EditStudiaMenuTrainer)
    } else if (this.payload === ACTION_BUTTON_UPDATE) {
      await this.reenter()
    } else {
      await this.error()
    }
  }

  async initLocations() {
    const { studia } = this.user.state
    const schedules = await Timetable.find({ studia }, { location: 1, status: 1 })
    schedules.forEach(schedule => {
      if (schedule.status === LocationStatus.Ok) {
        this.locations.add(schedule.location)
      }
    })
  }

  async selectLocationMessage() {
    const buildLocations = Keyboard.make([...this.locations], { columns: 2 })
    const buildNavigation = Keyboard.make(
      [
        Helpers.checkRole(this.role) ? (this.user.temp.registerMode ? "" : this.ctx.i18n.t("bStudiaInfo")) : "",
        Helpers.checkRole(this.role) ? this.ctx.i18n.t("bAddLocation") : "",
        Helpers.checkRole(this.role) ? "" : this.ctx.i18n.t("bUpdate"),
      ],
      { columns: 2 }
    )
    const keyboard = Keyboard.combine(buildLocations, buildNavigation).reply()

    await this.ctx.reply(this.ctx.i18n.t("selectOrNewLocation"), keyboard)
    await Users.updateOne({ id: this.user.id }, { "temp.locations": [...this.locations] })
  }

  //  async notFoundLocationsMessage() {
  //    const keyboard = Keyboard.make(
  //      [
  //        Helpers.checkRole(this.role) ? this.ctx.i18n.t("bAddLocation") : "",
  //        Helpers.checkRole(this.role) ? "" : this.ctx.i18n.t("bUpdate"),
  //      ],
  //      { columns: 2 }
  //    ).reply()
  //
  //    await this.ctx.reply(this.ctx.i18n.t("notHaveLocations"), keyboard)
  //  }
}

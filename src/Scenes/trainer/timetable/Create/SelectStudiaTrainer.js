import { Keyboard } from "telegram-keyboard"
import { Timetable } from "../../../../../lib/model/timetable"
import { LocationStatus, TrainerRole } from "../../../../strings/constants"
import { Scenes } from "../../../settings/scenes"
import { SelectLocationTrainer } from "./SelectLocationTrainer"
import { Users } from "../../../../../lib/model/users"
import { Scene } from "../../../settings/Scene"
import { CreateStudiaTrainer } from "./CreateStudiaTrainer"

export class SelectStudiaTrainer extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
    this.studies = new Set([])
    this.isStudies = false
  }

  async enter() {
    await this.changeScene(Scenes.Trainer.TimetableCreate.SelectStudia)
    await this.initStudies()
    await this.checkStudies()
  }

  async reenter() {
    await this.next(SelectStudiaTrainer)
  }

  async handler() {
    const ACTION_BUTTON_UPDATE = this.ctx.i18n.t("bUpdate")
    const ACTION_BUTTON_ADD_STUDIA = this.ctx.i18n.t("bAddStudia")
    const tempStudies = this.user.temp?.studies ?? []

    if (!this.payload) {
      return await this.error()
    }

    for (const studia of tempStudies) {
      if (this.payload === studia) {
        await Users.updateOne(
          { id: this.user.id },
          {
            "state.studia": studia,
            "state.role": TrainerRole.ReadOnly,
            rating: 0,
          }
        )
        return await this.next(SelectLocationTrainer)
      }
    }

    if (this.payload === ACTION_BUTTON_ADD_STUDIA) {
      await this.next(CreateStudiaTrainer)
    } else if (this.payload === ACTION_BUTTON_UPDATE) {
      await this.reenter()
    } else {
      await this.error()
    }
  }

  async checkStudies() {
    if (this.user.studiaRef) {
      const schedule = await Timetable.findOne({ studiaRef: this.user.studiaRef })

      if (schedule?.studia) {
        await Users.updateOne(
          { id: this.user.id },
          { "state.studia": schedule.studia, "state.role": TrainerRole.ReadOnly, rating: 0 }
        )
        return await this.next(SelectLocationTrainer)
      }
    }

    if (this.isStudies) {
      return await this.selectStudiaMessage()
    } else {
      return await this.notFoundStudiesMessage()
    }
  }

  async initStudies() {
    const schedules = await Timetable.find({ status: LocationStatus.Ok })
    schedules.forEach(schedule => {
      this.studies.add(schedule.studia)
      this.isStudies = true
    })
  }

  async selectStudiaMessage() {
    const buildStudies = Keyboard.make([...this.studies], { columns: 1 })
    const buildNavigation = Keyboard.make(
      [this.ctx.i18n.t("bAddStudia"), this.ctx.i18n.t("bUpdate")],
      {
        columns: 2,
      }
    )
    const keyboard = Keyboard.combine(buildStudies, buildNavigation).oneTime().reply()

    await this.ctx.reply(this.ctx.i18n.t("selectOrCreateStudia"), keyboard)
    await Users.updateOne({ id: this.user.id }, { "temp.studies": [...this.studies] })
  }

  async notFoundStudiesMessage() {
    const keyboard = Keyboard.make([
      this.ctx.i18n.t("bAddStudia"),
      this.ctx.i18n.t("bUpdate"),
    ]).reply()
    await this.ctx.reply(this.ctx.i18n.t("studiesNotFoundTrainer"), keyboard)
  }
}

import { Keyboard } from "telegram-keyboard"
import { Timetable } from "../../../../../lib/model/timetable"
import { LocationStatus } from "../../../../strings/constants"
import { Scenes } from "../../../settings/scenes"
import { SelectLocationTrainer } from "./SelectLocationTrainer"
import { SelectStudiaTrainer } from "./SelectStudiaTrainer"
import { Users } from "../../../../../lib/model/users"
import { Stats } from "../../../../../lib/model/stats"
import { Scene } from "../../../settings/Scene"
import { Helpers } from "../../../../strings/Helpers"

export class CreateLocationTrainer extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
  }

  async enter() {
    await this.enterMessage()
    await this.changeScene(Scenes.Trainer.TimetableCreate.CreateLocation)
  }

  async enterMessage() {
    const keyboard = Keyboard.make([[this.ctx.i18n.t("bBack")]]).reply()
    await this.ctx.reply(this.ctx.i18n.t("enterLocation"), keyboard)
  }

  async handler() {
    const ACTION_BUTTON_BACK = this.ctx.i18n.t("bBack")
    const tempLocations = this.user.temp?.locations ?? []
    const isLocations = tempLocations.length === 0

    if (!this.payload) {
      return await this.error()
    }

    if (this.payload === ACTION_BUTTON_BACK) {
      if (!isLocations) {
        return await this.next(SelectLocationTrainer)
      } else {
        return await this.next(SelectStudiaTrainer)
      }
    }

    if (this.payload) {
      const studia = this.user.state.studia
      const { description, photos } = this.user.temp

      await Users.updateOne(
        { id: this.user.id },
        { "state.location": this.payload, "temp.registerMode": false }
      )
      await Timetable.create({
        studia,
        description,
        photos,
        location: this.payload,
        status: LocationStatus.Ok,
      })
      await Stats.updateOne({ date: Helpers.getCurrentDayStats() }, { $inc: { newLocations: 1 } })
      await this.next(SelectLocationTrainer)
    } else {
      await this.error()
    }
  }
}

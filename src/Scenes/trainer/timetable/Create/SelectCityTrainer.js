import { Scenes } from "../../../settings/scenes"
import { SelectLocationTrainer } from "./SelectLocationTrainer"
import { Keyboard } from "telegram-keyboard"
import { Users } from "../../../../../lib/model/users"
import { CreateStudiaTrainer } from "./CreateStudiaTrainer"
import { Stats } from "../../../../../lib/model/stats"
import { getCurrentDayStats } from "../../../../strings/constants"
import { Scene } from "../../../settings/Scene"
import { SelectStudiaDescriptionTrainer } from "../../register/SelectStudiaDescriptionTrainer"
import { Helpers } from "../../../../strings/Helpers"

export class SelectCityTrainer extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
  }

  async enter() {
    await this.enterMessage()
    await this.changeScene(Scenes.Trainer.TimetableCreate.SelectCity)
  }

  async enterMessage() {
    const keyboard = Keyboard.make([this.ctx.i18n.t("bBack")]).reply()
    await this.ctx.reply(this.ctx.i18n.t("selectStudiaCity"), keyboard)
  }

  async handler() {
    const ACTION_BUTTON_BACK = this.ctx.i18n.t("bBack")

    if (!this.payload) {
      return await this.error()
    }

    if (this.payload === ACTION_BUTTON_BACK) {
      return await this.next(CreateStudiaTrainer)
    }

    if (this.payload) {
      const studia = this.user.state.studia
      const city = this.createCityName(this.payload)
      const studiaName = `${studia} (${city})`

      await Users.updateOne({ id: this.user.id }, { "state.studia": studiaName })
      await Stats.updateOne({ date: Helpers.getCurrentDayStats() }, { $inc: { newStudies: 1 } })
      await this.next(SelectStudiaDescriptionTrainer)
    } else {
      return await this.error()
    }
  }

  createCityName(city) {
    return city[0].toUpperCase() + city.slice(1).toLowerCase()
  }
}

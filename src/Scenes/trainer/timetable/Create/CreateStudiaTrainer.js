import { Scenes } from "../../../settings/scenes"
import { SelectStudiaTrainer } from "./SelectStudiaTrainer"
import { TrainerRole } from "../../../../strings/constants"
import { Keyboard } from "telegram-keyboard"
import { Users } from "../../../../../lib/model/users"
import { Scene } from "../../../settings/Scene"
import { SelectCityTrainer } from "./SelectCityTrainer"

export class CreateStudiaTrainer extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
  }

  async enter() {
    await this.enterMessage()
    await this.changeScene(Scenes.Trainer.TimetableCreate.CreateStudia)
  }

  async enterMessage() {
    const keyboard = Keyboard.make([this.ctx.i18n.t("bBack")]).reply()

    await this.ctx.reply(this.ctx.i18n.t("enterStudia"), keyboard)
  }

  async handler() {
    const ACTION_BUTTON_BACK = this.ctx.i18n.t("bBack")

    if (!this.payload) {
      return await this.error()
    }

    if (this.payload === ACTION_BUTTON_BACK) {
      return await this.next(SelectStudiaTrainer)
    }

    if (this.payload) {
      await Users.updateOne(
        { id: this.user.id },
        { "state.studia": this.payload, "state.role": TrainerRole.Main, rating: 0 }
      )
      await this.next(SelectCityTrainer)
    } else {
      await this.error()
    }
  }
}

import { Users } from "../../../../lib/model/users"
import { Scenes } from "../../settings/scenes"
import { Scene } from "../../settings/Scene"
import { SelectPhoneTrainer } from "./SelectPhoneTrainer"

export class SelectSurnameTrainer extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
  }

  async enter() {
    await this.enterMessage()
    await this.changeScene(Scenes.Trainer.Register.Surname)
  }

  async enterMessage() {
    await this.ctx.reply(this.ctx.i18n.t("enterSurname"))
  }

  async handler() {
    if (!this.payload) {
      return await this.error()
    }

    if (this.payload) {
      await Users.updateOne({ tgID: this.user.tgID }, { surname: this.payload })
      await this.next(SelectPhoneTrainer)
    }
  }
}

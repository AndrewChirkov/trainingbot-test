import { Users } from "../../../../lib/model/users"
import { Scenes } from "../../settings/scenes"
import { Scene } from "../../settings/Scene"
import { SelectSurnameTrainer } from "./SelectSurnameTrainer"

export class SelectNameTrainer extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
  }

  async enter() {
    await this.enterMessage()
    await this.changeScene(Scenes.Trainer.Register.Name)
  }

  async enterMessage() {
    await this.ctx.reply(this.ctx.i18n.t("enterName"))
  }

  async handler() {
    if (!this.payload) {
      return await this.error()
    }

    if (this.payload) {
      await Users.updateOne({ tgID: this.user.tgID }, { name: this.payload })
      await this.next(SelectSurnameTrainer)
    }
  }
}

import { Scene } from "../../settings/Scene"
import { Scenes } from "../../settings/scenes"
import { EditStudiaMenuTrainer } from "../Edit/EditStudiaMenuTrainer"
import { Users } from "../../../../lib/model/users"
import { SelectStudiaPhotoTrainer } from "./SelectStudiaPhotoTrainer"

export class SelectStudiaDescriptionTrainer extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
  }

  async enter() {
    await this.enterMessage()
    await this.changeScene(Scenes.Trainer.Register.Description)
  }

  async enterMessage() {
    await this.ctx.reply(this.ctx.i18n.t("descriptionStudiaRegister"))
  }

  async handler() {
    if (!this.payload) {
      return await this.error()
    }

    if (this.payload) {
      await this.setDescription()
      return await this.next(SelectStudiaPhotoTrainer)
    }
  }

  async setDescription() {
    const defaultDescription = `${this.user.state.studia}:\n\n`

    await Users.updateOne(
      { id: this.user.id },
      { "temp.description": defaultDescription + this.payload, "temp.registerMode": true }
    )
  }
}

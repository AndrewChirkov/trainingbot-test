import { Users } from "../../../../lib/model/users"
import { Scenes } from "../../settings/scenes"
import { Scene } from "../../settings/Scene"
import { SelectSurnameClient } from "./SelectSurnameClient"

export class SelectNameClient extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
  }

  async enter() {
    await this.enterMessage()
    await this.changeScene(Scenes.Client.Register.Name)
  }

  async enterMessage() {
    await this.ctx.reply(this.ctx.i18n.t("enterName"))
  }

  async handler() {
    if (this.payload) {
      await Users.updateOne({ tgID: this.user.tgID }, { name: this.payload })
      await this.next(SelectSurnameClient)
    } else {
      await this.error()
    }
  }
}

import { Scenes } from "../../settings/scenes"
import { Users } from "../../../../lib/model/users"
import { Scene } from "../../settings/Scene"
import { SelectHeightClient } from "./SelectHeightClient"

export class SelectWeightClient extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
    this.payloadNumber = Number(this.payload)
  }

  async enter() {
    await this.enterMessage()
    await this.changeScene(Scenes.Client.Register.Weight)
  }

  async enterMessage() {
    await this.ctx.reply(this.ctx.i18n.t("enterWeight"))
  }

  async handler() {
    if (this.payloadNumber) {
      await Users.updateOne({ tgID: this.user.tgID }, { weight: this.payload })
      await this.next(SelectHeightClient)
    } else {
      await this.error()
    }
  }
}

import { Users } from "../../../../lib/model/users"
import { Scenes } from "../../settings/scenes"
import { Scene } from "../../settings/Scene"
import { SelectWeightClient } from "./SelectWeigthClient"

export class SelectAgeClient extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
    this.payloadNumber = Number(this.payload)
  }

  async enter() {
    await this.enterMessage()
    await this.changeScene(Scenes.Client.Register.Age)
  }

  async enterMessage() {
    await this.ctx.reply(this.ctx.i18n.t("enterAge"))
  }

  async handler() {
    if (this.payloadNumber) {
      await Users.updateOne({ tgID: this.user.tgID }, { age: this.payload })
      await this.next(SelectWeightClient)
    } else {
      await this.error()
    }
  }
}

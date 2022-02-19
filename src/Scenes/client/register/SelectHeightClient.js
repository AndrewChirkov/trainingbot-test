import { Scenes } from "../../settings/scenes"
import { Users } from "../../../../lib/model/users"
import { Scene } from "../../settings/Scene"
import { SelectPhoneClient } from "./SelectPhoneClient"

export class SelectHeightClient extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
    this.payloadNumber = Number(this.payload)
  }

  async enter() {
    await this.enterMessage()
    await this.changeScene(Scenes.Client.Register.Height)
  }

  async enterMessage() {
    await this.ctx.reply(this.ctx.i18n.t("enterHeight"))
  }

  async handler() {
    if (this.payloadNumber) {
      await Users.updateOne({ tgID: this.user.tgID }, { height: this.payload })
      await this.next(SelectPhoneClient)
    } else {
      await this.error()
    }
  }
}

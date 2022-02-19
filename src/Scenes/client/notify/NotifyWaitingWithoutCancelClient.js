import { Scenes } from "../../settings/scenes"
import { Scene } from "../../settings/Scene"

export class NotifyWaitingWithoutCancelClient extends Scene {
  constructor(user, ctx = null) {
    super(user, ctx)
    this.payload = ctx?.message?.text
  }

  async enter() {
    await this.changeScene(Scenes.Client.Notify.Waiting)
  }

  async handler() {
    if (!this.payload) {
      return await this.error()
    }

    if (this.payload) {
      await this.errorCancel()
    }
  }

  async errorCancel() {
    await this.ctx.reply(this.ctx.i18n.t("cancelTrainingImp"))
  }
}

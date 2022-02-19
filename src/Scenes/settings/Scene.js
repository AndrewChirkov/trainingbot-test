import { Users } from "../../../lib/model/users"

export class Scene {
  constructor(user, ctx) {
    this.user = user
    this.ctx = ctx
    this.language = this.user.language
  }

  async changeScene(scene) {
    await Users.updateOne({ tgID: this.user.tgID }, { scene, refer: this.user.refer })
  }

  async getActualUser() {
    this.user = await Users.findOne({ id: this.user.id })
  }

  async next(NextScene) {
    await this.getActualUser()

    const scene = new NextScene(this.user, this.ctx)
    await scene.enter()
  }

  static async nextOffline(NextScene, user, ctx = null) {
    const scene = new NextScene(user, ctx)
    await scene.enter()
  }

  async error() {
    await this.ctx.reply(this.ctx.i18n.t("notVariableReply"))
  }
}

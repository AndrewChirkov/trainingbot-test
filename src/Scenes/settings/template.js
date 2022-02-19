import { Scene } from "./Scene"

export class TestScene extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
  }

  async enter() {
    await this.enterMessage()
    await this.changeScene("scene")
  }

  async enterMessage() {}

  async handler() {
    if (!this.payload) {
      return await this.error()
    }
  }
}

import { Scene } from "../settings/Scene"
import { Scenes } from "../settings/scenes"
import { Account } from "../../strings/constants"
import { SelectLocationClient } from "../client/register/SelectLocationScene"
import { SelectLocationTrainer } from "../trainer/timetable/Create/SelectLocationTrainer"
import { SelectAccount } from "./SelectAccount"

export class BotUpdate extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
  }

  async enter() {
    await this.changeScene(Scenes.All.Update)
  }

  async handler() {
    const ACTION_BUTTON_UPDATE_BOT = this.ctx.i18n.t("bUpdateBot")

    if (!this.payload) {
      return await this.error()
    }

    if (this.payload === ACTION_BUTTON_UPDATE_BOT) {
      await this.goStartScene()
    }
  }

  async goStartScene() {
    if (this.user.account === Account.Client && this.user.state.location) {
      await this.next(SelectLocationClient)
    } else if (this.user.account === Account.Trainer && this.user.state.location) {
      await this.next(SelectLocationTrainer)
    }

    if (!this.user.account || !this.user.state.location) {
      await this.next(SelectAccount)
    }
  }
}

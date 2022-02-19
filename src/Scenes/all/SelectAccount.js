import { Users } from "../../../lib/model/users"
import { Account } from "../../strings/constants"
import { SelectNameClient } from "../client/register/SelectNameClient"
import { Scenes } from "../settings/scenes"
import { SelectNameTrainer } from "../trainer/register/SelectNameTrainer"
import { Scene } from "../settings/Scene"
import { Keyboard } from "telegram-keyboard"

export class SelectAccount extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
  }

  async enter() {
    await this.enterMessage()
    await this.changeScene(Scenes.All.Account)
  }

  async enterMessage() {
    const keyboard = Keyboard.make([this.ctx.i18n.t("bClient"), this.ctx.i18n.t("bTrainer")], {
      columns: 2,
    })
      .oneTime()
      .reply()
    await this.ctx.reply(this.ctx.i18n.t("selectAccountType"), keyboard)
  }

  async handler() {
    const ACTION_ACCOUNT_CLIENT = this.ctx.i18n.t("bClient")
    const ACTION_ACCOUNT_TRAINER = this.ctx.i18n.t("bTrainer")

    if (!this.payload) {
      return await this.error()
    }

    if (this.payload === ACTION_ACCOUNT_CLIENT) {
      await Users.updateOne({ tgID: this.user.tgID }, { account: Account.Client })
      await this.next(SelectNameClient)
    } else if (this.payload === ACTION_ACCOUNT_TRAINER) {
      await Users.updateOne({ tgID: this.user.tgID }, { account: Account.Trainer })
      await this.next(SelectNameTrainer)
    } else {
      await this.error()
    }
  }
}

import { Markup } from "telegraf"
import { Scenes } from "../../settings/scenes"
import { Users } from "../../../../lib/model/users"
import { SelectStudiaTrainer } from "../timetable/Create/SelectStudiaTrainer"
import { Stats } from "./../../../../lib/model/stats"
import { Scene } from "../../settings/Scene"
import { Keyboard } from "telegram-keyboard"
import { Helpers } from "../../../strings/Helpers"

export class SelectPhoneTrainer extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.phone = ctx.message.contact?.phone_number
  }

  async enter() {
    await this.enterMessage()
    await this.changeScene(Scenes.Trainer.Register.Phone)
  }

  async enterMessage() {
    const keyboard = Keyboard.make([Markup.contactRequestButton(this.ctx.i18n.t("bPhone"))]).reply()
    await this.ctx.reply(this.ctx.i18n.t("enterPhone"), keyboard)
  }

  async handler() {
    if (this.phone) {
      await Users.updateOne({ tgID: this.user.tgID }, { phone: this.phone })
      await Stats.updateOne(
        { date: Helpers.getCurrentDayStats() },
        { $inc: { newTrainers: 1, newUsers: 1 } }
      )

      await this.next(SelectStudiaTrainer)
    } else {
      await this.errorPhone()
    }
  }

  async errorPhone() {
    await this.ctx.reply(this.ctx.i18n.t("phoneValidate"))
  }
}

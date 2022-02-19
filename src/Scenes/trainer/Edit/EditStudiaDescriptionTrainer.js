import { Scene } from "../../settings/Scene"
import { Timetable } from "../../../../lib/model/timetable"
import { Keyboard } from "telegram-keyboard"
import { Scenes } from "../../settings/scenes"
import { EditStudiaMenuTrainer } from "./EditStudiaMenuTrainer"

export class EditStudiaDescriptionTrainer extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
    this.description = null
  }

  async enter() {
    await this.initDescription()
    await this.checkDescription()
    await this.changeScene(Scenes.Trainer.EditStudia.Description)
  }

  async handler() {
    const ACTION_BUTTON_BACK = this.ctx.i18n.t("bBack")

    if (!this.payload) {
      return await this.error()
    }

    if (this.payload === ACTION_BUTTON_BACK) {
      return await this.next(EditStudiaMenuTrainer)
    }

    if (this.payload) {
      await this.setDescription()
      await this.saveDescriptionMessage()
      return await this.next(EditStudiaMenuTrainer)
    }
  }

  async initDescription() {
    const { studia } = this.user.state
    const schedule = await Timetable.findOne({ studia })
    this.description = schedule.description
  }

  async checkDescription() {
    if (this.description) {
      await this.editDescriptionMessage()
    } else {
      await this.notFoundDescriptionMessage()
    }
  }

  async setDescription() {
    const { studia } = this.user.state
    const defaultDescription = `${studia}:\n\n`
    await Timetable.updateMany({ studia }, { description: defaultDescription + this.payload })
  }

  async notFoundDescriptionMessage() {
    const keyboard = Keyboard.make([this.ctx.i18n.t("bBack")]).reply()

    await this.ctx.reply(this.ctx.i18n.t("oldStudiesDescription"), keyboard)
  }

  async editDescriptionMessage() {
    const keyboard = Keyboard.make([this.ctx.i18n.t("bBack")]).reply()

    await this.ctx.reply(this.ctx.i18n.t("descriptionStudia"), keyboard)
  }

  async saveDescriptionMessage() {
    await this.ctx.reply(this.ctx.i18n.t("descriptionUpdated"))
  }
}

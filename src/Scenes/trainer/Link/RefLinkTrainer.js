import { Keyboard } from "telegram-keyboard/lib"
import { Timetable } from "../../../../lib/model/timetable"
import { Scene } from "../../settings/Scene"
import { Scenes } from "../../settings/scenes"
import { MainMenuTrainer } from "../Menu/MainMenuTrainer"
import QRCode from "qrcode"
import fs from "fs"
import { Users } from "../../../../lib/model/users"
import { TrainerRole } from "../../../strings/constants"

export class RefLinkTrainer extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
    this.studiaRef = null
  }

  async enter() {
    await this.initStudiaRef()
    await this.sendQRCodeMessage()
    await this.sendLinkMessage()
    await this.changeScene(Scenes.Trainer.RefLink)
  }

  async initStudiaRef() {
    const { studia } = this.user.state
    const mainTrainer = await Users.findOne(
      { "state.studia": studia, "state.role": TrainerRole.Main },
      { tgID: 1 }
    )
    this.studiaRef = mainTrainer.tgID

    await Timetable.updateMany({ studia }, { studiaRef: this.studiaRef })
  }

  async sendQRCodeMessage() {
    const link = `t.me/go_workout_bot?start=${this.studiaRef}`
    const path = `./storage/${this.studiaRef}.png`

    await QRCode.toFile(path, link, {
      rendererOpts: {
        deflateLevel: 0,
        deflateStrategy: 0,
      },
    })

    await this.ctx.replyWithDocument(
      { source: path },
      { caption: this.ctx.i18n.t("studiaRefQrCode") }
    )

    fs.unlink(path, () => {})
  }

  async sendLinkMessage() {
    const link = `t.me/training_tests_bot?start=${this.studiaRef}`
    const keyboard = Keyboard.make([this.ctx.i18n.t("bBack")]).reply()

    await this.ctx.replyWithMarkdown(this.ctx.i18n.t("studiaRefLink", { link }), keyboard)
  }

  async handler() {
    const ACTION_BUTTON_BACK = this.ctx.i18n.t("bBack")

    if (!this.payload) {
      return await this.error()
    }

    if (this.payload === ACTION_BUTTON_BACK) {
      await this.next(MainMenuTrainer)
    }
  }
}

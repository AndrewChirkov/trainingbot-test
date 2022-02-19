import { Scene } from "../../settings/Scene"
import { Keyboard } from "telegram-keyboard"
import { Scenes } from "../../settings/scenes"
import { EditStudiaDescriptionTrainer } from "./EditStudiaDescriptionTrainer"
import { Timetable } from "../../../../lib/model/timetable"
import { SelectLocationTrainer } from "../timetable/Create/SelectLocationTrainer"
import { EditStudiaPhotoTrainer } from "./EditStudiaPhotoTrainer"

export class EditStudiaMenuTrainer extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
    this.description = null
    this.photos = null
  }

  async enter() {
    await this.initPreview()
    await this.checkPreview()
    await this.enterMessage()
    await this.changeScene(Scenes.Trainer.EditStudia.Menu)
  }

  async enterMessage() {
    const keyboard = Keyboard.make(
      [
        this.ctx.i18n.t("bEditDescription"),
        this.ctx.i18n.t("bEditPhoto"),
        this.ctx.i18n.t("bMainMenu"),
      ],
      { columns: 1 }
    ).reply()

    await this.ctx.reply("Выберите действие", keyboard)
  }

  async handler() {
    const ACTION_EDIT_DESCRIPTION = this.ctx.i18n.t("bEditDescription")
    const ACTION_EDIT_PHOTOS = this.ctx.i18n.t("bEditPhoto")
    const ACTION_BUTTON_BACK = this.ctx.i18n.t("bMainMenu")

    if (!this.payload) {
      return await this.error()
    }

    if (this.payload === ACTION_EDIT_DESCRIPTION) {
      await this.next(EditStudiaDescriptionTrainer)
    } else if (this.payload === ACTION_EDIT_PHOTOS) {
      await this.next(EditStudiaPhotoTrainer)
    } else if (this.payload === ACTION_BUTTON_BACK) {
      await this.next(SelectLocationTrainer)
    }
  }

  async initPreview() {
    const { studia } = this.user.state
    const schedule = await Timetable.findOne({ studia })
    this.description = schedule.description
    this.photos = schedule.photos
  }

  async checkPreview() {
    if (this.photos.length > 0 || this.description) {
      await this.studiaPreviewMessage()
    }
  }

  async studiaPreviewMessage() {
    await this.ctx.reply(this.ctx.i18n.t("previewStudia"))

    if (this.photos.length > 0 && this.description) {
      const photosToSend = this.photos.map(photo => {
        return {
          type: "photo",
          media: photo,
        }
      })
      photosToSend[0].caption = this.description

      return await this.ctx.replyWithMediaGroup(photosToSend)
    }

    if (this.photos.length > 0) {
      const photosToSend = this.photos.map(photo => {
        return {
          type: "photo",
          media: photo,
        }
      })

      return await this.ctx.replyWithMediaGroup(photosToSend)
    }

    if (this.description) {
      return await this.ctx.reply(this.description)
    }
  }
}

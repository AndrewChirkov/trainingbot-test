import { Scene } from "../../settings/Scene"
import { Scenes } from "../../settings/scenes"
import { EditStudiaMenuTrainer } from "./EditStudiaMenuTrainer"
import { Keyboard } from "telegram-keyboard"
import { Timetable } from "../../../../lib/model/timetable"

export class EditStudiaPhotoTrainer extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
    this.photos = []
  }

  async enter() {
    await this.enterMessage()
    await this.changeScene(Scenes.Trainer.EditStudia.Photos)
  }

  async enterMessage() {
    const keyboard = Keyboard.make([this.ctx.i18n.t("bBack")]).reply()
    await this.ctx.reply("Добавьте фотографии Вашей студии. ", keyboard)
  }

  async handler() {
    const ACTION_BUTTON_BACK = this.ctx.i18n.t("bBack")
    const mediaGroup = this.ctx.mediaGroup
    const messagePhoto = this.ctx.message.photo

    if (mediaGroup) {
      for (const message of mediaGroup) {
        this.photos.push(message.photo[message.photo.length - 1].file_id)
      }
      await this.setPhotos()
      await this.next(EditStudiaMenuTrainer)
    }

    if (messagePhoto && !mediaGroup) {
      this.photos.push(messagePhoto[messagePhoto.length - 1].file_id)
      await this.setPhotos()
      await this.next(EditStudiaMenuTrainer)
    }

    if (this.payload === ACTION_BUTTON_BACK) {
      await this.next(EditStudiaMenuTrainer)
    }
  }

  async setPhotos() {
    const { studia } = this.user.state
    await Timetable.updateMany({ studia }, { photos: this.photos })
    await this.savePhotosMessage()
  }

  async savePhotosMessage() {
    await this.ctx.reply("Фотографии Вашей студии успешно обновлены!")
  }
}

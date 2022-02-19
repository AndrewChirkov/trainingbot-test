import { Scene } from "../../settings/Scene"
import { Scenes } from "../../settings/scenes"
import { Keyboard } from "telegram-keyboard"
import { EditStudiaMenuTrainer } from "../Edit/EditStudiaMenuTrainer"
import { Timetable } from "../../../../lib/model/timetable"
import { Users } from "../../../../lib/model/users"
import { SelectLocationTrainer } from "../timetable/Create/SelectLocationTrainer"

export class SelectStudiaPhotoTrainer extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
    this.photos = []
  }

  async enter() {
    await this.enterMessage()
    await this.changeScene(Scenes.Trainer.Register.Photos)
  }

  async enterMessage() {
    await this.ctx.reply(this.ctx.i18n.t("photoStudiaRegister"))
  }

  async handler() {
    const mediaGroup = this.ctx.mediaGroup
    const messagePhoto = this.ctx.message.photo

    if (mediaGroup) {
      for (const message of mediaGroup) {
        this.photos.push(message.photo[message.photo.length - 1].file_id)
      }
      await this.setPhotos()
      await this.next(SelectLocationTrainer)
    }

    if (messagePhoto && !mediaGroup) {
      this.photos.push(messagePhoto[messagePhoto.length - 1].file_id)
      await this.setPhotos()
      await this.next(SelectLocationTrainer)
    }
  }

  async setPhotos() {
    await Users.updateOne({ id: this.user.id }, { "temp.photos": this.photos })
    await this.initPreview()
    await this.studiaPreviewMessage()
  }

  async initPreview() {
    this.description = this.user.temp.description
  }

  async studiaPreviewMessage() {
    await this.ctx.reply("Ваша студия выглядит вот так: ")

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
  }
}

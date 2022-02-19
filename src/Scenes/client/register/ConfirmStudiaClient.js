import { Scene } from "../../settings/Scene"
import { Keyboard } from "telegram-keyboard"
import { Scenes } from "../../settings/scenes"
import { Timetable } from "../../../../lib/model/timetable"
import { SelectStudiaClient } from "./SelectStudiaClient"
import { SelectLocationClient } from "./SelectLocationScene"

export class ConfirmStudiaClient extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
    this.description = null
    this.photos = null
  }

  async enter() {
    await this.initPreview()
    await this.changeScene(Scenes.Client.Register.ConfirmStudia)
    await this.checkPreview()
  }

  async handler() {
    const ACTION_BUTTON_CONTINUE = this.ctx.i18n.t("bContinue")
    const ACTION_CHANGE_STUDIA = "Выбрать другую студию"

    if (!this.payload) {
      return await this.error()
    }

    if (this.payload === ACTION_CHANGE_STUDIA) {
      return await this.next(SelectStudiaClient)
    } else if (this.payload === ACTION_BUTTON_CONTINUE) {
      return await this.next(SelectLocationClient)
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
    } else {
      await this.next(SelectLocationClient)
    }
  }

  async studiaPreviewMessage() {
    const keyboard = Keyboard.make([this.ctx.i18n.t("bContinue"), "Выбрать другую студию"], {
      columns: 1,
    }).reply()

    if (this.photos.length > 0 && this.description) {
      const photosToSend = this.photos.map(photo => {
        return {
          type: "photo",
          media: photo,
        }
      })
      photosToSend[0].caption = this.description

      await this.ctx.replyWithMediaGroup(photosToSend)
      return await this.ctx.reply(`Нажмите "Продолжить" или выберите другую студию.`, keyboard)
    }

    if (this.photos.length > 0) {
      const photosToSend = this.photos.map(photo => {
        return {
          type: "photo",
          media: photo,
        }
      })

      await this.ctx.replyWithMediaGroup(photosToSend, keyboard)
      return await this.ctx.reply(`Нажмите "Продолжить" или выберите другую студию.`, keyboard)
    }

    if (this.description) {
      await this.ctx.reply(this.description)
      return await this.ctx.reply(`Нажмите "Продолжить" или выберите другую студию.`, keyboard)
    }
  }
}

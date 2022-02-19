import { Users } from "../../../../lib/model/users"
import { Scenes } from "../../settings/scenes"
import { Timetable } from "../../../../lib/model/timetable"
import { SelectLocationClient } from "./SelectLocationScene"
import { Keyboard } from "telegram-keyboard"
import { LocationStatus } from "../../../strings/constants"
import { Scene } from "../../settings/Scene"
import { ConfirmStudiaClient } from "./ConfirmStudiaClient"

export class SelectStudiaClient extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
    this.studies = new Set([])
    this.isStudies = false
    this.description = null
    this.photos = null
  }

  async enter() {
    await this.changeScene(Scenes.Client.Booking.SelectStudia)
    await this.initStudies()
    await this.checkStudies()
  }

  async reenter() {
    await this.next(SelectStudiaClient)
  }

  async handler() {
    const ACTION_BUTTON_UPDATE = this.ctx.i18n.t("bUpdate")
    const tempStudies = this.user.temp?.studies ?? []

    if (!this.payload) {
      return await this.error()
    }

    for (const studia of tempStudies) {
      if (this.payload === studia) {
        await Users.updateOne({ id: this.user.id }, { "state.studia": studia })
        return await this.next(ConfirmStudiaClient)
      }
    }

    if (this.payload === ACTION_BUTTON_UPDATE) {
      await this.reenter()
    } else {
      await this.error()
    }
  }

  async initStudies() {
    const schedules = await Timetable.find({ status: LocationStatus.Ok })
    schedules.forEach(schedule => {
      this.studies.add(schedule.studia)
      this.isStudies = true
    })
  }

  async checkStudies() {
    if (this.user.studiaRef) {
      await this.initPreview()
      await this.checkPreview()

      const schedule = await Timetable.findOne({ studiaRef: this.user.studiaRef })

      if (schedule?.studia) {
        await Users.updateOne({ id: this.user.id }, { "state.studia": schedule.studia })
        return await this.next(SelectLocationClient)
      }
    }

    if (this.isStudies) {
      return await this.selectStudiaMessage()
    } else {
      return await this.notFoundStudiesMessage()
    }
  }

  async selectStudiaMessage() {
    const buildNavigation = Keyboard.make([this.ctx.i18n.t("bUpdate")])
    const buildStudies = Keyboard.make([...this.studies], { columns: 2 })
    const keyboard = Keyboard.combine(buildStudies, buildNavigation).reply()

    await this.ctx.reply(this.ctx.i18n.t("selectStudia"), keyboard)
    await Users.updateOne({ id: this.user.id }, { "temp.studies": [...this.studies] })
  }

  async notFoundStudiesMessage() {
    const keyboard = Keyboard.make([this.ctx.i18n.t("bUpdate")]).reply()
    await this.ctx.reply(this.ctx.i18n.t("studiesNotFound"), keyboard)
  }

  async checkPreview() {
    if (this.photos.length > 0 || this.description) {
      await this.studiaPreviewMessage()
    }
  }

  async initPreview() {
    const studiaRef = this.user.studiaRef
    const schedule = await Timetable.findOne({ studiaRef })
    this.description = schedule.description
    this.photos = schedule.photos
  }

  async studiaPreviewMessage() {
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

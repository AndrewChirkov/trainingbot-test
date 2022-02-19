import { Users } from "../../../../lib/model/users"
import { Scenes } from "../../settings/scenes"
import { Timetable } from "../../../../lib/model/timetable"
import { LocationStatus } from "../../../strings/constants"
import { Keyboard } from "telegram-keyboard"
import { Scene } from "../../settings/Scene"
import { BookingSelectDayClient } from "../booking/BookingSelectDayClient"
import { AbonementPreviewClient } from "../Abonement/AbonementPreviewClient"

export class SelectLocationClient extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
    this.locations = new Set([])
  }

  async enter() {
    await this.initLocations()
    await this.selectLocationMessage()
    await this.changeScene(Scenes.Client.Booking.SelectLocation)
  }

  async handler() {
    const ACTION_BUY_ABONEMENT = "💰 Купить абонемент (beta)"
    const tempLocations = this.user.temp?.locations ?? []

    if (!this.payload) {
      return await this.error()
    }

    // if (this.payload === ACTION_BUY_ABONEMENT) {
    //   return await this.next(AbonementPreviewClient)
    // }

    for (const location of tempLocations) {
      if (this.payload === location) {
        await Users.updateOne({ id: this.user.id }, { "state.location": location })
        await this.next(BookingSelectDayClient)
        return
      }
    }

    if (this.payload) {
      return await this.error()
    }
  }

  async initLocations() {
    const { studia } = this.user.state
    const schedules = await Timetable.find({ studia }, { location: 1, status: 1 })

    schedules.forEach(schedule => {
      if (schedule.status === LocationStatus.Ok) {
        this.locations.add(schedule.location)
      }
    })
  }

  async selectLocationMessage() {
    const keyboard = Keyboard.make([...this.locations] /*["💰 Купить абонемент (beta)"] */, {
      columns: 2,
    }).reply()

    await this.ctx.reply(this.ctx.i18n.t("selectLocation"), keyboard)
    await Users.updateOne({ id: this.user.id }, { "temp.locations": [...this.locations] })
  }
}

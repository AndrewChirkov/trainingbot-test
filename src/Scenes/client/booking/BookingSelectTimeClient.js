import { Users } from "../../../../lib/model/users"
import { Timetable } from "../../../../lib/model/timetable"
import { Keyboard } from "telegram-keyboard"
import { BookingSelectDayClient } from "./BookingSelectDayClient"
import { BookingSelectInventoryClient } from "./BookingSelectInventoryClient"
import { Scene } from "../../settings/Scene"
import { Scenes } from "../../settings/scenes"

export class BookingSelectTimeClient extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
    this.timetables = []
    this.times = []
  }

  async enter() {
    await this.initTimetables()
    await this.initTimes()
    await this.selectTimeMessage()
    await this.changeScene(Scenes.Client.Booking.SelectTime)
  }

  async handler() {
    const ACTION_BUTTON_BACK = this.ctx.i18n.t("bBack")
    const tempTimes = this.user.temp?.times

    if (!this.payload) {
      return await this.error()
    }

    if (this.payload === ACTION_BUTTON_BACK) {
      return this.next(BookingSelectDayClient)
    }

    for (let time of tempTimes) {
      if (this.payload === time) {
        const { day, monthDate, year } = this.user.state.select
        const fixTimes = time.split(":")
        const hour = Number(fixTimes[0])
        const min = Number(fixTimes[1])
        const currentMs = Date.now()
        const selectedMs = new Date(year, monthDate, day, hour, min).getTime()

        if (selectedMs < currentMs) {
          return this.next(BookingSelectDayClient)
        }

        await Users.updateOne(
          { id: this.user.id },
          { "state.select.time": time, "state.select.timeMs": selectedMs }
        )
        await this.next(BookingSelectInventoryClient)
      }
    }
  }

  async initTimetables() {
    const { studia, location } = this.user.state
    const schedules = await Timetable.findOne({ studia, location })
    this.timetables = schedules.trainer.timetables
  }

  async initTimes() {
    this.timetables.forEach(timetable => {
      const currentTimeMs = Date.now()
      const timetableTimeMs = timetable.timeMs
      const time = timetable.time
      const selectedDay = this.user.state.select.day
      const selectedMonthReal = this.user.state.select.monthReal
      const equals =
        timetable.day.number === selectedDay && timetable.monthReal === selectedMonthReal

      if (currentTimeMs < timetableTimeMs && equals) {
        this.times.push(time)
      }
    })
  }

  async selectTimeMessage() {
    const buildTimes = Keyboard.make(this.times, { columns: 5 })
    const buildNavigation = Keyboard.make([this.ctx.i18n.t("bBack")])
    const keyboard = Keyboard.combine(buildTimes, buildNavigation).reply()

    await this.ctx.reply(this.ctx.i18n.t("selectClientTime"), keyboard)
    await Users.updateOne({ id: this.user.id }, { "temp.times": this.times })
  }
}

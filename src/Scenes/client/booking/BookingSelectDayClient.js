import { Users } from "../../../../lib/model/users"
import { Scenes } from "../../settings/scenes"
import { Timetable } from "../../../../lib/model/timetable"
import { Keyboard } from "telegram-keyboard"
import { BookingSelectTimeClient } from "./BookingSelectTimeClient"
import { Scene } from "../../settings/Scene"
import { SelectLocationClient } from "../register/SelectLocationScene"
import { Helpers } from "../../../strings/Helpers"

export class BookingSelectDayClient extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
    this.timetables = []
    this.days = new Set([])
    this.viewDays = new Set([])
    this.isDays = false
  }

  async enter() {
    await this.initTimetables()
    await this.initDays()
    await this.checkDays()
    await this.changeScene(Scenes.Client.Booking.SelectDay)
  }

  async reenter() {
    await this.next(BookingSelectDayClient)
  }

  async handler() {
    const ACTION_BUTTON_BACK = this.ctx.i18n.t("bBack")
    const ACTION_BUTTON_UPDATE = this.ctx.i18n.t("bUpdate")
    const tempViewDays = this.user.temp?.viewDays ?? []

    if (!this.payload) {
      return await this.error()
    }

    for (const tempViewDay of tempViewDays) {
      if (this.payload === tempViewDay) {
        const viewDayIndex = tempViewDays.findIndex(day => day === tempViewDay)
        const selectDay = this.user.temp?.days[viewDayIndex]

        await Users.updateOne(
          { id: this.user.id },
          {
            "state.select.day": selectDay.day,
            "state.select.dayOfWeek": selectDay.dayOfWeek,
            "state.select.monthReal": selectDay.month,
            "state.select.monthDate": Helpers.realToDateMonth(selectDay.month),
            "state.select.year": selectDay.year,
          }
        )

        return this.next(BookingSelectTimeClient)
      }
    }

    if (this.payload === ACTION_BUTTON_BACK) {
      await this.next(SelectLocationClient)
    } else if (this.payload === ACTION_BUTTON_UPDATE) {
      await this.reenter()
    } else {
      await this.error()
    }
  }

  async initTimetables() {
    const { studia, location } = this.user.state
    const schedules = await Timetable.findOne({ studia, location })
    this.timetables = schedules?.trainer?.timetables
  }

  async initDays() {
    this.timetables?.forEach(timetable => {
      const currentTimeMs = Date.now()
      const timetableTimeMs = timetable.timeMs
      const countViewDays = this.days.size
      const viewDay = this.createViewDayText(timetable)
      const dayStructObject = {
        day: timetable.day.number,
        dayOfWeek: timetable.day.ofWeek,
        month: timetable.monthReal,
        year: timetable.year,
      }

      if (currentTimeMs < timetableTimeMs && countViewDays < 6) {
        const dayIndex = [...this.viewDays].findIndex(day => day === viewDay)
        if (dayIndex === -1) {
          this.days.add(dayStructObject)
          this.viewDays.add(viewDay)
          this.isDays = true
        }
      }
    })
  }

  async checkDays() {
    if (this.isDays) {
      await this.selectDayMessage()
    } else {
      await this.notFoundDaysMessage()
    }
  }

  async selectDayMessage() {
    const buildDays = Keyboard.make([...this.viewDays], { columns: 2 })
    const buildNavigation = Keyboard.make([this.ctx.i18n.t("bBack")])
    const keyboard = Keyboard.combine(buildDays, buildNavigation).reply()

    await this.ctx.reply(this.ctx.i18n.t("selectClientDayOfWeek"), keyboard)
    await Users.updateOne(
      { id: this.user.id },
      { "temp.days": [...this.days], "temp.viewDays": [...this.viewDays] }
    )
  }

  async notFoundDaysMessage() {
    const keyboard = Keyboard.make([this.ctx.i18n.t("bUpdate"), this.ctx.i18n.t("bBack")], {
      columns: 1,
    }).reply()

    await this.ctx.reply(this.ctx.i18n.t("notFoundTimetables"), keyboard)
  }

  createViewDayText(timetable) {
    const dayOfWeek = timetable.day.ofWeek
    const dayNumber = timetable.day.number
    const monthReal = timetable.monthReal

    return `${Helpers.getDayOfWeek(dayOfWeek, this.ctx)} (${Helpers.timeFix(
      dayNumber
    )}.${Helpers.timeFix(monthReal)})`
  }
}

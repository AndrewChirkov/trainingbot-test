import { Timetable } from "../../../../../lib/model/timetable"
import { timeFix } from "../../../../strings/constants"
import { Scenes } from "../../../settings/scenes"
import { SelectDayTrainer } from "./SelectDayTrainer"
import { Users } from "../../../../../lib/model/users"
import { Scene } from "../../../settings/Scene"
import { ConfirmCreateTimetableTrainer } from "./ConfirmCreateTimetableTrainer"
import { Keyboard } from "telegram-keyboard"
import { Helpers } from "../../../../strings/Helpers"
import { SelectTimetableTrainer } from "./SelectTimetableTrainer"

export class SelectTimeTrainer extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
  }

  async enter() {
    await this.selectTimeMessage()
    await this.changeScene(Scenes.Trainer.TimetableCreate.SelectTime)
  }

  async handler() {
    const tempTimes = this.user.temp.times
    const ACTION_BUTTON_GO_CALENDAR = this.ctx.i18n.t("bGoCalendar")

    if (!this.payload) {
      return await this.error()
    }

    for (const time of tempTimes) {
      if (this.payload === time) {
        const { studia, location } = this.user.state
        const schedule = await Timetable.findOne({ studia, location })
        const timetables = schedule.trainer.timetables
        const isTimetable = timetables.find(timetable => this.equalsTimetable(timetable))

        if (isTimetable) {
          return await this.errorWasCreatedTimetable()
        }

        const { day, monthDate, year } = this.user.state.select
        const fixTimes = time.split(":")
        const hour = Number(fixTimes[0])
        const min = Number(fixTimes[1])

        const currentMs = Date.now()

        const selectedMs = new Date(year, monthDate, day, hour, min).getTime()

        if (currentMs < selectedMs) {
          await Users.updateOne(
            { id: this.user.id },
            { "state.select.time": time, "state.select.timeMs": selectedMs }
          )
          await this.next(SelectTimetableTrainer)
        } else {
          await this.errorAfterTime()
        }
      }
    }

    if (this.payload === ACTION_BUTTON_GO_CALENDAR) {
      return await this.next(SelectDayTrainer)
    } else if (!tempTimes.includes(this.payload)) {
      return await this.setTime()
    }
  }

  async selectTimeMessage() {
    const dayOfWeek = Helpers.getDayOfWeek(this.user.state.select.dayOfWeek, this.ctx)
    const { day, monthReal } = this.user.state.select
    const times = this.getAllTimes()

    const buildTimes = Keyboard.make(times, { columns: 5 })
    const buildNavigation = Keyboard.make([this.ctx.i18n.t("bGoCalendar")])
    const keyboard = Keyboard.combine(buildTimes, buildNavigation).reply()

    await this.ctx.reply(
      this.ctx.i18n.t("selectedDay", {
        dayOfWeek,
        day: Helpers.timeFix(day),
        month: Helpers.timeFix(monthReal),
      }),
      keyboard
    )
    await Users.updateOne({ id: this.user.id }, { "temp.times": times })
  }

  async errorWasCreatedTimetable() {
    await this.ctx.reply(this.ctx.i18n.t("youWasCreatedTimetable"))
  }

  async errorAfterTime() {
    await this.ctx.reply(this.ctx.i18n.t("afterTime"))
  }

  equalsTimetable(timetable) {
    const { day, monthReal, year } = this.user.state.select
    const time = this.payload

    return (
      timetable.day.number === day &&
      timetable.monthReal === monthReal &&
      timetable.year === year &&
      timetable.time === time
    )
  }

  async setTime() {
    const { studia, location } = this.user.state
    const schedule = await Timetable.findOne({ studia, location })
    const timetables = schedule.trainer.timetables
    const isTimetable = timetables.find(timetable => this.equalsTimetable(timetable))

    if (isTimetable) {
      return await this.errorWasCreatedTimetable()
    }

    const { day, monthDate, year } = this.user.state.select
    const fixTimes = this.payload.split(":")
    const hour = Number(fixTimes[0])
    const min = Number(fixTimes[1])

    const currentMs = Date.now()

    const selectedMs = new Date(year, monthDate, day, hour, min).getTime()

    if (hour > 22 || hour < 8 || min > 59 || min < 0 || (hour === 22 && min > 0)) {
      return await this.ctx.reply(this.ctx.i18n.t("errorTime"))
    }

    if (currentMs < selectedMs) {
      await Users.updateOne(
        { id: this.user.id },
        {
          "state.select.time": this.payload,
          "state.select.timeMs": selectedMs,
        }
      )
      await this.next(SelectTimetableTrainer)
    } else {
      await this.errorAfterTime()
    }
  }

  getAllTimes() {
    return [
      "8:00",
      "8:30",
      "9:00",
      "9:30",
      "10:00",
      "10:30",
      "11:00",
      "11:30",
      "12:00",
      "12:30",
      "13:00",
      "13:30",
      "14:00",
      "14:30",
      "15:00",
      "15:30",
      "16:00",
      "16:30",
      "17:00",
      "17:30",
      "18:00",
      "18:30",
      "19:00",
      "19:30",
      "20:00",
      "20:30",
      "21:00",
      "21:30",
      "22:00",
    ]
  }
}

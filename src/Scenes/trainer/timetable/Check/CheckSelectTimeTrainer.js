import { Keyboard } from "telegram-keyboard"
import { Timetable } from "../../../../../lib/model/timetable"
import { Scenes } from "../../../settings/scenes"
import { Users } from "./../../../../../lib/model/users"
import { Scene } from "../../../settings/Scene"
import { CheckSelectDayTrainer } from "./CheckSelectDayTrainer"
import { CheckListOfClientsTrainer } from "./CheckListOfClientsTrainer"
import { realToDateMonth } from "../../../../strings/constants"
import { Helpers } from "../../../../strings/Helpers"

export class CheckSelectTimeTrainer extends Scene {
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
    await this.changeScene(Scenes.Trainer.TimetableCheck.SelectTime)
  }

  async handler() {
    const ACTION_BUTTON_BACK = this.ctx.i18n.t("bBack")
    const tempTimes = this.user.temp?.times

    if (!this.payload) {
      return await this.error()
    }

    if (this.payload === ACTION_BUTTON_BACK) {
      return this.next(CheckSelectDayTrainer)
    }

    for (let time of tempTimes) {
      if (this.payload === time) {
        const { day, month, year } = this.user.state.check
        const fixTimes = time.split(":")
        const hour = Number(fixTimes[0])
        const min = Number(fixTimes[1])
        const selectedMs = new Date(year, Helpers.realToDateMonth(month), day, hour, min).getTime()

        await Users.updateOne(
          { id: this.user.id },
          { "state.check.time": time, "state.check.timeMs": selectedMs }
        )
        await this.next(CheckListOfClientsTrainer)
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
      const currentTimeMs = Date.now() - 36000000 // Последние 10 часов
      const timetableTimeMs = timetable.timeMs
      const time = timetable.time
      const selectedDay = this.user.state.check.day
      const selectedMonth = this.user.state.check.month
      const equals = timetable.day.number === selectedDay && timetable.monthReal === selectedMonth

      if (currentTimeMs < timetableTimeMs && equals) {
        this.times.push(time)
      }
    })
  }

  async selectTimeMessage() {
    const buildTimes = Keyboard.make(this.times, { columns: 5 })
    const buildNavigation = Keyboard.make([this.ctx.i18n.t("bBack")])
    const keyboard = Keyboard.combine(buildTimes, buildNavigation).reply()

    await this.ctx.reply(this.ctx.i18n.t("checkSelectTime"), keyboard)
    await Users.updateOne({ id: this.user.id }, { "temp.times": this.times })
  }
}

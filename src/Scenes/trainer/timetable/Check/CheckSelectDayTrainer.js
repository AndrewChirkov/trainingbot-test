import { Keyboard } from "telegram-keyboard"
import { Timetable } from "../../../../../lib/model/timetable"
import { Scenes } from "../../../settings/scenes"
import { MainMenuTrainer } from "../../Menu/MainMenuTrainer"
import { Users } from "../../../../../lib/model/users"
import { Scene } from "../../../settings/Scene"
import { CheckSelectTimeTrainer } from "./CheckSelectTimeTrainer"
import { Helpers } from "../../../../strings/Helpers"

export class CheckSelectDayTrainer extends Scene {
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
    await this.changeScene(Scenes.Trainer.TimetableCheck.SelectDay)
  }

  async handler() {
    const ACTION_BUTTON_MAIN_MENU = this.ctx.i18n.t("bMainMenu")
    const tempViewDays = this.user.temp?.viewDays

    if (!this.payload) {
      return await this.error()
    }

    if (this.payload === ACTION_BUTTON_MAIN_MENU) {
      return await this.next(MainMenuTrainer)
    }

    for (let tempViewDay of tempViewDays) {
      if (this.payload === tempViewDay) {
        const viewDayIndex = tempViewDays.findIndex(day => day === tempViewDay)
        const selectDay = this.user.temp?.days[viewDayIndex]

        await Users.updateOne(
          { id: this.user.id },
          {
            "state.check.day": selectDay.day,
            "state.check.month": selectDay.month,
            "state.check.year": selectDay.year,
          }
        )
        await this.next(CheckSelectTimeTrainer)
      }
    }
  }

  async initTimetables() {
    const { studia, location } = this.user.state
    const schedules = await Timetable.findOne({ studia, location })
    this.timetables = schedules.trainer.timetables
  }

  async initDays() {
    this.timetables.forEach(timetable => {
      const currentTimeMs = Date.now() - 36000000 // Последние 10 часов
      const timetableTimeMs = timetable.timeMs
      const countViewDays = this.days.size
      const viewDay = this.createViewDayText(timetable)
      const dayStructObject = {
        day: timetable.day.number,
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
    const buildNavigation = Keyboard.make([this.ctx.i18n.t("bMainMenu")])
    const keyboard = Keyboard.combine(buildDays, buildNavigation).reply()

    await this.ctx.reply(this.ctx.i18n.t("checkSelectDate"), keyboard)
    await Users.updateOne(
      { id: this.user.id },
      { "temp.days": [...this.days], "temp.viewDays": [...this.viewDays] }
    )
  }

  async notFoundDaysMessage() {
    const keyboard = Keyboard.make([this.ctx.i18n.t("bMainMenu")]).reply()

    await this.ctx.reply(this.ctx.i18n.t("notFoundTimetablesCheck"), keyboard)
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

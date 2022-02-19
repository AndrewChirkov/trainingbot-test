import { Users } from "../../../../lib/model/users"
import { Scenes } from "../../settings/scenes"
import { Keyboard } from "telegram-keyboard"
import { Timetable } from "../../../../lib/model/timetable"
import { Scene } from "../../settings/Scene"
import { MessagesSelectTimeTrainer } from "./MessagesSelectTimeTrainer"
import { MainMenuTrainer } from "../Menu/MainMenuTrainer"
import { Helpers } from "../../../strings/Helpers"

export class MessagesSelectDayTrainer extends Scene {
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
    await this.changeScene(Scenes.Trainer.Messages.SelectDayTraining)
  }

  async handler() {
    const ACTION_BUTTON_MAIN_MENU = this.ctx.i18n.t("bMainMenu")
    const tempMessagesDays = this.user.temp?.messages?.viewDays ?? []

    if (!this.payload) {
      return await this.error()
    }

    if (this.payload === ACTION_BUTTON_MAIN_MENU) {
      return await this.next(MainMenuTrainer)
    }

    for (let tempMessagesDay of tempMessagesDays) {
      if (this.payload === tempMessagesDay) {
        let dayMessagesIndex = tempMessagesDays.findIndex(day => day === tempMessagesDay)
        const viewDaysMessages = this.user.temp.messages.days[dayMessagesIndex]

        await Users.updateOne(
          { id: this.user.id },
          {
            "state.messages.day": viewDaysMessages.day,
            "state.messages.month": viewDaysMessages.month,
            "state.messages.year": viewDaysMessages.year,
          }
        )

        return await this.next(MessagesSelectTimeTrainer)
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
      const currentTimeMs = Date.now()
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

    await this.ctx.reply(this.ctx.i18n.t("selectDateTraining"), keyboard)
    await Users.updateOne(
      { id: this.user.id },
      { "temp.messages.days": [...this.days], "temp.messages.viewDays": [...this.viewDays] }
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

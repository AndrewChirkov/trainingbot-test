import { schedule } from "node-cron"
import { Users } from "../../lib/model/users"
import { errorHandler } from "../handlers"
import { bot, i18n } from "../main"
import { Helpers } from "../strings/Helpers"
import { Crons } from "./Crons"

export class CronAbonement extends Crons {
  constructor(user) {
    super(user)
    this.cancel = {
      hours: 0,
      day: 0,
      month: 0,
    }
  }

  async start() {
    this.init()
    await this.addCrons()
    await this.create()
  }

  async create() {
    this.setExpression()
    this.task = schedule(this.expression, this.end.bind(this))
    this.task.start()
    this.task.id = this.user.tgID
    this.task.type = "ABONEMENT"
  }

  async end() {
    try {
      await this.removeCrons()
      await this.getActualUser()
      await this.expiredAbonementMessage()
      this.task.stop()
    } catch (e) {
      await errorHandler(e, null, this.user)
    }
  }

  init() {
    const selectedTimeMs = this.user.state.abonement.select.timeMs
    const selectedYear = this.generateYearFromDate(selectedTimeMs)
    const selectedHours = this.generateHoursFromDate(selectedTimeMs)
    let selectedDay = this.generateDayFromDate(selectedTimeMs)
    const selectedMonthReal = this.generateMonthFromDate(selectedTimeMs) + 1
    let selectedNextMonthReal = selectedMonthReal + 1
    const selectedMonthDate = this.generateMonthFromDate(selectedTimeMs)
    const selectedNextMonthDate = selectedMonthDate + 1
    const selectedMinutes = this.generateMinsFromDate(selectedTimeMs)

    const lastDayMonth = Helpers.daysInMonth(selectedMonthDate, selectedYear)
    const lastDayNextMonth = Helpers.daysInMonth(selectedNextMonthDate, selectedYear)

    if (selectedDay === lastDayMonth) {
      selectedDay = lastDayNextMonth
    }

    if (selectedMonthReal >= 12) {
      selectedNextMonthReal = 1
    }

    this.exp.mins = selectedMinutes
    this.exp.hours = selectedHours
    this.exp.day = selectedDay
    this.exp.month = selectedNextMonthReal // через 1 месяц
  }

  async expiredAbonementMessage() {
    const abonementDays = this.user.abonementDays
    if (abonementDays > 0) {
      await bot.telegram.sendMessage(this.user.tgID, i18n.t(this.user.language, "expiredAbonement"))
      await Users.updateOne({ id: this.user.id }, { abonementDays: 0 })
    }
  }

  async addCrons() {
    await Users.updateOne(
      { id: this.user.id },
      {
        "state.abonement.notify": true,
        "state.abonement.activated": true,
      }
    )
  }

  async removeCrons() {
    await Users.updateOne(
      { id: this.user.id },
      {
        "state.abonement.notify": false,
      }
    )
  }
}

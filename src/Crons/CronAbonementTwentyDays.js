import { schedule } from "node-cron"
import { Users } from "../../lib/model/users"
import { errorHandler } from "../handlers"
import { bot, i18n } from "../main"
import { Helpers } from "../strings/Helpers"
import { Crons } from "./Crons"

export class CronAbonementTwentyDays extends Crons {
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
      await this.expiringAbonementMessage()
      this.task.stop()
    } catch (e) {
      await errorHandler(e, null, this.user)
    }
  }

  init() {
    const selectedTimeMs = this.user.state.abonement.select.timeMs
    const selectedYear = this.generateYearFromDate(selectedTimeMs)
    const selectedHours = this.generateHoursFromDate(selectedTimeMs)
    let selectedDay = this.generateDayFromDate(selectedTimeMs) + 20
    let selectedMonthReal = this.generateMonthFromDate(selectedTimeMs) + 1
    let selectedNextMonthReal = selectedMonthReal + 1
    const selectedMonthDate = this.generateMonthFromDate(selectedTimeMs)

    const lastDayMonth = Helpers.daysInMonth(selectedMonthDate, selectedYear)

    if (selectedDay > lastDayMonth) {
      selectedMonthReal = selectedNextMonthReal
      selectedDay = selectedDay - lastDayMonth
    }

    if (selectedMonthReal >= 12) {
      selectedNextMonthReal = 1
    }

    this.exp.mins = 0
    this.exp.hours = 1
    this.exp.day = selectedDay
    this.exp.month = selectedMonthReal
  }

  async expiringAbonementMessage() {
    const abonementDays = this.user.abonementDays
    if (abonementDays > 0) {
      await bot.telegram.sendMessage(this.user.tgID, i18n.t(this.user.language, "notifyTwelveDays"))
    }
  }

  async addCrons() {
    await Users.updateOne(
      { id: this.user.id },
      {
        "state.abonement.notifyTwentyDays": true,
      }
    )
  }

  async removeCrons() {
    await Users.updateOne(
      { id: this.user.id },
      {
        "state.abonement.notifyTwentyDays": false,
      }
    )
  }
}

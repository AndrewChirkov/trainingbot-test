import { Crons } from "./Crons"
import { schedule } from "node-cron"
import { Scene } from "../Scenes/settings/Scene"
import { NotifyTrainingClient } from "../Scenes/client/notify/NotifyTrainingClient"
import { Users } from "../../lib/model/users"
import { daysInMonth } from "../strings/constants"
import { BookingNextTrainingClient } from "../Scenes/client/booking/BookingNextTrainingClient"
import { errorHandler } from "../handlers"
import { Helpers } from "../strings/Helpers"

export class CronNextTraining extends Crons {
  constructor(user) {
    super(user)
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
    this.task.type = "TRAINING"
  }

  async end() {
    try {
      await this.removeCrons()
      await this.getActualUser()
      await Scene.nextOffline(BookingNextTrainingClient, this.user)
      this.task.stop()
    } catch (e) {
      await errorHandler(e, null, this.user)
    }
  }

  init() {
    const selectedTimeMs = this.user.state.select.timeMs
    const selectedHours = this.generateHoursFromDate(selectedTimeMs)
    const selectedDay = this.generateDayFromDate(selectedTimeMs)
    const selectedMonthReal = this.generateMonthFromDate(selectedTimeMs) + 1
    const selectedMinutes = this.generateMinsFromDate(selectedTimeMs)
    const selectedYear = this.generateYearFromDate(selectedTimeMs)

    const lastDayInMonth = Helpers.daysInMonth(selectedMonthReal, selectedYear)

    if (selectedDay === lastDayInMonth) {
      this.exp.day = 1
      this.exp.month = selectedMonthReal + 1
    } else {
      this.exp.day = selectedDay + 1 // + 1
      this.exp.month = selectedMonthReal
    }

    this.exp.mins = 0
    this.exp.hours = 12
  }

  async addCrons() {
    await Users.updateOne(
      { id: this.user.id },
      {
        "crons.notifyNextDay": true,
      }
    )
  }

  async removeCrons() {
    await Users.updateOne(
      { id: this.user.id },
      {
        "crons.notifyNextDay": false,
      }
    )
  }
}

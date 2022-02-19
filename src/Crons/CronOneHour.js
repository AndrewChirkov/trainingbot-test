import { Crons } from "./Crons"
import { schedule } from "node-cron"
import { Scene } from "../Scenes/settings/Scene"
import { Users } from "../../lib/model/users"
import { NotifyOneHourClient } from "../Scenes/client/notify/NotifyOneHourClient"
import { CronEndTraining } from "./CronEndTraining"
import { errorHandler } from "../handlers"

export class CronOneHour extends Crons {
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
    this.task.type = "TRAINING"
  }

  async end() {
    try {
      await this.removeCrons()
      await this.getActualUser()
      await this.next(CronEndTraining)
      await Scene.nextOffline(NotifyOneHourClient, this.user, null)
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

    this.exp.mins = selectedMinutes // 0
    this.exp.hours = selectedHours - 1 // -1
    this.exp.day = selectedDay
    this.exp.month = selectedMonthReal
  }

  async addCrons() {
    await Users.updateOne(
      { id: this.user.id },
      {
        "crons.notifyOneHour": true,
      }
    )
  }

  async removeCrons() {
    await Users.updateOne(
      { id: this.user.id },
      {
        "crons.notifyOneHour": false,
      }
    )
  }
}

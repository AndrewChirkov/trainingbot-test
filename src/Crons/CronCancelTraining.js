import { Crons } from "./Crons"
import { schedule } from "node-cron"
import { Scene } from "../Scenes/settings/Scene"
import { NotifyOneHourClient } from "../Scenes/client/notify/NotifyOneHourClient"
import { Users } from "../../lib/model/users"
import { NotifyWaitingWithoutCancelClient } from "../Scenes/client/notify/NotifyWaitingWithoutCancelClient"
import { errorHandler } from "../handlers"

export class CronCancelTraining extends Crons {
  constructor(user) {
    super(user)
    this.cancel = {
      hours: 0,
      day: 0,
      month: 0,
    }
  }

  async start() {
    await this.getActualUser()
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
      await Scene.nextOffline(NotifyWaitingWithoutCancelClient, this.user)
      this.task.stop()
    } catch (e) {
      await errorHandler(e, null, this.user)
    }
  }

  init() {
    const { hours, day, month } = this.user.state.cancel
    this.exp.mins = 0
    this.exp.hours = hours
    this.exp.day = day
    this.exp.month = month
  }

  async addCrons() {
    await Users.updateOne(
      { id: this.user.id },
      {
        "crons.cancelTraining": true,
      }
    )
  }

  async removeCrons() {
    await Users.updateOne(
      { id: this.user.id },
      {
        "crons.cancelTraining": false,
      }
    )
  }
}

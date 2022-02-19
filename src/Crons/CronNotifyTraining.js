import { Crons } from "./Crons"
import { schedule } from "node-cron"
import { Users } from "../../lib/model/users"
import { Scene } from "../Scenes/settings/Scene"
import { NotifyTrainingClient } from "../Scenes/client/notify/NotifyTrainingClient"
import { CronCancelTraining } from "./CronCancelTraining"
import { CronEndTraining } from "./CronEndTraining"
import { CronOneHour } from "./CronOneHour"
import { errorHandler } from "../handlers"
import { Helpers } from "../strings/Helpers"

export class CronNotifyTraining extends Crons {
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
    await this.init()
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
      await this.next(CronOneHour)
      await Scene.nextOffline(NotifyTrainingClient, this.user)
      this.task.stop()
    } catch (e) {
      await errorHandler(e, null, this.user)
    }
  }

  async init() {
    const currentTimeMs = this.user.state.booking.lastBooking
    const selectedTimeMs = this.user.state.select.timeMs
    const currentDate = this.generateDayTimeFromDate(currentTimeMs)
    const selectedDate = this.generateDayTimeFromDate(selectedTimeMs)

    const currentHours = this.generateHoursFromDate(currentTimeMs)
    const selectedHours = this.generateHoursFromDate(selectedTimeMs)

    const selectedYear = this.generateYearFromDate(selectedTimeMs)
    const selectedDay = this.generateDayFromDate(selectedTimeMs)

    const selectedMonthReal = this.generateMonthFromDate(selectedTimeMs) + 1

    this.exp.mins = 0
    this.exp.hours = 0
    this.exp.day = selectedDay
    this.exp.month = selectedMonthReal

    if (currentDate === selectedDate) {
      if (selectedHours >= 15 && currentHours < 9) {
        this.exp.hours = 9 // 9
        this.cancel.hours = 12 // 12
        this.cancel.day = selectedDay
        this.cancel.month = selectedMonthReal
        await this.setCancelTime()
        await this.next(CronCancelTraining)
      } else {
        if (currentTimeMs > selectedTimeMs - 3600000 /*3600000*/) {
          await this.correctAbonementDays()
          return await this.next(CronEndTraining)
        } else {
          return await this.next(CronOneHour)
        }
      }
    }

    if (currentDate < selectedDate) {
      if (selectedHours >= 15) {
        this.exp.hours = 9 // 9
        this.exp.day = selectedDay // 0
        this.cancel.day = selectedDay // 0
        this.cancel.hours = 12 // 12
        this.cancel.month = selectedMonthReal
        await this.setCancelTime()
        await this.next(CronCancelTraining)
      } else {
        if (selectedDay === 1) {
          const prevMonthReal = selectedMonthReal - 1
          const lastDayPrevMonth = Helpers.daysInMonth(prevMonthReal, selectedYear)

          this.exp.day = lastDayPrevMonth
          this.exp.month = prevMonthReal

          if (currentHours >= 21 /*21*/) {
            this.exp.hours = 9 // 9
            this.cancel.day = selectedDay
            this.cancel.hours = 12 // 12
            this.cancel.month = selectedMonthReal
            await this.setCancelTime()
            await this.next(CronCancelTraining)
          }

          if (currentHours < 21 /*21*/) {
            this.exp.hours = 21 //21
            this.cancel.day = lastDayPrevMonth
            this.cancel.hours = 23 // 23
            this.cancel.month = selectedMonthReal
            await this.setCancelTime()
            await this.next(CronCancelTraining)
          }
        } else {
          if (currentHours >= 21 /*21*/) {
            this.exp.hours = 9 // 9
            this.cancel.day = selectedDay
            this.cancel.hours = 12 // 12
            this.cancel.month = selectedMonthReal
            await this.setCancelTime()
            await this.next(CronCancelTraining)
          }

          if (currentHours < 21 /*21*/) {
            this.exp.hours = 21 //21
            this.exp.day = selectedDay - 1
            this.cancel.day = selectedDay - 1
            this.cancel.hours = 23 // 23
            this.cancel.month = selectedMonthReal
            await this.setCancelTime()
            await this.next(CronCancelTraining)
          }
        }
      }
    }

    await this.addCrons()
    await this.create()
  }

  async setCancelTime() {
    await Users.updateOne(
      { id: this.user.id },
      {
        "state.cancel": this.cancel,
      }
    )
  }

  async addCrons() {
    await Users.updateOne(
      { id: this.user.id },
      {
        "crons.notifyTraining": true,
      }
    )
  }

  async removeCrons() {
    await Users.updateOne(
      { id: this.user.id },
      {
        "crons.notifyTraining": false,
      }
    )
  }

  async correctAbonementDays() {
    await Users.updateOne(
      { id: this.user.id },
      {
        $inc: {
          abonementDays: -1,
        },
      }
    )
  }
}

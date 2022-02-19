import { Users } from "../../lib/model/users"
import { getTasks } from "node-cron"

export class Crons {
  constructor(user) {
    this.user = user
    this.task = null
    this.exp = {
      mins: "*",
      hours: "*",
      day: "*",
      month: "*",
      dayOfWeek: "*",
    }
    this.expression = `* * * * *`
  }

  setExpression() {
    const { mins, hours, day, month, dayOfWeek } = this.exp
    this.expression = `${mins} ${hours} ${day} ${month} ${dayOfWeek}`
  }

  async getActualUser() {
    this.user = await Users.findOne({ id: this.user.id })
  }

  async next(NextCron) {
    await new NextCron(this.user).start()
  }

  static clear(tgID) {
    const tasks = getTasks() ?? []

    tasks.forEach(task => {
      if (task.id === tgID && task.type === "TRAINING") {
        task.stop()
      }
    })
  }

  static clearAbonement(tgID) {
    const tasks = getTasks() ?? []

    tasks.forEach(task => {
      if (task.id === tgID && task.type === "ABONEMENT") {
        task.stop()
      }
    })
  }

  generateDayTimeFromDate(timeMs) {
    const date = new Date(timeMs)
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  }

  generateHoursFromDate(timeMs) {
    return new Date(timeMs).getHours()
  }

  generateMonthFromDate(timeMs) {
    return new Date(timeMs).getMonth()
  }

  generateYearFromDate(timeMs) {
    return new Date(timeMs).getFullYear()
  }

  generateDayFromDate(timeMs) {
    return new Date(timeMs).getDate()
  }

  generateMinsFromDate(timeMs) {
    return new Date(timeMs).getMinutes()
  }
}

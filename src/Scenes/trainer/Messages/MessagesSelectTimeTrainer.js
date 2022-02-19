import { Users } from "../../../../lib/model/users"
import { Scenes } from "../../settings/scenes"
import { Timetable } from "../../../../lib/model/timetable"
import { Keyboard } from "telegram-keyboard"
import { Scene } from "../../settings/Scene"
import { realToDateMonth } from "../../../strings/constants"
import { MessagesSelectDayTrainer } from "./MessagesSelectDayTrainer"
import { MessageSendAllTrainingTrainer } from "./MessageSendAllTrainingTrainer"
import { Helpers } from "../../../strings/Helpers"

export class MessagesSelectTimeTrainer extends Scene {
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
    await this.changeScene(Scenes.Trainer.Messages.SelectTimeTraining)
  }

  async handler() {
    const ACTION_BUTTON_BACK = this.ctx.i18n.t("bBack")
    const tempMessagesTimes = this.user.temp?.messages?.times
    if (!this.payload) {
      return await this.error()
    }

    if (this.payload === ACTION_BUTTON_BACK) {
      return this.next(MessagesSelectDayTrainer)
    }

    for (let tempMessagesTime of tempMessagesTimes) {
      if (this.payload === tempMessagesTime) {
        const { day, month, year } = this.user.state.messages
        const fixTimes = tempMessagesTime.split(":")
        const hour = Number(fixTimes[0])
        const min = Number(fixTimes[1])
        const selectedMs = new Date(year, Helpers.realToDateMonth(month), day, hour, min).getTime()

        await Users.updateOne(
          { id: this.user.id },
          { "state.messages.time": tempMessagesTime, "state.messages.timeMs": selectedMs }
        )
        await this.next(MessageSendAllTrainingTrainer)
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
      const currentTimeMs = Date.now()
      const timetableTimeMs = timetable.timeMs
      const time = timetable.time
      const selectedDay = this.user.state.messages.day
      const selectedMonth = this.user.state.messages.month
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
    await Users.updateOne({ id: this.user.id }, { "temp.messages.times": this.times })
  }
}

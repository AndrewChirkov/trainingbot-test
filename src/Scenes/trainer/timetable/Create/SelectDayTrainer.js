import { Calendar } from "calendar"
import { Timetable } from "../../../../../lib/model/timetable"
import { Scenes } from "../../../settings/scenes"
import { SelectPrevTimetablesTrainer } from "./SelectPrevTimetablesTrainer"
import { SelectTimeTrainer } from "./SelectTimeTrainer"
import { Users } from "../../../../../lib/model/users"
import { Keyboard } from "telegram-keyboard"
import { Scene } from "../../../settings/Scene"
import { SelectMonthTrainer } from "./SelectMonthTrainer"
import { Helpers } from "../../../../strings/Helpers"

export class SelectDayTrainer extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
    this.calendar = []
    this.selectedDay = null
  }

  async enter() {
    await this.initCalendar()
    await this.selectDayMessage()
    await this.changeScene(Scenes.Trainer.TimetableCreate.SelectDay)
  }

  async handler() {
    const ACTION_BUTTON_BACK = this.ctx.i18n.t("bBack")
    const tempCalendar = this.user.temp?.calendar
    const trueCalendar = this.getTrueCalendar()

    if (!this.payload) {
      return await this.error()
    }

    if (this.payload === ACTION_BUTTON_BACK) {
      return await this.next(SelectMonthTrainer)
    }

    for (const days of tempCalendar) {
      for (const selectedDay of days) {
        if (this.payload === selectedDay) {
          for (const selectedTrueDay of trueCalendar) {
            if (this.payload === selectedTrueDay) {
              this.selectedDay = Number(selectedDay)
              const currentMs = Date.now()
              const currentDay = new Date().getDate()
              const { year, monthReal, monthDate } = this.user.state.select
              const selectedMs = new Date(year, monthDate, this.selectedDay).getTime()
              const dayOfWeek = new Date(year, monthDate, this.selectedDay).getDay()

              if (currentMs > selectedMs && currentDay > this.selectedDay) {
                return await this.errorAfterDay()
              }

              await Users.updateOne(
                { id: this.user.id },
                {
                  "state.select.day": this.selectedDay,
                  "state.select.dayOfWeek": dayOfWeek,
                }
              )

              const prevTimetables = await this.getPrevTimetables()

              if (prevTimetables) {
                await Users.updateOne(
                  { id: this.user.id },
                  {
                    "state.prevTimetables": prevTimetables,
                    $push: {
                      "temp.prevOffer": { day: this.selectedDay, month: monthReal },
                    },
                  }
                )
                return await this.next(SelectPrevTimetablesTrainer)
              }
              await this.next(SelectTimeTrainer)
            }
          }
        }
      }
    }
  }

  async getPrevTimetables() {
    const prevTimetables = []
    const prevOffer = this.user.temp.prevOffer ?? []
    const { year, monthReal, monthDate } = this.user.state.select
    let isOffer = true

    for (let offer of prevOffer) {
      if (offer.day === this.selectedDay && offer.month === monthReal) {
        isOffer = false
        return null
      }
    }

    const { studia, location } = this.user.state
    const schedules = await Timetable.findOne({ studia, location })
    const timetables = schedules.trainer.timetables

    timetables.forEach(timetable => {
      const dayOfWeek = new Date(year, monthDate, this.selectedDay).getDay()
      const selectedMs = new Date(year, monthDate, this.selectedDay).getTime()
      const lastWeekMs = selectedMs - 604800000 // последняя неделя
      const time = timetable.time
      const fixTimes = time.split(":")
      const hour = Number(fixTimes[0])
      const min = Number(fixTimes[1])
      const selectTimeMs = new Date(year, monthDate, this.selectedDay, hour, min).getTime()
      const prevTimetableEquals =
        timetable.day.ofWeek === dayOfWeek &&
        timetable.timeMs > lastWeekMs &&
        timetable.day.number != this.selectedDay

      if (prevTimetableEquals) {
        const newTimetable = {
          year: year,
          monthReal: monthReal,
          monthDate: monthDate,
          day: {
            ofWeek: dayOfWeek,
            number: this.selectedDay,
          },
          timeMs: selectTimeMs,
          time: time,
          inventory: timetable.inventory,
          inventoryUsing: timetable.inventoryUsing,
          maxClientsUsing: timetable.maxClientsUsing,
          maxClients: timetable.maxClients,
          trainer: timetable.trainer,
          clients: [],
          rates: [],
        }
        prevTimetables.push(newTimetable)
      }
    })

    if (prevTimetables.length !== 0) {
      return prevTimetables
    } else {
      return null
    }
  }

  async initCalendar() {
    const { year, monthDate } = this.user.state.select

    const cal = new Calendar(1)
    const days = cal.monthDays(year, monthDate)
    const daysOfShorts = this.getShortDays()

    for (let i = 0; i < days.length; i++) {
      this.calendar.push(days[i])
    }

    this.calendar.push(daysOfShorts)
    this.calendar.unshift(daysOfShorts)
  }

  async selectDayMessage() {
    const keyboard = Keyboard.make([...this.calendar, [this.ctx.i18n.t("bBack")]]).reply()

    await this.ctx.reply(this.ctx.i18n.t("selectDay"), keyboard)
    await Users.updateOne({ id: this.user.id }, { "temp.calendar": this.calendar })
  }

  async errorAfterDay() {
    await this.ctx.reply(this.ctx.i18n.t("afterDay"))
  }

  getTrueCalendar() {
    return [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
      "13",
      "14",
      "15",
      "16",
      "17",
      "18",
      "19",
      "20",
      "21",
      "22",
      "23",
      "24",
      "25",
      "26",
      "27",
      "28",
      "29",
      "30",
      "31",
    ]
  }

  getShortDays() {
    return [
      Helpers.getDayOfShorts(1, this.ctx),
      Helpers.getDayOfShorts(2, this.ctx),
      Helpers.getDayOfShorts(3, this.ctx),
      Helpers.getDayOfShorts(4, this.ctx),
      Helpers.getDayOfShorts(5, this.ctx),
      Helpers.getDayOfShorts(6, this.ctx),
      Helpers.getDayOfShorts(0, this.ctx),
    ]
  }
}

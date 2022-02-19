import { Timetable } from "../../../../../lib/model/timetable"
import { Scenes } from "../../../settings/scenes"
import { SelectDayTrainer } from "./SelectDayTrainer"
import { Users } from "../../../../../lib/model/users"
import { Stats } from "../../../../../lib/model/stats"
import { Scene } from "../../../settings/Scene"
import { Keyboard } from "telegram-keyboard"
import { SelectTimeTrainer } from "./SelectTimeTrainer"
import { Helpers } from "../../../../strings/Helpers"
import { StudiaStats } from "../../../../../lib/model/studies-stats"

export class SelectPrevTimetablesTrainer extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
    this.prevTimetables = user.state.prevTimetables
  }

  async enter() {
    await this.selectPrevTimetablesMessage()
    await this.changeScene(Scenes.Trainer.TimetableCreate.PrevTimetable)
  }

  async handler() {
    const ACTION_BUTTON_USE_OLD_TIMETABLE = this.ctx.i18n.t("bUseOldTimetable")
    const ACTION_BUTTON_USE_NEW_TIMETABLE = this.ctx.i18n.t("bUseNewTimetable")
    const ACTION_BUTTON_BACK = this.ctx.i18n.t("bBack")

    if (!this.payload) {
      return await this.error()
    }

    switch (this.payload) {
      case ACTION_BUTTON_USE_OLD_TIMETABLE:
        await this.useOldTimetable()
        break
      case ACTION_BUTTON_USE_NEW_TIMETABLE:
        await this.next(SelectTimeTrainer)
        break
      case ACTION_BUTTON_BACK:
        await this.next(SelectDayTrainer)
        break
      default:
        await this.error()
        break
    }
  }

  async useOldTimetable() {
    const { studia, location } = this.user.state

    await this.successOldTimetableMessage()
    await Timetable.updateOne(
      { studia, location },
      { $push: { "trainer.timetables": { $each: this.prevTimetables } } }
    )
    await Users.updateOne({ id: this.user.id }, { "state.prevTimetables": [] })
    await Stats.updateOne(
      { date: Helpers.getCurrentDayStats() },
      { $inc: { createTrainings: this.prevTimetables.length } }
    )
    await StudiaStats.updateOne(
      { date: Helpers.getCurrentDayStats(), studia, location },
      { $inc: { createTrainings: this.prevTimetables.length } }
    )
    await this.next(SelectDayTrainer)
  }

  async selectPrevTimetablesMessage() {
    const { day, monthReal } = this.user.state.select
    const dayOfWeek = Helpers.getDayOfWeek(this.user.state.select.dayOfWeek, this.ctx)
    const viewTimes = this.createViewTimes()

    const keyboard = Keyboard.make([
      [this.ctx.i18n.t("bUseOldTimetable")],
      [this.ctx.i18n.t("bUseNewTimetable")],
      [this.ctx.i18n.t("bBack")],
    ]).reply()

    await this.ctx.reply(
      this.ctx.i18n.t("oldTimetable", {
        dayOfWeek,
        day: Helpers.timeFix(day),
        month: Helpers.timeFix(monthReal),
        times: viewTimes,
      }),
      keyboard
    )
  }

  async successOldTimetableMessage() {
    await this.ctx.reply(this.ctx.i18n.t("successOldTimetable"))
  }

  createViewTimes() {
    let times = ""
    this.prevTimetables.forEach(timetable => {
      times += `\n${Helpers.emojiTimes(timetable.time)} ${timetable.time}`
    })
    return times
  }
}

import { Timetable } from "../../../../../lib/model/timetable"
import { timeFix } from "../../../../strings/constants"
import { Scenes } from "../../../settings/scenes"
import { MainMenuTrainer } from "../../Menu/MainMenuTrainer"
import { SelectTimeTrainer } from "./SelectTimeTrainer"
import { Users } from "../../../../../lib/model/users"
import { Keyboard } from "telegram-keyboard"
import { getCurrentDayStats } from "../../../../strings/constants"
import { Stats } from "../../../../../lib/model/stats"
import { Scene } from "../../../settings/Scene"
import { Helpers } from "../../../../strings/Helpers"
import { StudiaStats } from "../../../../../lib/model/studies-stats"

export class ConfirmCreateTimetableTrainer extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
    this.newTimetable = null
  }

  async enter() {
    await this.initTimetable()
    await this.selectNewTimetableMessage()
    await this.changeScene(Scenes.Trainer.TimetableCreate.ConfirmTimetable)
  }

  async handler() {
    const ACTION_BUTTON_CONFIRM = this.ctx.i18n.t("bConfirm")
    const ACTION_BUTTON_EDIT = this.ctx.i18n.t("bEdit")

    if (!this.payload) {
      return await this.error()
    }

    if (this.payload === ACTION_BUTTON_EDIT) {
      return await this.next(SelectTimeTrainer)
    } else if (this.payload === ACTION_BUTTON_CONFIRM) {
      const { location, studia, timetable } = this.user.state

      await this.successCreatedMessage()
      await Timetable.updateOne(
        { location, studia },
        { $push: { "trainer.timetables": timetable } }
      )
      await Stats.updateOne(
        { date: Helpers.getCurrentDayStats() },
        { $inc: { createTrainings: 1 } }
      )
      await StudiaStats.updateOne(
        { date: Helpers.getCurrentDayStats(), studia, location },
        { $inc: { createTrainings: 1 } }
      )
      await this.next(MainMenuTrainer)
    } else {
      return await this.error()
    }
  }

  async initTimetable() {
    const { inventoryUsing, maxClientsUsing } = this.user.state
    const { inventory, maxClients } = this.user.state
    const { time, timeMs, day, dayOfWeek, monthReal, monthDate, year, trainer } =
      this.user.state.select

    this.newTimetable = {
      year,
      monthReal,
      monthDate,
      timeMs,
      time,
      inventory,
      maxClients,
      inventoryUsing: inventoryUsing === true ? true : false,
      maxClientsUsing: maxClientsUsing === true ? true : false,
      trainer,
      day: {
        ofWeek: dayOfWeek,
        number: day,
      },
      rates: [],
      clients: [],
    }

    await Users.updateOne({ id: this.user.id }, { "state.timetable": this.newTimetable })
  }

  async successCreatedMessage() {
    await this.ctx.reply(this.ctx.i18n.t("timetableWasCreated"))
  }

  async selectNewTimetableMessage() {
    const dayOfWeek = this.user.state.select.dayOfWeek
    const trainer = this.user.state.select.trainer
    const detailsView = this.createDetailsUsingView()
    const timetableView = {
      ...this.newTimetable,
      "day.number": Helpers.timeFix(this.newTimetable.day.number),
      monthReal: Helpers.timeFix(this.newTimetable.monthReal),
    }

    const keyboard = Keyboard.make([this.ctx.i18n.t("bConfirm"), this.ctx.i18n.t("bEdit")], {
      columns: 1,
    }).reply()

    await this.ctx.reply(
      this.ctx.i18n.t("confirmTimetable", {
        dayOfWeek: Helpers.getDayOfWeek(dayOfWeek, this.ctx),
        timetable: timetableView,
        trainer,
        inventoryString: detailsView,
      }),
      keyboard
    )
  }

  createDetailsUsingView() {
    const { inventory, maxClients } = this.user.state
    const { inventoryUsing, maxClientsUsing } = this.user.state

    if (inventoryUsing) {
      let inventoryView = this.ctx.i18n.t("inventory")

      inventory.forEach(item => {
        if (item.count > 0) {
          inventoryView += `${item.name} - ${item.count}\n`
        }
      })

      return inventoryView
    }

    if (maxClientsUsing) {
      return ""
    }
  }
}

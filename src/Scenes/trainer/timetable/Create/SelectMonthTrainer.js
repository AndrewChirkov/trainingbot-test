import { Scenes } from "../../../settings/scenes"
import { dateToRealMonth } from "../../../../strings/constants"
import { Users } from "../../../../../lib/model/users"
import { Keyboard } from "telegram-keyboard"
import { realToDateMonth } from "../../../../strings/constants"
import { Scene } from "../../../settings/Scene"
import { SelectInventoryTrainer } from "./SelectInventoryTrainer"
import { SelectDayTrainer } from "./SelectDayTrainer"
import { Helpers } from "../../../../strings/Helpers"

export class SelectMonthTrainer extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
    this.date = new Date()
    this.months = []
  }

  async enter() {
    await this.initMonths()
    await this.selectMonthMessage()
    await this.changeScene(Scenes.Trainer.TimetableCreate.SelectMonth)
  }

  async handler() {
    const ACTION_BUTTON_BACK = this.ctx.i18n.t("bBack")
    const tempMonths = this.user.state.months

    if (!this.payload) {
      return await this.error()
    }

    if (this.payload === ACTION_BUTTON_BACK) {
      return await this.next(SelectInventoryTrainer)
    }

    for (let month of tempMonths) {
      if (this.payload === month.name) {
        await Users.updateOne(
          { id: this.user.id },
          {
            "state.select.year": month.year,
            "state.select.monthReal": month.number,
            "state.select.monthDate": Helpers.realToDateMonth(month.number),
          }
        )
        await this.next(SelectDayTrainer)
      }
    }
  }

  async initMonths() {
    this.months = this.generateMonthsStruct()
  }

  async selectMonthMessage() {
    const [currentMonth, nextMonth] = this.months
    const keyboard = Keyboard.make([currentMonth.name, nextMonth.name, this.ctx.i18n.t("bBack")], {
      columns: 1,
    }).reply()

    await this.ctx.reply(this.ctx.i18n.t("selectMonth"), keyboard)
    await Users.updateOne({ id: this.user.id }, { "state.months": this.months })
  }

  generateMonthsStruct() {
    const currentYear = this.date.getFullYear()
    let currentMonthNumber = Helpers.dateToRealMonth(this.date.getMonth())
    let nextMonthNumber = Helpers.dateToRealMonth(this.date.getMonth()) + 1

    let currentMonthStruct = {
      number: currentMonthNumber,
      name: Helpers.getMonthName(currentMonthNumber, this.ctx),
      year: currentYear,
    }
    let nextMonthStruct = {
      number: nextMonthNumber,
      name: Helpers.getMonthName(nextMonthNumber, this.ctx),
      year: currentYear,
    }

    if (nextMonthNumber === 13) {
      nextMonthStruct.number = 1
      nextMonthStruct.year += 1
      nextMonthStruct.name = Helpers.getMonthName(nextMonthStruct.number, this.ctx)
    }

    return [currentMonthStruct, nextMonthStruct]
  }
}

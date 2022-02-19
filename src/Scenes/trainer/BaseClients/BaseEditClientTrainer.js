import { Users } from "../../../../lib/model/users"
import { Scenes } from "../../settings/scenes"
import { Keyboard } from "telegram-keyboard"
import { i18n } from "../../../main"
import { Scene } from "../../settings/Scene"
import { BaseAllClientsTrainer } from "./BaseAllClientsTrainer"
import { Crons } from "../../../Crons/Crons"

export class BaseEditClientTrainer extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
    this.editClient = null
  }

  async enter() {
    await this.enterMessage()
    await this.changeScene(Scenes.Trainer.Clients.EditClient)
  }

  async enterMessage() {
    const buildCorrectDays = Keyboard.make([
      this.ctx.i18n.t("bAdd1Day"),
      this.ctx.i18n.t("bAdd7Days"),
      this.ctx.i18n.t("bAdd12Days"),
      this.ctx.i18n.t("bRemOneDay"),
    ])
    const buildNavigation = Keyboard.make([this.ctx.i18n.t("bToRefreshList")])
    const keyboard = Keyboard.combine(buildCorrectDays, buildNavigation).reply()

    await this.ctx.reply(this.ctx.i18n.t("editCountDays"), keyboard)
  }

  async handler() {
    const ACTION_BUTTON_ADD_1_DAY = this.ctx.i18n.t("bAdd1Day")
    const ACTION_BUTTON_ADD_7_DAYS = this.ctx.i18n.t("bAdd7Days")
    const ACTION_BUTTON_ADD_12_DAYS = this.ctx.i18n.t("bAdd12Days")
    const ACTION_BUTTON_REMOVE_1_DAY = this.ctx.i18n.t("bRemOneDay")
    const ACTION_BUTTON_TO_REFRESH_LIST = this.ctx.i18n.t("bToRefreshList")
    this.editClient = this.user.temp.editClient

    if (!this.payload) {
      return await this.error()
    }

    if (this.payload === ACTION_BUTTON_TO_REFRESH_LIST) {
      await this.clearPagination()
      return await this.next(BaseAllClientsTrainer)
    }

    if (this.payload === ACTION_BUTTON_ADD_1_DAY) {
      await this.addOneDayMessage()
    } else if (this.payload === ACTION_BUTTON_ADD_12_DAYS) {
      await this.addTwelveDaysMessage()
    } else if (this.payload === ACTION_BUTTON_ADD_7_DAYS) {
      await this.addSevenDaysMessage()
    } else if (this.payload === ACTION_BUTTON_REMOVE_1_DAY) {
      await this.removeOneDayMessage()
    }
  }

  async clearPagination() {
    await Users.updateOne(
      { id: this.user.id },
      {
        "temp.listOfClients": false,
        "temp.currentPage": null,
        "temp.clientsData": null,
        "temp.allPages": null,
      }
    )
  }

  async addOneDayMessage() {
    await Users.updateOne({ tgID: this.editClient }, { $inc: { abonementDays: 1 } })
    const nowUser = await Users.findOne(
      { tgID: this.editClient },
      { abonementDays: 1, language: 1 }
    )

    this.ctx.telegram
      .sendMessage(
        this.editClient,
        i18n.t(nowUser.language, "addAbonementDays", {
          countPrice: 1,
          countDays: nowUser.abonementDays,
        })
      )
      .catch(e => console.log(e))
    await this.ctx.reply(this.ctx.i18n.t("add1DayTrainer"))
  }

  async addSevenDaysMessage() {
    await this.startAbonement(7)
    const nowUser = await Users.findOne(
      { tgID: this.editClient },
      { abonementDays: 1, language: 1 }
    )

    this.ctx.telegram
      .sendMessage(
        this.editClient,
        i18n.t(nowUser.language, "addAbonementDays", {
          countPrice: 7,
          countDays: nowUser.abonementDays,
        })
      )
      .catch(e => console.log(e))
    await this.ctx.reply(this.ctx.i18n.t("add7DaysTrainer"))
  }

  async addTwelveDaysMessage() {
    await this.startAbonement(12)
    const nowUser = await Users.findOne(
      { tgID: this.editClient },
      { abonementDays: 1, language: 1 }
    )

    this.ctx.telegram
      .sendMessage(
        this.editClient,
        i18n.t(nowUser.language, "addAbonementDays", {
          countPrice: 12,
          countDays: nowUser.abonementDays,
        })
      )
      .catch(e => console.log(e))

    await this.ctx.reply(this.ctx.i18n.t("add12DaysTrainer"))
  }

  async removeOneDayMessage() {
    await Users.updateOne({ tgID: this.editClient }, { $inc: { abonementDays: -1 } })
    const nowUser = await Users.findOne(
      { tgID: this.editClient },
      { abonementDays: 1, language: 1 }
    )

    this.ctx.telegram
      .sendMessage(
        this.editClient,
        i18n.t(nowUser.language, "remAbonementDays", { countDays: nowUser.abonementDays })
      )
      .catch(e => console.log(e))

    await this.ctx.reply(this.ctx.i18n.t("remDaysTrainer"))
  }

  async startAbonement(days) {
    await Users.updateOne(
      { tgID: this.editClient },
      {
        $inc: { abonementDays: days },
        "state.abonement.activated": false,
        "state.abonement.notify": false,
        "state.abonement.notifyTwentyDays": false,
        "state.abonement.select": {},
      }
    )

    Crons.clearAbonement(this.editClient)
  }
}

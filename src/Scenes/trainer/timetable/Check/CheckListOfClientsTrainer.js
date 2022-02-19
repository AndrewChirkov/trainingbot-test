import { Key, Keyboard } from "telegram-keyboard"
import { Timetable } from "../../../../../lib/model/timetable"
import { TrainerRole } from "../../../../strings/constants"
import { Scenes } from "../../../settings/scenes"
import { MainMenuTrainer } from "../../Menu/MainMenuTrainer"
import { Users } from "../../../../../lib/model/users"
import { Scene } from "../../../settings/Scene"
import { CheckRatesTrainer } from "./CheckRatesTrainer"
import { Helpers } from "../../../../strings/Helpers"

export class CheckListOfClientsTrainer extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
    this.queryPayload = Number(ctx.callbackQuery?.data)
    this.timetable = null
    this.clients = []
    this.clientsView = []
    this.inventoryView = ""
    this.clientsCount = null
    this.isClients = false
    this.tempClients = []
  }

  async enter() {
    await this.initClients()
    await this.checkIsClients()
    await this.changeScene(Scenes.Trainer.TimetableCheck.ListOfClients)
  }

  async reenter() {
    await this.next(CheckListOfClientsTrainer)
  }

  async handler() {
    const ACTION_BUTTON_MAIN_MENU = this.ctx.i18n.t("bMainMenu")
    const ACTION_BUTTON_REVIEWS = this.ctx.i18n.t("bReviews")
    const ACTION_BUTTON_UPDATE = this.ctx.i18n.t("bUpdate")
    const ACTION_BUTTON_DELETE = this.ctx.i18n.t("bDeleteTimetable")
    this.tempClients = this.user.state.check?.clients ?? []

    if (this.payload === ACTION_BUTTON_MAIN_MENU) {
      await Users.updateOne({ id: this.user.id }, { "state.check": {} })
      return await this.next(MainMenuTrainer)
    } else if (this.payload === ACTION_BUTTON_REVIEWS) {
      return await this.next(CheckRatesTrainer)
    } else if (this.payload === ACTION_BUTTON_UPDATE) {
      return await this.reenter()
    } else if (this.payload === ACTION_BUTTON_DELETE) {
      await this.deleteTimetable()
    }

    for (const client of this.tempClients) {
      if (this.queryPayload === client.tgID) {
        await this.viewClientDetailsInfo(client)
      }
    }

    if (!this.payload && !this.queryPayload) {
      return await this.error()
    }
  }

  async initClients() {
    const { studia, location } = this.user.state
    const { timeMs } = this.user.state.check
    const schedule = await Timetable.findOne({ studia, location })

    this.timetable = schedule.trainer.timetables.find(timetable => timetable.timeMs === timeMs)
    this.clients = this.timetable.clients
    this.clientsCount = this.clients.length

    if (this.clientsCount > 0) {
      this.isClients = true
      this.createClientsView()
    }
  }

  async selectClientMessage() {
    const keyboardClients = Keyboard.make(this.clientsView, { columns: 1 }).inline()
    await this.ctx.reply(
      this.ctx.i18n.t("pressForDetails") + this.ctx.i18n.t("listOfClients"),
      keyboardClients
    )
    await Users.updateOne({ id: this.user.id }, { "state.check.clients": this.clients })
  }

  async notFoundClientsMessage() {
    const { role } = this.user.state
    const keyboard = Keyboard.make(
      [
        this.ctx.i18n.t("bMainMenu"),
        Helpers.checkRole(role) ? this.ctx.i18n.t("bDeleteTimetable") : "",
      ],
      {
        columns: 1,
      }
    ).reply()

    await this.ctx.reply(this.ctx.i18n.t("forNowNotTimetables"), keyboard)
  }

  async useInventoryMessage() {
    const keyboard = Keyboard.make([
      [this.ctx.i18n.t("bUpdate")],
      [this.ctx.i18n.t("bReviews")],
      [this.ctx.i18n.t("bMainMenu")],
    ]).reply()

    await this.ctx.reply(
      `${this.ctx.i18n.t("inventoryRemaining")}\n\n${this.inventoryView}`,
      keyboard
    )
  }

  async useMaxClientsMessage() {
    const { maxClients } = this.timetable
    const keyboard = Keyboard.make([
      [this.ctx.i18n.t("bUpdate")],
      [this.ctx.i18n.t("bReviews")],
      [this.ctx.i18n.t("bMainMenu")],
    ]).reply()

    await this.ctx.reply(`${this.ctx.i18n.t("clientsRemaining", { maxClients })}`, keyboard)
  }

  async checkWhatUsing() {
    const { inventoryUsing, maxClientsUsing, inventory } = this.timetable

    if (inventoryUsing) {
      this.createInventoryView(inventory)
      await this.useInventoryMessage()
    }

    if (maxClientsUsing) {
      await this.useMaxClientsMessage()
    }
  }

  async checkIsClients() {
    if (this.isClients) {
      await this.selectClientMessage()
      await this.checkWhatUsing()
    } else {
      await this.notFoundClientsMessage()
    }
  }

  async viewClientDetailsInfo(client) {
    const role = this.user.state.role
    const selectItem = client.selectItem
      ? this.ctx.i18n.t("selectedItem", { selectItem: client.selectItem })
      : ``
    await this.ctx.answerCbQuery(
      `${client.name} ${client.surname}\n${
        role === TrainerRole.Main ? client.phone : this.ctx.i18n.t("phoneHide")
      }\n${this.ctx.i18n.t("ageInfo", { age: client.age })}\n${client.weight} кг\n${
        client.height
      } см\n${selectItem}`,
      true
    )
  }

  async deleteTimetable() {
    const { studia, location } = this.user.state
    const { timeMs } = this.user.state.check
    const schedule = await Timetable.findOne({ studia, location })
    const timetable = schedule.trainer.timetables.find(timetable => timetable.timeMs === timeMs)
    const timetableIndex = schedule.trainer.timetables.findIndex(
      timetable => timetable.timeMs === timeMs
    )
    if (timetable.clients.length > 0) {
      return await this.errorDeletedMessage()
    } else {
      schedule.trainer.timetables.splice(timetableIndex, 1)
      await schedule.save()
      await this.successfullyDeleteMessage()
      return await this.next(MainMenuTrainer)
    }
  }

  async errorDeletedMessage() {
    await this.ctx.reply(this.ctx.i18n.t("notDeleteTimetableWithClients"))
  }

  async successfullyDeleteMessage() {
    await this.ctx.reply(this.ctx.i18n.t("successfullyDeletedTimetable"))
  }

  createInventoryView(inventory) {
    inventory.forEach(item => {
      this.inventoryView += `${item.name} - ${item.count}\n`
    })
  }

  createClientsView() {
    let clientNumber = 0
    this.clients.forEach(client => {
      clientNumber += 1
      this.clientsView.push(
        Key.callback(
          `${clientNumber}. ${client.name} ${client.surname} ${
            client.selectItem ? "- " + client.selectItem : ""
          }`,
          client.tgID
        )
      )
    })
  }
}

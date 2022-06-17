import { Users } from "../../../../lib/model/users"
import { Account, TrainerRole } from "../../../strings/constants"
import { Scenes } from "../../settings/scenes"
import chunk from "chunk"
import { Key, Keyboard } from "telegram-keyboard"
import { MainMenuTrainer } from "../Menu/MainMenuTrainer"
import { Scene } from "../../settings/Scene"
import { BaseEditClientTrainer } from "./BaseEditClientTrainer"

export class BaseAllClientsTrainer extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.queryPayload = ctx.callbackQuery?.data
    this.payload = ctx.message?.text
    this.currentPage = 1
    this.selectedPage = 0
    this.countPages = 0
    this.listOfClients = false
    this.clientsCount = 0
    this.clientsData = []
    this.clientsView = []
    this.clients = []
  }

  async enter() {
    await this.initClients()
    await this.initPagination()
    await this.checkCountClients()
    await this.updatePagination()
    await this.changeScene(Scenes.Trainer.Clients.AllClients)
  }

  async reenter() {
    await this.next(BaseAllClientsTrainer)
  }

  async handler() {
    const ACTION_BUTTON_MAIN_MENU = this.ctx.i18n.t("bMainMenu")
    const ACTION_NEXT_PAGE = "➡️"
    const ACTION_PREV_PAGE = "⬅️"
    const ACTION_FIRST_PAGE = "⏪"
    const ACTION_LAST_PAGE = "⏩"

    const { currentPage, allPages, clientsData } = this.user.temp
    const { role } = this.user.state

    if (this.payload === ACTION_BUTTON_MAIN_MENU) {
      await this.clearPagination()
      return await this.next(MainMenuTrainer)
    }

    if (role === TrainerRole.Main) {
      for (let clientData of clientsData) {
        if (this.queryPayload === String(clientData.tgID)) {
          await this.setEditingClient(clientData.tgID)
          await this.next(BaseEditClientTrainer)
          return await this.ctx.answerCbQuery()
        }
      }
    }

    if (this.queryPayload === ACTION_PREV_PAGE) {
      if (currentPage > 1) {
        await Users.updateOne({ id: this.user.id }, { "temp.currentPage": currentPage - 1 })
        await this.reenter()
      }
      return await this.ctx.answerCbQuery()
    } else if (this.queryPayload === ACTION_NEXT_PAGE) {
      if (currentPage < allPages) {
        await Users.updateOne({ id: this.user.id }, { "temp.currentPage": currentPage + 1 })
        await this.reenter()
      }
      return await this.ctx.answerCbQuery()
    } else if (this.queryPayload === ACTION_FIRST_PAGE) {
      if (currentPage !== 1) {
        await Users.updateOne({ id: this.user.id }, { "temp.currentPage": 1 })
        await this.reenter()
      }
      return await this.ctx.answerCbQuery()
    } else if (this.queryPayload === ACTION_LAST_PAGE) {
      if (this.currentPage !== allPages) {
        await Users.updateOne({ id: this.user.id }, { "temp.currentPage": allPages })
        await this.reenter()
      }
      return await this.ctx.answerCbQuery()
    }
  }

  async initClients() {
    const { studia } = this.user.state
    this.listOfClients = this.user.temp.listOfClients
    this.clients = await Users.find({ account: Account.Client, "state.studia": studia })

    this.clients.forEach(client => {
      const { name, surname, tgID, abonementDays } = client
      this.clientsData.push({ name, surname, tgID, abonementDays })
      this.clientsCount += 1
    })

    this.clientsData.sort(this.sortClients)
  }

  async initPagination() {
    this.currentPage = this.user.temp.currentPage ?? 1
    this.selectedPage = this.currentPage - 1
    this.clientsChunk = chunk(this.clientsData, 10)
    this.countPages = this.clientsChunk.length

    for (let client of this.clientsChunk[this.selectedPage] ?? []) {
      this.clientsView.push(
        Key.callback(
          `${client.name} ${client.surname} (${this.ctx.i18n.t("countDays", {
            count: client.abonementDays,
          })})`,
          client.tgID
        )
      )
    }
  }

  async checkCountClients() {
    if (this.clientsCount > 0) {
      await this.selectClientMessage()
    } else {
      await this.notFoundClientsMessage()
    }
  }

  sortClients(x, y){
    if (x.name < y.name) {return -1;}
    if (x.name > y.name) {return 1;}
    return 0;
  }

  async selectClientMessage() {
    const buildClients = Keyboard.make(this.clientsView, { columns: 1 })
    const buildNavigation = Keyboard.make([ "⏪", "⬅️", `${this.currentPage}/${this.countPages}`, "➡️", "⏩"], {
      columns: 5,
    })
    const keyboard = Keyboard.combine(buildClients, buildNavigation).inline()
    const keyboardBack = Keyboard.make([this.ctx.i18n.t("bMainMenu")])
      .oneTime()
      .reply()

    if (!this.listOfClients) {
      await this.ctx.reply(this.ctx.i18n.t("tapToClient"), keyboardBack)
      await this.ctx.reply(this.ctx.i18n.t("allClients"), keyboard)
    } else {
      await this.ctx.editMessageReplyMarkup(keyboard.reply_markup)
    }
  }

  async notFoundClientsMessage() {
    const keyboard = Keyboard.make([this.ctx.i18n.t("bMainMenu")])
      .oneTime()
      .reply()
    await this.ctx.reply(this.ctx.i18n.t("notFountClients"), keyboard)
  }

  async updatePagination() {
    await Users.updateOne(
      { id: this.user.id },
      {
        "temp.listOfClients": true,
        "temp.currentPage": this.currentPage,
        "temp.clientsData": this.clientsData,
        "temp.allPages": this.countPages,
      }
    )
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

  async setEditingClient(tgID) {
    await Users.updateOne(
      { id: this.user.id },
      {
        "temp.editClient": tgID,
        "temp.listOfClients": false,
        "temp.currentPage": null,
        "temp.clientsData": null,
        "temp.allPages": null,
      }
    )
  }
}

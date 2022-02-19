import { Users } from "../../../../lib/model/users"
import { Scenes } from "../../settings/scenes"
import { Key } from "telegram-keyboard"
import { chunk } from "chunk"
import { Keyboard } from "telegram-keyboard"
import { Account } from "../../../strings/constants"
import { BaseEditClientTrainer } from "../BaseClients/BaseEditClientTrainer"
import { Scene } from "../../settings/Scene"
import { MessagesSelectTypeTrainer } from "./MessagesSelectTypeTrainer"
import { MessagesSendOneUserTrainer } from "./MessagesSendOneUserTrainer"

export class MessagesSelectOneUserTrainer extends Scene {
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
    await this.changeScene(Scenes.Trainer.Messages.SelectOneUser)
  }

  async reenter() {
    await this.next(MessagesSelectOneUserTrainer)
  }

  async handler() {
    const ACTION_BUTTON_BACK = this.ctx.i18n.t("bBack")
    const ACTION_NEXT_PAGE = "➡️"
    const ACTION_PREV_PAGE = "⬅️"
    const { currentPage, allPages, clientsData } = this.user.temp.messages

    if (this.payload === ACTION_BUTTON_BACK) {
      await this.clearPagination()
      return await this.next(MessagesSelectTypeTrainer)
    }

    for (let clientData of clientsData) {
      if (this.queryPayload === String(clientData.tgID)) {
        await this.setMessageClient(clientData.tgID)
        await this.next(MessagesSendOneUserTrainer)
        return await this.ctx.answerCbQuery()
      }
    }

    if (this.queryPayload === ACTION_PREV_PAGE) {
      if (currentPage > 1) {
        await Users.updateOne(
          { id: this.user.id },
          { "temp.messages.currentPage": currentPage - 1 }
        )
        await this.reenter()
      }
      return await this.ctx.answerCbQuery()
    } else if (this.queryPayload === ACTION_NEXT_PAGE) {
      if (currentPage < allPages) {
        await Users.updateOne(
          { id: this.user.id },
          { "temp.messages.currentPage": currentPage + 1 }
        )
        await this.reenter()
      }
      return await this.ctx.answerCbQuery()
    } else {
      return await this.ctx.answerCbQuery()
    }
  }

  async initClients() {
    const { studia } = this.user.state
    this.listOfClients = this.user.temp?.messages?.listOfClients
    this.clients = await Users.find({ account: Account.Client, "state.studia": studia })

    if (this.clients.length > 0) {
      this.clients.forEach(client => {
        const { name, surname, tgID, abonementDays } = client
        this.clientsData.push({ name, surname, tgID, abonementDays })
        this.clientsCount += 1
      })
    }
  }

  async initPagination() {
    this.currentPage = this.user.temp?.messages?.currentPage ?? 1
    this.selectedPage = this.currentPage - 1
    this.clientsChunk = chunk(this.clientsData, 5)
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

  async selectClientMessage() {
    const buildClients = Keyboard.make(this.clientsView, { columns: 1 })
    const buildNavigation = Keyboard.make(["⬅️", `${this.currentPage}/${this.countPages}`, "➡️"], {
      columns: 3,
    })
    const keyboard = Keyboard.combine(buildClients, buildNavigation).inline()
    const keyboardBack = Keyboard.make([this.ctx.i18n.t("bBack")])
      .oneTime()
      .reply()

    if (!this.listOfClients) {
      await this.ctx.reply(this.ctx.i18n.t("tapToUserMessage"), keyboardBack)
      await this.ctx.reply(this.ctx.i18n.t("allClients"), keyboard)
    } else {
      await this.ctx.editMessageReplyMarkup(keyboard.reply_markup)
    }
  }

  async notFoundClientsMessage() {
    const keyboard = Keyboard.make([this.ctx.i18n.t("bBack")])
      .oneTime()
      .reply()
    await this.ctx.reply(this.ctx.i18n.t("notMessagesClients"), keyboard)
  }

  async updatePagination() {
    await Users.updateOne(
      { id: this.user.id },
      {
        "temp.messages.listOfClients": true,
        "temp.messages.currentPage": this.currentPage,
        "temp.messages.clientsData": this.clientsData,
        "temp.messages.allPages": this.countPages,
      }
    )
  }

  async clearPagination() {
    await Users.updateOne(
      { id: this.user.id },
      {
        "temp.messages.listOfClients": false,
        "temp.messages.currentPage": null,
        "temp.messages.clientsData": null,
        "temp.messages.allPages": null,
      }
    )
  }

  async setMessageClient(tgID) {
    await Users.updateOne(
      { id: this.user.id },
      {
        "temp.messages.editClient": tgID,
        "temp.messages.listOfClients": false,
        "temp.messages.currentPage": null,
        "temp.messages.clientsData": null,
        "temp.messages.allPages": null,
      }
    )
  }
}

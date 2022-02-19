import { Scenes } from "../../settings/scenes"
import { Keyboard } from "telegram-keyboard"
import { Users } from "../../../../lib/model/users"
import { Timetable } from "../../../../lib/model/timetable"
import { Scene } from "../../settings/Scene"
import { bot, i18n } from "../../../main"

export class NotifyOneHourClient extends Scene {
  constructor(user, ctx = null) {
    super(user, ctx)
    this.payload = ctx?.message?.text
    this.clientNumber = 0
    this.clients = null
    this.clientsView = null
    this.clientsCount = 0
  }

  async enter() {
    await this.initClients()
    await this.checkClientsCount()
    await this.correctAbonementDays()
    await this.changeScene(Scenes.Client.Notify.CheckIn)
  }

  async handler() {
    if (!this.payload) {
      return await this.error()
    }

    if (this.payload) {
      await this.errorCancel()
    }
  }

  async initClients() {
    const { studia, location } = this.user.state
    const { timeMs } = this.user.state.select

    const schedule = await Timetable.findOne({ studia, location })
    const timetables = schedule.trainer.timetables
    const timetable = timetables.find(timetable => timetable.timeMs === timeMs)

    this.clients = timetable.clients
    this.clientsView = i18n.t(this.language, "goingWithYou")

    this.clients.forEach(client => {
      if (client.tgID !== this.user.tgID) {
        this.clientsCount += 1
        this.clientNumber += 1
        this.clientsView += `\n${this.clientNumber}. ${client.name} ${client.surname}`
      }
    })
  }

  async checkClientsCount() {
    if (this.clientsCount > 0) {
      await this.withClientsMessage()
    } else {
      await this.withoutClientsMessage()
    }
  }

  async errorCancel() {
    await this.ctx.reply(this.ctx.i18n.t("oneHourCancel"))
  }

  async withClientsMessage() {
    const keyboard = Keyboard.make([i18n.t(this.language, "bCancel")]).reply()
    await bot.telegram.sendMessage(
      this.user.tgID,
      i18n.t(this.language, "notifyBeforeHour"),
      keyboard
    )
    bot.telegram.sendMessage(this.user.tgID, this.clientsView, keyboard).catch(e => console.log(e))
  }

  async withoutClientsMessage() {
    const keyboard = Keyboard.make([i18n.t(this.language, "bCancel")]).reply()

    bot.telegram
      .sendMessage(this.user.tgID, i18n.t(this.language, "notifyBeforeHour"), keyboard)
      .catch(e => console.log(e))
  }

  async correctAbonementDays() {
    await Users.updateOne(
      { id: this.user.id },
      {
        $inc: {
          abonementDays: -1,
        },
      }
    )
  }
}

import { Users } from "../../../../lib/model/users"
import { Scenes } from "../../settings/scenes"
import { Timetable } from "../../../../lib/model/timetable"
import { BookingSelectDayClient } from "./BookingSelectDayClient"
import { Keyboard } from "telegram-keyboard"
import { Scene } from "../../settings/Scene"
import { BookingYesFreeItemClient } from "./BookingYesFreeItemClient"
import { BookingNotFreeItemClient } from "./BookingNotFreeItemClient"
import { BookingNotFreePlacesClient } from "./BookingNotFreePlacesClient"
import { BookingInfoClient } from "./BookingInfoClient"

export class BookingSelectInventoryClient extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
    this.rememberItem = user.state.rememberItem
    this.inventoryView = []
    this.timetable = null
  }

  async enter() {
    await this.initInventoryOrMaxClients()
    await this.changeScene(Scenes.Client.Booking.SelectInventoryItem)
    await this.checkWhatUsing()
  }

  async handler() {
    const ACTION_SELECT_OTHER_DATE = this.ctx.i18n.t("bSelectOtherDate")
    const ACTION_BUTTON_BOOKING = this.ctx.i18n.t("bBooking")

    const { inventory, inventoryView, inventoryUsing } = this.user.temp

    if (!this.payload) {
      return await this.error()
    }

    if (this.payload === ACTION_SELECT_OTHER_DATE) {
      return await this.next(BookingSelectDayClient)
    } else if (this.payload === ACTION_BUTTON_BOOKING && !inventoryUsing) {
      return await this.next(BookingInfoClient)
    }

    for (let item of inventoryView ?? []) {
      if (this.payload === item) {
        const selectedItem = inventory.find(selectItem => selectItem.name === item)

        if (selectedItem.count > 0) {
          await Users.updateOne(
            { id: this.user.id },
            {
              "state.rememberItem": item,
              "state.select.inventoryItem": item,
            }
          )
          return await this.next(BookingYesFreeItemClient)
        } else {
          return await this.next(BookingNotFreeItemClient)
        }
      }
    }
  }

  async initInventoryOrMaxClients() {
    const { studia, location } = this.user.state
    const { timeMs } = this.user.state.select
    const schedules = await Timetable.findOne({ studia, location })
    const timetables = schedules.trainer.timetables

    for (const timetable of timetables) {
      if (timetable.timeMs === timeMs) {
        this.timetable = timetable
      }
    }
  }

  async checkWhatUsing() {
    const { inventory, inventoryUsing, maxClients, maxClientsUsing, clients } = this.timetable

    if (maxClientsUsing) {
      await this.selectMaxClientsMessage(clients, maxClients)
      await Users.updateOne(
        { id: this.user.id },
        {
          "temp.inventoryUsing": inventoryUsing,
          "temp.maxClientsUsing": maxClientsUsing,
        }
      )
    }

    if (inventoryUsing) {
      this.generateInventoryView(inventory)
      await this.selectInventoryItemMessage(inventory)
      await Users.updateOne(
        { id: this.user.id },
        {
          "temp.inventory": inventory,
          "temp.inventoryUsing": inventoryUsing,
          "temp.maxClientsUsing": maxClientsUsing,
          "temp.inventoryView": this.inventoryView,
        }
      )
    }
  }

  async selectInventoryItemMessage(inventory) {
    if (this.rememberItem) {
      const selectedItem = inventory.find(item => item.name === this.rememberItem)

      if (selectedItem.count > 0) {
        await Users.updateOne(
          { id: this.user.id },
          {
            "state.select.inventoryItem": this.rememberItem,
          }
        )
        return await this.next(BookingYesFreeItemClient)
      } else {
        return await this.next(BookingNotFreeItemClient)
      }
    }

    const keyboard = Keyboard.make([this.inventoryView, [this.ctx.i18n.t("bSelectOtherDate")]])
      .oneTime()
      .reply()
    await this.ctx.reply(this.ctx.i18n.t("trainerHaveInventory"), keyboard)
  }

  async selectMaxClientsMessage(clients, maxClients) {
    if (maxClients - 1 > 0) {
      const keyboard = Keyboard.make(
        [this.ctx.i18n.t("bBooking"), this.ctx.i18n.t("bSelectOtherDate")],
        {
          columns: 1,
        }
      )
        .oneTime()
        .reply()
      await this.ctx.reply(this.ctx.i18n.t("trainerNotHaveInventory"), keyboard)
    } else {
      await this.next(BookingNotFreePlacesClient)
    }
  }

  generateInventoryView(inventory) {
    inventory.forEach(item => {
      this.inventoryView.push(item.name)
    })
  }
}

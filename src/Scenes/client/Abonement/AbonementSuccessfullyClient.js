import { Keyboard } from "telegram-keyboard"
import { Users } from "../../../../lib/model/users"
import { Crons } from "../../../Crons/Crons"
import { Scene } from "../../settings/Scene"
import { Scenes } from "../../settings/scenes"
import { SelectLocationClient } from "../register/SelectLocationScene"

export class AbonementSuccessfullyClient extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
    this.countPrice = 0
  }

  async enter() {
    await this.setAbonementDays()
    await this.enterMessage()
    await this.changeScene(Scenes.Client.Abonement.Successfully)
  }

  async enterMessage() {
    const nowUser = await Users.findOne({ id: this.user.id }, { abonementDays: 1 })
    const keyboard = Keyboard.make([this.ctx.i18n.t("bContinue")]).reply()

    await this.ctx.reply(
      this.ctx.i18n.t("addAbonementDays", {
        countPrice: this.countPrice,
        countDays: nowUser.abonementDays,
      }),
      keyboard
    )
  }

  async handler() {
    const ACTION_BUTTON_CONTINUE = this.ctx.i18n.t("bContinue")

    if (this.payload === ACTION_BUTTON_CONTINUE) {
      return await this.next(SelectLocationClient)
    }
  }

  async setAbonementDays() {
    const buyItem = this.user.state.buyItem

    switch (buyItem.id) {
      case 1:
        this.countPrice = 7
        break
      case 2:
        this.countPrice = 12
        break
    }

    await Users.updateOne(
      { id: this.user.id },
      {
        $inc: { abonementDays: this.countPrice },
        "state.abonement.activated": false,
        "state.abonement.notify": false,
        "state.abonement.notifyTwentyDays": false,
        "state.abonement.select": {},
      }
    )

    Crons.clearAbonement(this.user.tgID)
  }
}

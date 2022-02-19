import { Keyboard } from "telegram-keyboard"
import { Users } from "../../../../../lib/model/users"
import { TrainerRole } from "../../../../strings/constants"
import { Scene } from "../../../settings/Scene"
import { Scenes } from "../../../settings/scenes"
import { ConfirmCreateTimetableTrainer } from "./ConfirmCreateTimetableTrainer"
import { SelectTimeTrainer } from "./SelectTimeTrainer"

export class SelectTimetableTrainer extends Scene {
  constructor(user, ctx) {
    super(user, ctx)
    this.payload = ctx.message?.text
    this.trainers = []
    this.trainersView = []
  }

  async enter() {
    await this.initTrainers()
    await this.changeScene(Scenes.Trainer.TimetableCreate.SelectTrainer)
    await this.checkTrainers()
  }

  async handler() {
    const ACTION_BUTTON_BACK = this.ctx.i18n.t("bBack")
    const ACTION_IM = "Я"
    const trainersView = this.user.temp.trainersView

    if (!this.payload) {
      return await this.error()
    }

    if (this.payload === ACTION_BUTTON_BACK) {
      return await this.next(SelectTimeTrainer)
    }

    if (this.payload === ACTION_IM) {
      await this.setMeTrainer()
      return await this.next(ConfirmCreateTimetableTrainer)
    }

    for (const trainerView of trainersView) {
      if (this.payload === trainerView) {
        await this.setTrainer()
        return await this.next(ConfirmCreateTimetableTrainer)
      }
    }
  }

  async initTrainers() {
    const { studia } = this.user.state
    const trainers = await Users.find(
      {
        "state.studia": studia,
        "state.role": TrainerRole.ReadOnly,
      },
      { name: 1, surname: 1, tgID: 1 }
    )

    this.trainers = trainers.map(trainer => {
      this.trainersView.push(`${trainer.name} ${trainer.surname}`)

      return {
        name: trainer.name,
        surname: trainer.surname,
        tgID: trainer.tgID,
      }
    })

    this.trainersView.push("Я")

    await Users.updateOne(
      { id: this.user.id },
      { "temp.trainersView": this.trainersView, "temp.trainers": this.trainers }
    )
  }

  async checkTrainers() {
    if (this.trainers.length > 0) {
      await this.selectTrainerMessage()
    } else {
      await this.setMeTrainer()
      await this.next(ConfirmCreateTimetableTrainer)
    }
  }

  async setTrainer() {
    const trainersView = this.user.temp.trainersView
    const trainerIndex = trainersView.findIndex(trainerView => this.payload === trainerView)
    const trainer = this.user.temp.trainers[trainerIndex]

    await Users.updateOne(
      { id: this.user.id },
      {
        "state.select.trainer": trainer,
      }
    )
  }

  async setMeTrainer() {
    const trainer = {
      name: this.user.name,
      surname: this.user.surname,
      tgID: this.user.tgID,
    }

    await Users.updateOne(
      { id: this.user.id },
      {
        "state.select.trainer": trainer,
      }
    )
  }

  async selectTrainerMessage() {
    const keyboard = Keyboard.make([...this.trainersView, this.ctx.i18n.t("bBack")], {
      columns: 1,
    }).reply()

    await this.ctx.reply("Выберите тренера, который будет вести эту тренировку.", keyboard)
  }
}

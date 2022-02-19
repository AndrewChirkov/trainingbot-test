import { Users } from "../../lib/model/users"
import { i18n, bot } from "../main"
import { Keyboard } from "telegram-keyboard"

export const fixErrorCron = async user => {
  try {
    if (user && user.crons.oneHourTraining) {
      await Users.updateOne(
        { tgID: user.tgID },
        {
          scene: "BOT_UPDATE_SCENE",
          $inc: { abonementDays: 1 },
          "state.select": {},
          crons: {},
          "state.cancel": {},
        }
      )
      const keyboard = Keyboard.make([i18n.t(user.language, "bContinue")]).reply()
      await bot.telegram.sendMessage(
        user.tgID,
        "❌ Произошла непредвиденная ошибка, тренировка вернется на Ваш баланс!",
        keyboard
      )
      return
    }

    if (user && !user.crons.oneHourTraining) {
      await Users.updateOne(
        { tgID: user.tgID },
        { scene: "BOT_UPDATE_SCENE", crons: {}, "state.cancel": {}, "state.select": {} }
      )
      const keyboard = Keyboard.make([i18n.t(user.language, "bContinue")]).reply()
      await bot.telegram.sendMessage(
        user.tgID,
        "❌ Произошла непредвиденная ошибка, забронируйте тренировку еще раз.",
        keyboard
      )
      return
    }
  } catch (e) {
    console.log(e)
  }
}

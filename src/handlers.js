import { Users } from "../lib/model/users"
import { createUser } from "./global/createUser"
import { SceneGenerator } from "./Scenes/settings/sceneGenerator"
import { bot, i18n } from "./main"
import { Account, getCurrentDayStats, Languages } from "./strings/constants"
import { Stats } from "../lib/model/stats"
import { SelectLocationClient } from "./Scenes/client/register/SelectLocationScene"
import { SelectLocationTrainer } from "./Scenes/trainer/timetable/Create/SelectLocationTrainer"
import { Scenes } from "./Scenes/settings/scenes"
import { Keyboard } from "telegram-keyboard"
import { Helpers } from "./strings/Helpers"
import { Timetable } from "../lib/model/timetable"
import { StudiaStats } from "../lib/model/studies-stats"
import { Scene } from "./Scenes/settings/Scene"
import { AbonementSuccessfullyClient } from "./Scenes/client/Abonement/AbonementSuccessfullyClient"

export const errorHandler = async (e, ctx, user) => {
  const clearError = e.toString().replace(process.env.TOKEN, "TOKEN_HIDDEN")
  const devID = 699966796

  console.log(e)

  setTimeout(async () => {
    await bot.telegram.sendMessage(
      devID,
      `❌ Произошла ошибка:\n\nTelegram ID: ${ctx.from.id}\n\n${e}`
    )
  }, 1000)
}

export const Handlers = () => {
  bot.start(async ctx => {
    try {
      const userID = ctx.from.id
      const user = await Users.findOne({ tgID: userID })

      if (!user) {
        return await createUser(ctx)
      }

      if (user.account === Account.Client && user.state.location) {
        await new SelectLocationClient(user, ctx).enter()
      } else if (user.account === Account.Trainer && user.state.location) {
        await new SelectLocationTrainer(user, ctx).enter()
      } else {
        await Users.deleteOne({ tgID: userID })
        await Timetable.deleteMany({ "trainer.tgID": userID })
        await createUser(ctx)
      }
    } catch (e) {
      await errorHandler(e, ctx)
    }
  })

  bot.command("stats_global", async ctx => {
    const statsArray = await Stats.find()
    const stats = {
      allUsers: 0,
      newLocations: 0,
      newStudies: 0,
      newClients: 0,
      newTrainers: 0,
      createTrainings: 0,
      completeTrainings: 0,
      bookingTraining: 0,
      reviewsTraining: 0,
      skippedTraining: 0,
    }

    console.log(statsArray)

    stats.allUsers = statsArray[statsArray.length - 1].allUsers

    for (const stat of statsArray) {
      stats.newLocations += stat.newLocations
      stats.newStudies += stat.newStudies
      stats.newClients += stat.newClients
      stats.newTrainers += stat.newTrainers
      stats.createTrainings += stat.createTrainings
      stats.completeTrainings += stat.completeTrainings
      stats.bookingTraining += stat.bookingTraining
      stats.reviewsTraining += stat.reviewsTraining
      stats.skippedTraining += stat.skippedTraining
    }

    await ctx.replyWithMarkdown(
      `📈 Общая статистика\n\n*Всего пользователей* - *${stats.allUsers}*\n*Всего студий* - *${stats.newStudies}*\n*Всего локаций* - *${stats.newLocations}*\n*Всего участников* - *${stats.newClients}*\n*Всего тренеров* - *${stats.newTrainers}*\n*Создано расписаний* - *${stats.createTrainings}*\n*Забронировано тренировок* - *${stats.bookingTraining}*\n*Отзывов о тренировках* - *${stats.reviewsTraining}*\n*Пропущенных тренировок* - *${stats.skippedTraining}*`
    )
  })

  bot.command("stats_location", async ctx => {
    const userID = ctx.from.id
    const user = await Users.findOne({ tgID: userID })

    const stats = await StudiaStats.findOne({
      date: Helpers.getCurrentDayStats(),
      studia: user.state.studia,
      location: user.state.location,
    })

    await ctx.replyWithMarkdown(
      `📈 Статистика по локации за *${stats.date.day}.${stats.date.monthReal}.${stats.date.year}*\n\n*Студия* - *${stats.studia}*\n*Локация* - *${stats.location}*\n*Всего пользователей* - *${stats.allUsers}*\n*Всего участников* - *${stats.clients}*\n*Всего тренеров* - *${stats.trainers}*\n*Создано расписаний* - *${stats.createTrainings}*\n*Забронировано тренировок* - *${stats.bookingTraining}*\n*Отзывов о тренировках* - *${stats.reviewsTraining}*\n*Пропущенных тренировок* - *${stats.skippedTraining}*`
    )
  })

  bot.command("stats_studia", async ctx => {
    const userID = ctx.from.id
    const user = await Users.findOne({ tgID: userID })

    const statsArray = await StudiaStats.find({
      date: Helpers.getCurrentDayStats(),
      studia: user.state.studia,
    })

    const stats = {
      date: null,
      studia: null,
      allUsers: null,
      newClients: null,
      clients: null,
      trainers: null,
      createTrainings: null,
      completeTrainings: null,
      notCompleteTrainings: null,
      bookingTraining: null,
      withoutClientsTraining: null,
      goingToTraining: null,
      notBookingWeekend: null,
      reviewsTraining: null,
      skippedTraining: null,
    }

    for (const stat of statsArray) {
      stats.date = stat.date
      stats.studia = stat.studia
      stats.allUsers += stat.allUsers
      stats.newClients += stat.newClients
      stats.clients += stat.clients
      stats.trainers += stat.trainers
      stats.createTrainings += stat.createTrainings
      stats.completeTrainings += stat.completeTrainings
      stats.notCompleteTrainings += stat.notCompleteTrainings
      stats.bookingTraining += stat.bookingTraining
      stats.withoutClientsTraining += stat.withoutClientsTraining
      stats.goingToTraining += stat.goingToTraining
      stats.notBookingWeekend += stat.notBookingWeekend
      stats.reviewsTraining += stat.reviewsTraining
      stats.skippedTraining += stat.skippedTraining
    }

    await ctx.replyWithMarkdown(
      `📈 Статистика по студии за *${stats.date.day}.${stats.date.monthReal}.${stats.date.year}*\n\n*Студия* - *${stats.studia}*\n*Всего пользователей* - *${stats.allUsers}*\n*Всего участников* - *${stats.clients}*\n*Всего тренеров* - *${stats.trainers}*\n*Создано расписаний* - *${stats.createTrainings}*\n*Забронировано тренировок* - *${stats.bookingTraining}*\n*Отзывов о тренировках* - *${stats.reviewsTraining}*\n*Пропущенных тренировок* - *${stats.skippedTraining}*`
    )
  })

  bot.command("update_4045945925942859429854295", async ctx => {
    const users = await Users.find({})

    for (const user of users) {
      if (user && user.crons?.oneHourTraining) {
        await Users.updateOne(
          { id: user.id },
          {
            scene: "BOT_UPDATE_SCENE",
            $inc: { abonementDays: 1 },
            language: 'UK',
            "state.select": {},
            crons: {},
            "state.cancel": {},
          }
        )
        const keyboard = Keyboard.make([i18n.t(Languages.UK, "bContinue")]).reply()
        await ctx.telegram.sendMessage(
          user.tgID,
          "Мова оновлена! 🇺🇦",
          keyboard
        )
      }
  
      if (user && !user.crons?.oneHourTraining) {
        await Users.updateOne(
          { id: user.id },
          { scene: "BOT_UPDATE_SCENE", crons: {}, language: 'UK', "state.cancel": {}, "state.select": {} }
        )
        const keyboard = Keyboard.make([i18n.t(Languages.UK, "bContinue")]).reply()
        await ctx.telegram.sendMessage(
          user.tgID,
          "Мова оновлена! 🇺🇦",
          keyboard
        )
      }
    }

    await ctx.reply("Bot Updated :)")
  })

  bot.command("clear", async ctx => {
    const userID = ctx.from.id
    const user = await Users.findOne({ tgID: userID })
    if (!user) {
      return await ctx.reply(
        "⚠️ Данные вашего аккаунта были повреждены. Отправьте команду /start чтобы исправить данную проблему."
      )
    }
    if (user.account === Account.Trainer) {
      await Users.deleteOne({ tgID: userID })
      await Timetable.deleteMany({ "trainer.tgID": userID })
    } else {
      await Users.deleteOne({ tgID: userID })
    }
    await ctx.reply("Данные очищены. Для продолжения отправьте команду /start")
  })

  bot.command("fix_user", async ctx => {
    const phone = ctx.message?.text.slice(10)
    const user = await Users.findOne({ phone })

    if (user && user.crons.oneHourTraining) {
      await Users.updateOne(
        { phone },
        {
          scene: "BOT_UPDATE_SCENE",
          $inc: { abonementDays: 1 },
          "state.select": {},
          crons: {},
          "state.cancel": {},
        }
      )
      const keyboard = Keyboard.make([i18n.t(user.language, "bContinue")]).reply()
      await ctx.telegram.sendMessage(
        user.tgID,
        "Ошибка исправлена, продолжайте использование!",
        keyboard
      )
    }

    if (user && !user.crons.oneHourTraining) {
      await Users.updateOne(
        { phone },
        { scene: "BOT_UPDATE_SCENE", crons: {}, "state.cancel": {}, "state.select": {} }
      )
      const keyboard = Keyboard.make([i18n.t(user.language, "bContinue")]).reply()
      await ctx.telegram.sendMessage(
        user.tgID,
        "Ошибка исправлена, продолжайте использование!",
        keyboard
      )
    }
  })

  bot.command("fix_trainer", async ctx => {
    const phone = ctx.message?.text.slice(13)
    const user = await Users.findOne({ phone })

    if (user) {
      await Users.updateOne(
        { phone },
        {
          scene: "BOT_UPDATE_SCENE",
          "state.select": {},
          "state.check": {},
          temp: {},
        }
      )
      const keyboard = Keyboard.make([i18n.t(user.language, "bContinue")]).reply()
      await ctx.telegram.sendMessage(
        user.tgID,
        "Ошибка исправлена, продолжайте использование!",
        keyboard
      )
    }
  })

  bot.command("mobile_phones", async ctx => {
    const users = await Users.find()
    let stringUsers = "Пользователи:\n"

    users.forEach(user => {
      if (user.phone && user.name && user.surname) {
        stringUsers += `${user.name} ${user.surname} - ${user.phone}\n`
      }
    })

    await ctx.reply(stringUsers)
  })

  bot.on("callback_query", async ctx => {
    try {
      const userID = ctx.from.id
      const user = await Users.findOne({ tgID: userID })

      if (!user) {
        return await ctx.reply(
          "⚠️ Данные вашего аккаунта были повреждены. Отправьте команду /start чтобы исправить данную проблему."
        )
      }

      const scene = user.scene
      const language = user.language

      if (language) {
        ctx.i18n.locale(user.language)
      }

      SceneGenerator(ctx, user, scene)
        .then()
        .catch(async e => {
          await errorHandler(e, ctx)
        })
    } catch (e) {
      await errorHandler(e, ctx)
    }
  })

  //bot.on("media_group", async ctx => {
  //  try {
  //    const userID = ctx.from.id
  //    const user = await Users.findOne({ tgID: userID })

  //    if (!user) {
  //      return await ctx.reply(
  //        "⚠️ Данные вашего аккаунта были повреждены. Отправьте команду /start чтобы исправить данную проблему."
  //      )
  //    }

  //    const scene = user.scene
  //    const language = user.language

  //    if (language) {
  //      ctx.i18n.locale(user.language)
  //    }

  //    SceneGenerator(ctx, user, scene)
  //      .then()
  //      .catch(async e => {
  //        await errorHandler(e, ctx)
  //        if (user.account === Account.Client) {
  //          await new SelectLocationClient(user, ctx).enter()
  //        } else if (user.account === Account.Trainer) {
  //          await new SelectLocationTrainer(user, ctx).enter()
  //        }
  //      })
  //  } catch (e) {
  //    await errorHandler(e, ctx)
  //  }
  //})

  bot.on("pre_checkout_query", async ctx => {
    await ctx.answerPreCheckoutQuery(true)
  })

  bot.on("successful_payment", async ctx => {
    try {
      const userID = ctx.from.id
      const user = await Users.findOne({ tgID: userID })

      if (!user) {
        return await ctx.reply(
          "⚠️ Данные вашего аккаунта были очищены. Отправьте команду /start чтобы исправить ситуацию."
        )
      }

      const scene = user.scene
      const language = user.language
      if (language) {
        ctx.i18n.locale(user.language)
      }

      SceneGenerator(ctx, user, scene).catch(async e => {
        await errorHandler(e, ctx)
      })

      Scene.nextOffline(AbonementSuccessfullyClient, user, ctx)
    } catch (e) {
      await errorHandler(e, ctx)
    }
  })

  bot.on("message", async ctx => {
    try {
      const userID = ctx.from.id
      const user = await Users.findOne({ tgID: userID })

      if (!user) {
        return await ctx.reply(
          "⚠️ Данные вашего аккаунта были очищены. Отправьте команду /start чтобы исправить ситуацию."
        )
      }

      const scene = user.scene
      const language = user.language
      if (language) {
        ctx.i18n.locale(user.language)
      }

      SceneGenerator(ctx, user, scene).catch(async e => {
        await errorHandler(e, ctx)
      })
    } catch (e) {
      await errorHandler(e, ctx)
    }
  })
}

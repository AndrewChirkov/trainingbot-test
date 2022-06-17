import { Account, BookingStatus, TrainerRole } from "../strings/constants"
import { Users } from "../../lib/model/users"
import { schedule } from "node-cron"
import { bot, i18n } from "../main"
import { Scenes } from "../Scenes/settings/scenes"
import { Keyboard } from "telegram-keyboard"
import { Timetable } from "../../lib/model/timetable"
import { Stats } from "../../lib/model/stats"
import { Helpers } from "../strings/Helpers"
import { StudiaStats } from "../../lib/model/studies-stats"

export const LongAgoNotifyCron = async () => {
  try {
    const promiseFunc = user => {
      return new Promise((resolve, reject) => {
        setTimeout(async () => {
          const keyboard = Keyboard.make([i18n.t(user.language, "bBooking")]).reply()

          await Users.updateOne(
            { id: user.id },
            {
              scene: Scenes.Client.Booking.OfferBooking,
            }
          )
          bot.telegram.sendMessage(
            user.tgID,
            i18n.t(user.language, "longAgoBookingClient"),
            keyboard
          ).catch(e => console.log(e))
          .finally(() => resolve())
        }, 300)
      })
    }

    const task = schedule("0 12 * * Thursday", async () => {
      console.log("task long ago worked")
      const longTimeAgo = Date.now() - 360000000
      const users = await Users.find({
        account: Account.Client,
        "state.booking.status": BookingStatus.Free,
        "state.booking.lastBooking": {
          $lt: longTimeAgo,
        },
      })

      for await (let user of users) {
        await promiseFunc(user)
      }
    })

    task.start()
  } catch (e) {
    console.log(e)
  }
}

export const LongAgoTrainerCron = async () => {
  try {
    const promiseFunc = user => {
      return new Promise((resolve, reject) => {
        setTimeout(async () => {
          const timetablesFind = await Timetable.findOne({
            studia: user.state.studia,
            location: user.state.location,
          })
          const timetables = timetablesFind?.trainer?.timetables || []
          const lastTimetable = timetables[timetables.length - 1]
          const role = user.state.role
          const location = user.state.location

          if (
            lastTimetable &&
            lastTimetable.timeMs < Date.now() - 432000000 &&
            role === TrainerRole.Main
          ) {
            const mainMenu = [
              i18n.t(user.language, "bCreateTimetable", { location }),
              i18n.t(user.language, "bCheckTimetable", { location }),
              i18n.t(user.language, "bBaseClients"),
              i18n.t(user.language, "bMessages"),
            ]

            const buildActions = Keyboard.make(mainMenu, { pattern: [1, 1, 2] })
            const buildNavigation = Keyboard.make([i18n.t(user.language, "bSelectLocation")])

            const keyboard = Keyboard.combine(buildActions, buildNavigation).oneTime().reply()
            await Users.updateOne(
              { id: user.id },
              {
                scene: Scenes.Trainer.Actions,
                "state.booking.lastBooking": Date.now(),
                "temp.mainMenu": mainMenu,
              }
            )
            bot.telegram.sendMessage(
              user.tgID,
              i18n.t(user.language, "longAgoTimetablesTrainer"),
              keyboard
            ).catch(e => console.log(e))
            .finally(() => resolve())
          }
        }, 300)
      })
    }

    const task = schedule("07 20 * * Friday", async () => {
      console.log("task long ago trainer worked")
      const users = await Users.find({ account: Account.Trainer })

      for await (let user of users) {
        await promiseFunc(user)
      }
    })

    task.start()
  } catch (e) {
    console.log(e)
  }
}

export const CreateStats = async () => {
  try {
    const task = schedule("2 0 * * *", async () => {
      console.log("worked stats")
      await Stats.create({
        date: Helpers.getCurrentDayStats(),
        allUsers: await Users.count(),
        newStudies: 0,
        newLocations: 0,
        newUsers: 0,
        newClients: 0,
        newTrainers: 0,
        createTrainings: 0,
        completeTrainings: 0,
        notCompleteTrainings: 0,
        bookingTraining: 0,
        withoutClientsTraining: 0,
        goingToTraining: 0,
        notBookingWeekend: 0,
        reviewsTraining: 0,
        skippedTraining: 0,
        //  bookingAfter1Hour: 0,
        //  bookingAfter24Hours: 0,
      })
    })
    task.start()
  } catch (e) {
    console.log(e)
  }
}

export const CreateStudiaStats = async () => {
  try {
    const task = schedule("4 0 * * *", async () => {
      console.log("worked studia stats")

      const schedules = await Timetable.find()

      for (const schedule of schedules) {
        await StudiaStats.create({
          date: Helpers.getCurrentDayStats(),
          studia: schedule.studia,
          location: schedule.location,
          allUsers: await Users.find({ "state.studia": schedule.studia }).count(),
          clients: await Users.find({
            "state.studia": schedule.studia,
            account: Account.Client,
          }).count(),
          trainers: await Users.find({
            "state.studia": schedule.studia,
            account: Account.Trainer,
          }).count(),
          newClients: 0,
          createTrainings: 0,
          completeTrainings: 0,
          notCompleteTrainings: 0,
          bookingTraining: 0,
          withoutClientsTraining: 0,
          goingToTraining: 0,
          notBookingWeekend: 0,
          reviewsTraining: 0,
          skippedTraining: 0,
        })
      }
    })
    task.start()
  } catch (e) {
    console.log(e)
  }
}

export const EndStudiaStats = async () => {
  try {
    const task = schedule("56 23 * * *", async () => {
      const date24Hours = Date.now() - 84600000
      const oneWeekHours = Date.now() - 604800000

      const schedules = await Timetable.find()

      for (const schedule of schedules) {
        const stats = {
          withoutClientsTraining: 0,
          completeTrainings: 0,
          notCompleteTrainings: 0,
          goingToTraining: 0,
          notBookingWeekend: 0,
        }
        const users = await Users.find({
          account: Account.Trainer,
          "state.studia": schedule.studia,
        })
        const timetables = schedule.trainer.timetables

        timetables.find(timetable => {
          if (
            timetable.clients.length === 0 &&
            timetable.timeMs > date24Hours &&
            timetable.timeMs < Date.now()
          ) {
            stats.withoutClientsTraining++
          }
          if (timetable.timeMs > date24Hours && timetable.timeMs < Date.now()) {
            stats.completeTrainings++
          }
          if (timetable.timeMs > Date.now()) {
            stats.notCompleteTrainings++
          }
          if (
            timetable.clients.length > 0 &&
            timetable.timeMs > date24Hours &&
            timetable.timeMs < Date.now()
          ) {
            stats.goingToTraining += timetable.clients.length
          }
        })

        users.find(user => {
          if (user.state.booking.lastBooking < oneWeekHours) {
            stats.notBookingWeekend++
          }
        })

        await StudiaStats.updateOne(
          {
            date: Helpers.getCurrentDayStats(),
            studia: schedule.studia,
            location: schedule.location,
          },
          stats
        )
      }
    })
    task.start()
  } catch (e) {
    console.log(e)
  }
}

export const EndStats = async () => {
  try {
    const task = schedule("58 23 * * *", async () => {
      const date24Hours = Date.now() - 84600000
      const oneWeekHours = Date.now() - 604800000

      const stats = {
        withoutClientsTraining: 0,
        completeTrainings: 0,
        notCompleteTrainings: 0,
        goingToTraining: 0,
        notBookingWeekend: 0,
      }

      const schedules = await Timetable.find()
      const users = await Users.find({ account: Account.Trainer })
      const timetables = []

      schedules.forEach(schedule => timetables.push(schedule.trainer.timetables))

      timetables.find(timetable => {
        if (
          timetable.clients.length === 0 &&
          timetable.timeMs > date24Hours &&
          timetable.timeMs < Date.now()
        ) {
          stats.withoutClientsTraining++
        }
        if (timetable.timeMs > date24Hours && timetable.timeMs < Date.now()) {
          stats.completeTrainings++
        }
        if (timetable.timeMs > Date.now()) {
          stats.notCompleteTrainings++
        }
        if (
          timetable.clients.length > 0 &&
          timetable.timeMs > date24Hours &&
          timetable.timeMs < Date.now()
        ) {
          stats.goingToTraining += timetable.clients.length
        }
      })

      users.find(user => {
        if (user.state.booking.lastBooking < oneWeekHours) {
          stats.notBookingWeekend++
        }
      })

      await Stats.updateOne({ date: Helpers.getCurrentDayStats() }, stats)
    })
    task.start()
  } catch (e) {
    console.log(e)
  }
}

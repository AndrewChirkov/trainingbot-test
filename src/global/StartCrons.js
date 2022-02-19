import { Users } from "../../lib/model/users"
import { Account } from "../strings/constants"
import {
  CreateStats,
  CreateStudiaStats,
  EndStats,
  EndStudiaStats,
  LongAgoNotifyCron,
  LongAgoTrainerCron,
} from "./globalCrons"
import { CronNotifyTraining } from "../Crons/CronNotifyTraining"
import { CronCancelTraining } from "../Crons/CronCancelTraining"
import { CronEndTraining } from "../Crons/CronEndTraining"
import { CronOneHour } from "../Crons/CronOneHour"
import { CronNextTraining } from "../Crons/CronNextTraining"
import { CronAbonement } from "../Crons/CronAbonement"
import { CronAbonementTwentyDays } from "../Crons/CronAbonementTwentyDays"
import { fixErrorCron } from "./fixErrorCron"

export const StartCrons = async () => {
  const users = await Users.find({ account: Account.Client })

  for (let user of users) {
    if (user.crons) {
      const crons = user.crons
      const abonement = user.state.abonement

      const nowUser = await Users.findOne({ tgID: user.tgID })

      try {
        if (crons.notifyTraining === true) {
          await new CronNotifyTraining(nowUser).start()
        }
        if (crons.cancelTraining === true) {
          await new CronCancelTraining(nowUser).start()
        }
        if (crons.endTraining === true) {
          await new CronEndTraining(nowUser).start()
        }
        if (crons.notifyOneHour === true) {
          await new CronOneHour(nowUser).start()
        }
        if (crons.notifyNextDay === true) {
          await new CronNextTraining(nowUser).start()
        }
        if (crons.notifyNextDay === true) {
          await new CronNextTraining(nowUser).start()
        }
        if (abonement?.notify === true) {
          await new CronAbonement(nowUser).start()
        }
        if (abonement?.notifyTwentyDays === true) {
          await new CronAbonementTwentyDays(nowUser).start()
        }
      } catch (e) {
        await fixErrorCron(user)
        console.log(`[MongoDB] Error user - ${user.tgID} was auto fixed. Please, check database`)
        console.log(e)
      }
    }
  }

  await LongAgoNotifyCron()
  await LongAgoTrainerCron()
  await CreateStats()
  await EndStats()
  await CreateStudiaStats()
  await EndStudiaStats()
}

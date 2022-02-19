import Telegraf, { session } from "telegraf"
import dotenv from "dotenv"
import { DBConnect } from "../lib/database/database"
import I18n from "telegraf-i18n"
import * as path from "path"
import { Locales } from "./strings/constants"
import { Handlers } from "./handlers"
import { StartCrons } from "./global/StartCrons"
import mediaGroup from "telegraf-media-group"
import { Helpers } from "./strings/Helpers"
import userBlock from "telegraf-userblock"

dotenv.config()

export const bot = new Telegraf(process.env.TOKEN)
export const i18n = new I18n({
  directory: path.resolve(__dirname, "./../locales"),
  defaultLanguage: Locales.RU,
  useSession: true,
  sessionName: "session",
  allowMissing: false,
  templateData: {
    pluralize: I18n.pluralize,
    uppercase: value => value.toUpperCase(),
    lowercase: value => value.toLowerCase(),
    getRateSmiles: Helpers.getRateSmiles,
  },
})

DBConnect().then(r => true)
bot.use(session())
bot.use(
  userBlock({
    onUserBlock: (ctx, next, userId) => {
      console.log("User Stopped - " + userId)
      return next()
    },
  })
)
bot.use(mediaGroup())
bot.use(i18n.middleware())
bot.catch(err => console.log(err))
bot.launch().then(r => console.log("Bot Started"))
Handlers()
StartCrons().then(r => true)

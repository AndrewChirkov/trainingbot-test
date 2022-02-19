import { Scenes } from "../Scenes/settings/scenes"
import { Users } from "../../lib/model/users"
import { SelectLanguage } from "../Scenes/all/SelectLanguage"

export const createUser = async ctx => {
  const lastUser = await Users.findOne().sort({ id: -1 })
  const studiaRef = ctx.message.text.split(" ")[1]
  let lastID = 1

  if (lastUser) {
    lastID = lastUser.id + 1
  }

  const userData = {
    id: lastID,
    tgID: ctx.from.id,
    scene: Scenes.All.Language,
    abonementDays: 0,
    state: {
      status: "ok",
    },
    studiaRef: studiaRef,
  }

  await Users.create(userData)
  const user = await Users.findOne({ tgID: userData.tgID })
  const scene = new SelectLanguage(user, ctx)
  await scene.enter()
}

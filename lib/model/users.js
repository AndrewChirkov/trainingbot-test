import { connection, Schema } from "mongoose"

const UsersSchema = new Schema({
  id: { type: Number, unique: true },
  tgID: { type: Number, unique: true },
  name: String,
  surname: String,
  phone: String,
  age: Number,
  weight: Number,
  height: Number,
  sizeFoot: Number,
  scene: String,
  account: String,
  refer: String,
  studiaRef: Number,
  language: String,
  abonementDays: Number,
  rating: Number,
  state: {},
  temp: {},
  crons: {},
})

export const Users = connection.model("users", UsersSchema)

import { connection, Schema } from "mongoose"

const TimetableSchema = new Schema({
  location: String,
  studia: String,
  studiaRef: Number,
  status: String,
  description: String,
  photos: [],
  trainer: {
    id: Number,
    tgID: Number,
    name: String,
    surname: String,
    phone: String,
    timetables: [
      {
        year: Number,
        monthReal: Number,
        monthDate: Number,
        day: {
          ofWeek: Number,
          number: Number,
        },
        time: String,
        timeMs: Number,
        rates: [],
        inventoryUsing: Boolean,
        inventory: [],
        maxClientsUsing: Boolean,
        maxClients: Number,
        trainer: {
          name: String,
          surname: String,
          tgID: Number,
        },
        clients: [
          {
            id: Number,
            tgID: Number,
            name: String,
            surname: String,
            phone: String,
            age: Number,
            weight: Number,
            height: Number,
            selectItem: String,
          },
        ],
      },
    ],
  },
})

export const Timetable = connection.model("timetables", TimetableSchema)

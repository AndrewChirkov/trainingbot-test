import { Schema } from "mongoose"
import { connection } from "mongoose"

const StudiesStatsSchema = new Schema({
  date: {
    year: Number,
    monthDate: Number,
    monthReal: Number,
    day: Number,
  },
  studia: String,
  location: String,
  allUsers: Number,
  newClients: Number,
  clients: Number,
  trainers: Number,
  createTrainings: Number,
  completeTrainings: Number,
  notCompleteTrainings: Number,
  bookingTraining: Number,
  withoutClientsTraining: Number,
  goingToTraining: Number,
  notBookingWeekend: Number,
  reviewsTraining: Number,
  skippedTraining: Number,
})

export const StudiaStats = connection.model("studies-stats", StudiesStatsSchema)

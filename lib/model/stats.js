import { Schema } from "mongoose"
import { connection } from "mongoose"

const StatsSchema = new Schema({
  date: {
    year: Number,
    monthDate: Number,
    monthReal: Number,
    day: Number,
  },
  allUsers: Number,
  newStudies: Number,
  newLocations: Number,
  newUsers: Number,
  newClients: Number,
  newTrainers: Number,
  createTrainings: Number,
  completeTrainings: Number,
  notCompleteTrainings: Number,
  bookingTraining: Number,
  withoutClientsTraining: Number,
  goingToTraining: Number,
  notBookingWeekend: Number,
  reviewsTraining: Number,
  skippedTraining: Number,
  //  bookingAfter1Hour: Number,
  //  bookingAfter24Hours: Number,
})

export const Stats = connection.model("stats", StatsSchema)

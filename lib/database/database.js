import { connect } from "mongoose"

export const DBConnect = async () => {
    const path = process.env.DATABASE_PATH

    connect(path, error => {
        if (error) return console.error(error)
        console.log("Connected to MongoDB")
    })
}

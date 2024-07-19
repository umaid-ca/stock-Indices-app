import mongoose from "mongoose";

export const connectMongoDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODBURI)
        console.log("Conntected to MongoDb")
    }
    catch (error) {
        console.log("Failed to Connect to MongoDB", error)
    }
}
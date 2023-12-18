import mongoose from "mongoose";

export default class Mongoose {
  public static async connect() {
    try {
      await mongoose.connect('mongodb://127.0.0.1/nimtrix');
      console.log("Connected with database...")
    } catch (error) {
      console.log(error)
      process.exit()
    }
  }
}
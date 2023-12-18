import mongoose from "mongoose";

export default class Mongoose {
  public static async connect() {
    try {
      await mongoose.connect('mongodb://localhost/nimtrix');
      console.log("Connected with database...")
    } catch (error) {
      console.log(error)
      process.exit()
    }
  }
}
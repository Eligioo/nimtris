import mongoose from "mongoose";

export default class Mongoose {
  public static async connect() {
    try {
      await mongoose.connect('mongodb://localhost/nimtrix', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log("Connected with database...")
    } catch (error) {
      process.exit()
    }
  }
}
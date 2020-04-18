import dotenv from "dotenv";

import Mongoose from "./lib/Mongoose"
import Nimiq from "./lib/Nimiq"
import Express from "./lib/Express"

dotenv.config()
Mongoose.connect()
Express.setup()
Nimiq.connect()
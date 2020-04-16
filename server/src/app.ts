import dotenv from "dotenv";

import LMDB from "./lib/LMDB"
import Nimiq from "./lib/Nimiq"
import Express from "./lib/Express"

dotenv.config()
LMDB.setup()
Express.setup()
Nimiq.connect()
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import Nimiq from "./Nimiq";

export default class Express {
  public static setup() {
    const app = express()

    app.use(cors({
      origin: 'http://localhost:8080',
      optionsSuccessStatus: 200
    }))

    app.use(bodyParser.json())
    
    app.post('/', function (req, res) {
      console.log(req.get('host'))
      console.log(req.get('origin'))

      Nimiq.playerPayout(req.body)

      res.send('OK')
    })
    
    const expressPort = process.env.EXPRESS_PORT || 8080
    app.listen(expressPort)
    console.log(`Webserver running on port ${expressPort}`)
  }
}
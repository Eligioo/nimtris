import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import Nimiq from "./Nimiq";

export default class Express {
  public static setup() {
    const app = express()

    app.use(cors({
      origin: 'https://nimtris.zeromox.com',
      optionsSuccessStatus: 200
    }))

    app.use(bodyParser.json())
    
    app.post('/', function (req, res) {
      if(req.get('origin') !== 'https://nimtris.zeromox.com') {
        return res.send('OK')
      }

      Nimiq.playerPayout(req.body)

      return res.send('OK')
    })
    
    const expressPort = process.env.EXPRESS_PORT || 8080
    app.listen(expressPort)
    console.log(`Webserver running on port ${expressPort}`)
  }
}
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
    
    app.post('/', (req, res) => {
      if(!this.allowedOrigin(req)) {
        return res.send('OK')
      }

      Nimiq.playerPayout(req.body)

      return res.send('OK')
    })

    app.post('/request', (req, res) => {
      if(!this.allowedOrigin(req)) {
        return res.sendStatus(403)
      }
      const a = {
        xfor: req.headers['x-forwarded-for'],
        remoteAdd: req.connection.remoteAddress
      }
      res.json(a)
    })
    
    const expressPort = process.env.EXPRESS_PORT || 8080
    app.listen(expressPort)
    console.log(`Webserver running on port ${expressPort}`)
  }

  static allowedOrigin(req: express.Request) {
    return req.get('origin') === 'https://nimtris.zeromox.com'
  }
}
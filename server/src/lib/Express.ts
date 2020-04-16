import express from "express";
import cors from "cors";

export default class Express {
  public static setup() {
    const app = express()

    app.use(cors({
      origin: 'http://localhost',
      optionsSuccessStatus: 200
    }))
    
    app.get('/', function (req, res) {
      res.send('Hi')
    })
    
    const expressPort = process.env.EXPRESS_PORT || 8080
    app.listen(expressPort)
    console.log(`Webserver running on port ${expressPort}`)
  }
}
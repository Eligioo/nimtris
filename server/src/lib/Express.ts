import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import Nimiq from "./Nimiq";

import Hash from "./models/Hash";

export default class Express {
  public static setup() {
    const app = express()

    app.use(cors({
      origin: 'https://nimtris.zeromox.com',
      optionsSuccessStatus: 200
    }))

    app.use(bodyParser.json())
    
    app.post('/', async (req, res) => {
      if(!this.allowedOrigin(req)) {
        return res.send('OK')
      }

      if(!req.headers['x-forwarded-for']) {
        return res.send("ok")
      }

      const hash = await Hash.findOne({
        ip: req.headers['x-forwarded-for'],
        wallet: req.body.recipient,
        hash: req.body.hash,
        used: false
      })
      if(!hash) {
        return res.send('OK')
      }

      //@ts-ignore
      hash.used = true
      await hash.save()

      Nimiq.playerPayout(req.body)

      return res.send('OK')
    })

    app.post('/request', async (req, res) => {
      if(!this.allowedOrigin(req) || !req.headers['x-forwarded-for'] || !req.body.wallet) {
        return res.sendStatus(403)
      }

      try {
        Nimiq.verifyAddress(req.body.wallet)

        const hashes = await Hash.find({
          ip: req.headers['x-forwarded-for'],
          wallet: req.body.wallet,
          used: false
        })

        // No hashes found
        if(hashes.length === 0) {
          const lastHash = await Hash.find({
            ip: req.headers['x-forwarded-for'],
            wallet: req.body.wallet,
            used: true
          }).sort({created_at: 'desc'}).limit(1)

          if(lastHash.length > 0) {
            //@ts-ignore
            if((new Date(Date.now()) - new Date(lastHash[0].created_at)) < 30000) {
              return res.sendStatus(403)
            }
          }

          const hash = new Hash({
            ip: req.headers['x-forwarded-for'],
            hash: this.randomString(),
            wallet: req.body.wallet,
            created_at: new Date(Date.now())
          })

          await hash.save()

          return res.json({
            //@ts-ignore
            hash: hash.hash
          })
        }
        // Exactly one hash found
        else if(hashes.length === 1) {
          return res.json({
            // @ts-ignore
            hash: hashes[0].hash
          })
        }
        // Multiple hashes found
        else {
          await Hash.updateMany({
            ip: req.headers['x-forwarded-for'],
            wallet: req.body.wallet,
            used: false
          }, {
            used: true
          })

          const hash = new Hash({
            ip: req.headers['x-forwarded-for'],
            hash: this.randomString(),
            wallet: req.body.wallet,
            created_at: new Date(Date.now())
          })

          await hash.save()
          return res.json({
            //@ts-ignore
            hash: hash.hash
          })
        }
       } catch (error) {
        return res.sendStatus(403)
      }
    })
    
    const expressPort = process.env.EXPRESS_PORT || 8080
    app.listen(expressPort)
    console.log(`Webserver running on port ${expressPort}`)
  }

  static allowedOrigin(req: express.Request) {
    return req.get('origin') === 'https://nimtris.zeromox.com'
  }

  static randomString() {
    let result           = '';
    const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for ( var i = 0; i < 64; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}
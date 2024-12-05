import express from "express";
import { Address, BufferUtils, Client, ClientConfiguration, KeyPair, PrivateKey, TransactionBuilder } from "@nimiq/core";
import Payout from "../lib/models/Payout"
import GoldenTicket from "../lib/models/GoldenTicket"

export type PayoutRequest = {
  recipient?: string,
  score?: number,
  hash?: string
}

export default class NanoClient {
  public static established: boolean = false
  private static wallet: KeyPair
  private static client: Client

  public static async connect() {
    const clientConf = new ClientConfiguration()
    switch (process.env.NIMIQ_NETWORK) {
      case 'main':
        clientConf.network('MainAlbatross');
        break;
      default:
        clientConf.network('TestAlbatross');
        clientConf.seedNodes(['/dns4/seed1.pos.nimiq-testnet.com/tcp/8443/wss']);
        break;
    }
    clientConf.logLevel('info')

    // Load wallet
    const pkHex = process.env.NIMIQ_PRIVATE_KEY_HEX as string
    const buf = BufferUtils.fromHex(pkHex)
    const pk = PrivateKey.deserialize(buf)
    this.wallet = KeyPair.derive(pk)
    console.log(`Loaded ${this.wallet.publicKey.toAddress().toUserFriendlyAddress()}`)
    console.log(`Connecting to the Nimiq ${process.env.NIMIQ_NETWORK} network...`)

    this.client = await Client.create(clientConf.build());
    await this.client.waitForConsensusEstablished()
    this.established = true
  }

  public static async playerPayout(request: PayoutRequest, ip: string) {
    try {
      if (!this.established) {
        throw Error("Can't send transaction, don't have consensus");
      }
      // Seek for more protection to prevent abuse
      if (!request || !request.recipient || !request.score || !request.hash) {
        throw Error("Missing a recipient, score or hash")
      }
      else if (request.score < 100) {
        return
      }

      const list = [
        "NQ96 YNA2 FC4L J2XF DNGT G1TG BRDB DLLN BQM2",
        "NQ73 3079 JKPY AJ70 EALA Y9RX YLN1 DC0P 9P7P",
        "NQ86 H9YY LNQE 30F7 RHX3 MR68 A9R8 DHPP LU00",
        "NQ78 UJC2 XUQD 4XJT 5KS4 MYX8 BL5P 5GS6 LUEB",
        "NQ21 T7R0 2VXQ 5QGR Y5S9 SF4P K8AE VQ8Q V300",
        "NQ36 2926 0A2J M4XD FJUU K8B5 ELD0 KSGT 782R",
        "NQ04 EMLS A41G XYNG XS3M QTP8 DY56 G2R7 MTP5",
        "NQ28 XAR0 KT12 KFM2 693S 8CGQ 2R0N 08ET XJN4",
        "NQ21 30U0 GS0G VFKD 2A8M P6Y4 F896 PJ82 Q4HE",
        "NQ28 XKLC 8YSG UY50 4YM1 J1L6 VPRM YVBV 65MA",
        "NQ21 30U0 GS0G VFKD 2A8M P6Y4 F896 PJ82 Q4HE"
      ]

      if (list.includes(Address.fromString(request.recipient).toUserFriendlyAddress())) {
        return;
      }

      let reward = request.score / 100000 // 0.01 NIM per 1000 points
      if (reward > 0.15) { /* cap at 0.15 NIM */
        reward = 0.15
      }

      // Temp for Golden ticket	
      // if (request.score >= 1000) {
      //   const min = 1;
      //   const max = 200;
      //   const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

      //   if (randomNumber === 100) {
      //     const count = await GoldenTicket.countDocuments()
      //     console.log("documents", count)
      //     if (count < 26) {
      //       const ticket = new GoldenTicket({
      //         recipient: request.recipient,
      //         created_at: Date.now()
      //       })
      //       await ticket.save()
      //       reward = 2500;
      //     }
      //   }
      // }

      const tx = TransactionBuilder.newBasic(
        this.wallet.publicKey.toAddress(),
        Address.fromString(request.recipient),
        BigInt(reward * 1e5),
        BigInt(0),
        await this.client.getHeadHeight(),
        await this.client.getNetworkId()
      )

      this.wallet.signTransaction(tx)
      await this.client.sendTransaction(tx)

      const payout = new Payout({
        txhash: tx.hash(),
        luna: tx.value,
        recipient: tx.recipient.toUserFriendlyAddress(),
        ip: ip,
        created_at: new Date(Date.now())
      })
      payout.save()

    } catch (error) {
      console.log(error)
    }
  }

  public static verifyAddress(addr: string): Address {
    return Address.fromString(addr)
  }

  public static async hasReachedRewardCap(req: express.Request): Promise<boolean> {
    if (!req.headers['x-forwarded-for']) {
      return true
    }

    const startDay = new Date();
    startDay.setHours(0, 0, 0, 0);

    const endDay = new Date();
    endDay.setHours(23, 59, 59, 999);

    const payouts = await Payout.find({
      ip: req.headers['x-forwarded-for'] as string,
      created_at: { $gte: startDay, $lt: endDay }
    })

    if (payouts.length === 0) {
      return false
    }

    let total = 0
    // uhmm why not reduce
    payouts.map(p => total += p.luna)
    if ((total / 1e5) < 1) {
      return false
    }

    return true
  }
}

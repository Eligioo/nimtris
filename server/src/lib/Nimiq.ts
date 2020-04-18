import Nimiq from "@nimiq/core";
import Payout from "../lib/models/Payout"

export type PayoutRequest = {
  recipient?: string,
  score?: number
}

export default class NanoClient {

  public static blockchain: Nimiq.NanoChain
  public static consensus: Nimiq.NanoConsensus
  public static established: boolean = false
  public static mempool: Nimiq.NanoMempool
  public static network: Nimiq.Network
  private static wallet: Nimiq.Wallet
  
  public static async connect() {
    // Load wallet
    const pkHex = process.env.NIMIQ_PRIVATE_KEY_HEX as string
    const buf = Nimiq.BufferUtils.fromHex(pkHex)
    const pk = Nimiq.PrivateKey.unserialize(buf)
    const kp = Nimiq.KeyPair.derive(pk)
    NanoClient.wallet = new Nimiq.Wallet(kp)
    console.log(`Loaded ${NanoClient.wallet.address.toUserFriendlyAddress()}`)


    console.log(`Connecting to the Nimiq ${process.env.NIMIQ_NETWORK} network...`)
    process.env.NIMIQ_NETWORK === "main" ?  Nimiq.GenesisConfig.main() : Nimiq.GenesisConfig.test()

    NanoClient.consensus = await Nimiq.Consensus.nano()
    NanoClient.blockchain = NanoClient.consensus.blockchain
    NanoClient.network = NanoClient.consensus.network
    NanoClient.mempool = NanoClient.consensus.mempool
    NanoClient.network.connect()

    NanoClient.consensus.on("established", () => {
      NanoClient.established = true
      NanoClient.consensus.subscribeAccounts([NanoClient.wallet.address])
      NanoClient.mempool.on("transaction-added", NanoClient._onTransactionAdded)
    })

    NanoClient.consensus.on("lost", () => NanoClient.established = false)
  }

  public static async playerPayout(request: PayoutRequest) {
    try {
      if(!NanoClient.established) {
        throw Error("Can't send transaction, don't have consensus");
      }
      // Seek for more protection to prevent abuse
      if(!request || !request.recipient || !request.score) {
        throw Error("Missing a recipient or score")
      }
      else if(request.score < 100) {
        return
      }

      const floorRemainder = Math.floor(request.score / 100)
      let reward = 0.1 * floorRemainder // 0.1 NIM per 100 points
      if(reward > 20) { /* cap at 20 NIM */
        reward = 20
      }

      const tx = NanoClient.wallet.createTransaction(
        Nimiq.Address.fromString(request.recipient) /*recipient*/,
        Nimiq.Policy.coinsToLunas(reward) /*lunas*/, 
        0 /*fee*/,
        NanoClient.blockchain.height /*validityStartHeight*/)
      
      const txResult = await NanoClient.consensus.sendTransaction(tx)
      console.log(txResult)

    } catch (error) {
      console.log(error.message)
    }
  }

  private static async _onTransactionAdded(tx: Nimiq.Transaction) {
    try {
      const doc = await Payout.findOne({txhash: tx.hash().toHex()})
      if(tx.sender.equals(NanoClient.wallet.address) && !doc) {
        const payout = new Payout({
          txhash: tx.hash().toHex(),
          luna: tx.value,
          recipient: tx.recipient.toUserFriendlyAddress()
        })
        payout.save()
      }
    } catch (error) {
      console.log(error.message)
    }
  }
}
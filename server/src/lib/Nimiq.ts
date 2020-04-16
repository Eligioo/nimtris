import Nimiq from "@nimiq/core";

export default class NanoClient {

  public static blockchain: Nimiq.NanoChain
  public static consensus: Nimiq.NanoConsensus
  public static network: Nimiq.Network

  public static async connect() {
    console.log(`Connecting to the Nimiq ${process.env.NIMIQ_NETWORK} network...`)
    process.env.NIMIQ_NETWORK === "main" ?  Nimiq.GenesisConfig.main() : Nimiq.GenesisConfig.test()
    NanoClient.consensus = await Nimiq.Consensus.nano()
    NanoClient.blockchain = NanoClient.consensus.blockchain
    NanoClient.network = NanoClient.consensus.network
    NanoClient.network.connect()
  }
}
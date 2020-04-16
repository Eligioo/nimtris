import path from "path";
import fs from "fs";

//@ts-ignore
import lmdb from "node-lmdb";

export default class LMDB {
  public static setup() {
    const dbPath = path.resolve(__dirname, '../data')
    
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(dbPath)
    }
    
    const dbEnv = new lmdb.Env();
    dbEnv.open({
      path: dbPath,
      mapSize: 2*1024*1024*1024,
      maxDbs: 2
    });
    
    const dbi = dbEnv.openDbi({
      name: "payouts",
      create: true
    })
    
    dbi.close()
    dbEnv.close()
  }
}
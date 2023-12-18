import mongoose from 'mongoose';

interface IHash {
  ip: string,
  hash: string,
  wallet: string,
  used: boolean,
  created_at: Date
}

export interface IHashModel extends IHash, mongoose.Document { }

const hashSchema = new mongoose.Schema({
  ip: { type: String, required: true },
  hash: { type: String, required: true },
  wallet: { type: String, required: true },
  used: { type: Boolean, required: true, default: false },
  created_at: { type: Date, required: true }
},
  {
    versionKey: false
  }
);

const Hub: mongoose.Model<IHashModel> = mongoose.model<IHashModel>("Hash", hashSchema);
export default Hub;
import mongoose from 'mongoose';

interface IPayout {
  txhash: string,
  luna: number,
  ip: string
  recipient: string,
  created_at: Date
}

export interface IPayoutModel extends IPayout, mongoose.Document { }

const payoutSchema = new mongoose.Schema({
    txhash: {type: String, required: true},
    luna: {type: Number, required: true},
    ip: {type: String, required: true},
    recipient: {type: String, required: true},
    created_at: {type: Date, required: true}
  },
  {
    versionKey: false 
  }
);

const Payout: mongoose.Model<IPayoutModel> = mongoose.model<IPayoutModel>("Payout", payoutSchema)
export default Payout;
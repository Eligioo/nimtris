import mongoose from 'mongoose';

const payoutSchema = new mongoose.Schema({
    txhash: {type: String, required: true},
    luna: {type: Number, required: true},
    recipient: {type: String, required: true},
    created_at: {type: Date, required: true, default: Date.now()}
  },
  {
    versionKey: false 
  }
);

export default mongoose.model('Payout', payoutSchema);
import mongoose from 'mongoose';

const hashSchema = new mongoose.Schema({
    ip: {type: String, required: true},
    hash: {type: String, required: true},
    wallet: {type: String, required: true},
    used: {type: Boolean, required: true, default: false},
    created_at: {type: Date, required: true}
  },
  {
    versionKey: false 
  }
);

export default mongoose.model('Hash', hashSchema);
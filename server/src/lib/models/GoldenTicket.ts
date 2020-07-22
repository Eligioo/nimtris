import mongoose from 'mongoose';

interface IGoldenTicket {
  recipient: string,
  created_at: Date
}

export interface IGoldenTicketModel extends IGoldenTicket, mongoose.Document { }

const goldenTicketSchema = new mongoose.Schema({
    recipient: {type: String, required: true},
    created_at: {type: Date, required: true}
  },
  {
    versionKey: false 
  }
);

const GoldenTicket: mongoose.Model<IGoldenTicketModel> = mongoose.model<IGoldenTicketModel>("GoldenTicket", goldenTicketSchema)
export default GoldenTicket;
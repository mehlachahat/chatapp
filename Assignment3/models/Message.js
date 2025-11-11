import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true,
  },
  receiver: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  delivered: {
    type: Boolean,
    default: false,
  },
});

// Create compound index for efficient querying
MessageSchema.index({ sender: 1, receiver: 1, timestamp: -1 });
MessageSchema.index({ receiver: 1, delivered: 1 }); // For offline messages

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);

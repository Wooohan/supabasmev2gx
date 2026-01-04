import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  pageId: {
    type: String,
    required: true,
  },
  customerId: {
    type: String,
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  customerAvatar: {
    type: String,
    default: '',
  },
  lastMessage: {
    type: String,
    default: '',
  },
  lastTimestamp: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['OPEN', 'PENDING', 'RESOLVED'],
    default: 'OPEN',
  },
  assignedAgentId: {
    type: String,
    default: null,
  },
  unreadCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
  collection: 'Test'
});

export default mongoose.model('Conversation', conversationSchema);
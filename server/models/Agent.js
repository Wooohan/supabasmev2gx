import mongoose from 'mongoose';

const agentSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['SUPER_ADMIN', 'AGENT'],
    default: 'AGENT',
  },
  avatar: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'busy'],
    default: 'offline',
  },
  assignedPageIds: {
    type: [String],
    default: [],
  },
}, {
  timestamps: true,
  collection: 'Test' // Using 'Test' collection as specified
});

export default mongoose.model('Agent', agentSchema);
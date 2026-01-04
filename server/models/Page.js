import mongoose from 'mongoose';

const pageSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    default: '',
  },
  isConnected: {
    type: Boolean,
    default: false,
  },
  accessToken: {
    type: String,
    default: '',
  },
  assignedAgentIds: {
    type: [String],
    default: [],
  },
}, {
  timestamps: true,
  collection: 'Test'
});

export default mongoose.model('Page', pageSchema);
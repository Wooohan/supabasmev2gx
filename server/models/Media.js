import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['image', 'video'],
    required: true,
  },
  isLocal: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
  collection: 'Test'
});

export default mongoose.model('Media', mediaSchema);
import mongoose from 'mongoose';

const linkSchema = new mongoose.Schema({
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
  category: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
  collection: 'Test'
});

export default mongoose.model('Link', linkSchema);
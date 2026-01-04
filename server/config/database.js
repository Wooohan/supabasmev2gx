import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'MessengerFlow',
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Initialize default admin users if collection is empty
    const Agent = mongoose.model('Agent');
    const count = await Agent.countDocuments();
    
    if (count === 0) {
      console.log('🔧 Initializing default admin users...');
      const bcrypt = await import('bcryptjs');
      
      const defaultAdmins = [
        {
          id: 'admin-0',
          name: 'Main Admin',
          email: 'wooohan3@gmail.com',
          password: await bcrypt.hash('Admin@1122', 10),
          role: 'SUPER_ADMIN',
          avatar: 'https://picsum.photos/seed/admin-main/200',
          status: 'online',
          assignedPageIds: [],
        },
        {
          id: 'admin-1',
          name: 'Alex Johnson',
          email: 'admin@messengerflow.io',
          password: await bcrypt.hash('password123', 10),
          role: 'SUPER_ADMIN',
          avatar: 'https://picsum.photos/seed/admin/200',
          status: 'online',
          assignedPageIds: [],
        }
      ];
      
      await Agent.insertMany(defaultAdmins);
      console.log('✅ Default admin users created');
    }
    
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
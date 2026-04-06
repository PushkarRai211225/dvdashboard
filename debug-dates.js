import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Metrics from './src/models/Metrics.js';

dotenv.config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ MongoDB connected\n');

    const metrics = await Metrics.find().sort({ date: -1 }).limit(15);
    console.log('Recent 15 metrics dates stored in DB:');
    metrics.forEach(m => {
      const localDate = new Date(m.date);
      console.log(`  ${localDate.toLocaleDateString()} (${m.date.toISOString().split('T')[0]})`);
    });

    // Check what the report query would look for
    const reportDate = new Date();
    reportDate.setHours(0, 0, 0, 0);
    console.log(`\nReport looking for date: ${reportDate.toLocaleDateString()} (${reportDate.toISOString().split('T')[0]})`);
    
    // Try to find a match
    const found = await Metrics.findOne({ date: reportDate });
    console.log(`Data found for today? ${found ? 'YES' : 'NO'}`);

    // Check with ISO string
    const isoDate = new Date(reportDate.toISOString());
    const found2 = await Metrics.findOne({ date: isoDate });
    console.log(`Data found with ISO conversion? ${found2 ? 'YES' : 'NO'}`);

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();

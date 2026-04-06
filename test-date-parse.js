import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Metrics from './src/models/Metrics.js';

dotenv.config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ MongoDB connected\n');

    // Test the date parsing logic
    const dateString = '2026-04-07';
    const [year, month, day] = dateString.split('-').map(Number);
    const reportDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    
    console.log(`Parsed date string "${dateString}" to UTC:`, reportDate.toISOString());

    // Try to find metrics for April 7
    const found = await Metrics.findOne({ date: reportDate });
    console.log(`Metrics found for April 7, 2026? ${found ? 'YES ✓' : 'NO ✗'}`);
    
    if (found) {
      console.log(`First found date: ${found.date.toISOString().split('T')[0]}`);
    } else {
      // Show what dates we have
      const latest = await Metrics.findOne().sort({ date: -1 });
      if (latest) {
        console.log(`Latest date in DB: ${latest.date.toISOString().split('T')[0]}`);
      }
    }

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();

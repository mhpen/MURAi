import 'dotenv/config';
import mongoose from 'mongoose';
import ModelMetrics from '../models/ModelMetrics.js';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Fetch all metrics
    return ModelMetrics.find();
  })
  .then(metrics => {
    console.log('Found', metrics.length, 'metrics records');
    console.log(JSON.stringify(metrics, null, 2));
    
    // Close connection
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  })
  .catch(err => {
    console.error('Error:', err);
    mongoose.connection.close();
  });

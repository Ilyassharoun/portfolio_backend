import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // Add this import
import { setupSwagger } from './swagger';
import mongoose from 'mongoose';
import routes from './routes/routes';
import connectDB from './config/db';

// Load environment variables FIRST
dotenv.config();
connectDB();
mongoose.connection.on('connected', () => {
  console.log('\n📦 MongoDB Connection Details:');
  console.log('=================================');
  console.log(`✅ Status: Connected`);
  console.log(`📊 Database: ${mongoose.connection.name}`);
  console.log(`🔌 Host: ${mongoose.connection.host}`);
  console.log(`🎯 Port: ${mongoose.connection.port}`);
  console.log(`🔄 Connection State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
  console.log('=================================\n');
});

mongoose.connection.on('error', (err) => {
  console.error('\n❌ MongoDB Connection Error:');
  console.error('=================================');
  console.error(err);
  console.error('=================================\n');
});

mongoose.connection.on('disconnected', () => {
  console.log('\n⚠️ MongoDB Disconnected');
  console.log('=================================\n');
});


const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors({
  origin: true,
  credentials: true
}));

// Make sure to parse JSON for POST requests
app.use(express.json());

// Setup Swagger
setupSwagger(app);

// Mount your routes under /api
app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({ 
    message: 'API Server is running', 
    docs: `/api-docs`
  });
});


app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📚 Swagger docs available at http://localhost:${port}/api-docs`);
});
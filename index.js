import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';

import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import saleRoutes from './routes/saleRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded files

// 👇 ဒီနေရာမှာထည့်
app.get("/", (req, res) => res.send("HomeSaleAPI running"));
app.get("/api", (req, res) => res.json({ ok: true, message: "API base" }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);

// MongoDB Connection

// MongoDB Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        // Fallback to in-memory database for development if local mongo is missing
        if (process.env.NODE_ENV !== 'production') {
            try {
                console.log('Attempting to start in-memory MongoDB...');
                const { MongoMemoryServer } = await import('mongodb-memory-server');
                const mongod = await MongoMemoryServer.create();
                const uri = mongod.getUri();
                await mongoose.connect(uri);
                console.log('Connected to In-Memory MongoDB at', uri);
            } catch (memoryErr) {
                console.error('Failed to start in-memory MongoDB:', memoryErr);
                return;
            }
        }
    }

    // Auto-seed admin user if it doesn't exist
    try {
        const adminExists = await User.findOne({ username: 'admin' });
        if (!adminExists) {
            const admin = new User({
                username: 'admin',
                password: 'admin123', // Pre-save hook will hash it
                name: 'System Admin',
                role: 'admin'
            });
            await admin.save();
            console.log('Admin user seeded successfully');
        }
    } catch (seedErr) {
        console.error('Seeding error:', seedErr);
    }
};

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

startServer();

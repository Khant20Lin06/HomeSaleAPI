import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/homesales')
    .then(async () => {
        console.log('Connected to MongoDB for seeding');

        // Check if admin exists
        const adminExists = await User.findOne({ username: 'admin' });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            const admin = new User({
                username: 'admin',
                password: 'admin123', // Pre-save hook will hash it, but let's be safe. wait, model has pre-save.
                // Actually, if I use new User(), the pre-save hook works.
                name: 'System Admin',
                role: 'admin'
            });
            await admin.save();
            console.log('Admin user created');
        } else {
            console.log('Admin user already exists');
        }

        process.exit(0);
    })
    .catch((err) => {
        console.error('Seeding error:', err);
        process.exit(1);
    });

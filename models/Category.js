import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    image: { type: String } // Store path to image
}, { timestamps: true });

export default mongoose.model('Category', categorySchema);

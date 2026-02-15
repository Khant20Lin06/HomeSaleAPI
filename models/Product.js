import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    description: { type: String },
    image: { type: String }, // Store path to image
    barcode: { type: String } // Add barcode field as it was in the form
}, { timestamps: true });

export default mongoose.model('Product', productSchema);

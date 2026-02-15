import mongoose from 'mongoose';

const saleItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }, // Snapshotted price at time of sale
});

const saleSchema = new mongoose.Schema({
    totalAmount: { type: Number, required: true },
    cashier: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: [saleItemSchema],
    receiptNumber: { type: String, unique: true },
}, { timestamps: true });

// Simple receipt number generation
saleSchema.pre('save', function (next) {
    if (!this.receiptNumber) {
        this.receiptNumber = `RCP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
    next();
});

export default mongoose.model('Sale', saleSchema);

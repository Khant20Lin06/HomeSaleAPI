import Sale from '../models/Sale.js';
import Product from '../models/Product.js';

export const createSale = async (req, res) => {
    try {
        const { items, totalAmount, cashierId } = req.body;

        // Check stock first
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product || product.stock < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for product: ${product?.name || 'Unknown'}` });
            }
        }

        // Deduct stock
        for (const item of items) {
            await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
        }

        const sale = new Sale({
            items,
            totalAmount,
            cashier: cashierId
        });

        await sale.save();
        res.status(201).json(sale);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getSales = async (req, res) => {
    try {
        const sales = await Sale.find()
            .populate('cashier', 'name')
            .populate('items.product', 'name price')
            .sort({ createdAt: -1 });
        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getSaleById = async (req, res) => {
    try {
        const sale = await Sale.findById(req.params.id)
            .populate('cashier', 'name')
            .populate('items.product', 'name price');
        if (!sale) return res.status(404).json({ message: 'Sale not found' });
        res.json(sale);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const sales = await Sale.find({
            createdAt: { $gte: today }
        });

        const totalSalesToday = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const totalOrdersToday = sales.length;

        res.json({
            sales: totalSalesToday,
            orders: totalOrdersToday
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getSalesTrend = async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const sales = await Sale.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    totalSales: { $sum: "$totalAmount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Fill in missing days with 0
        const trend = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const found = sales.find(s => s._id === dateStr);
            trend.push({
                date: dateStr,
                sales: found ? found.totalSales : 0
            });
        }

        res.json(trend);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getTopProducts = async (req, res) => {
    try {
        const topProducts = await Sale.aggregate([
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.product",
                    totalQuantity: { $sum: "$items.quantity" },
                    totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } } // Assuming price is stored in items for history
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "productInfo"
                }
            },
            { $unwind: "$productInfo" },
            {
                $project: {
                    _id: 1,
                    name: "$productInfo.name",
                    totalQuantity: 1,
                    totalRevenue: 1
                }
            }
        ]);
        res.json(topProducts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteSale = async (req, res) => {
    try {
        const { id } = req.params;
        const sale = await Sale.findById(id);
        if (!sale) return res.status(404).json({ message: 'Sale not found' });

        // Build logic: Should we restore stock? 
        // For simplicity in this request, we will just delete the record. 
        // If stock restoration is needed, we can add it later.

        await Sale.findByIdAndDelete(id);
        res.json({ message: 'Sale deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

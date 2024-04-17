const Order = require("../models/order");
const Product = require("../models/product");

function orderController() {
    return {
        async store(req, res) {
            try {
                console.log(req.body);
                const order = new Order({
                    customerId: req.body.customerId,
                    items: req.body.items,
                    address: req.body.address
                });

                const keys = [];
                const qtys = [];

                order.items.forEach(element => {
                    keys.push(element.item._id);
                    qtys.push(element.qty);
                });

                for (let i = 0; i < keys.length; i++) {
                    let product = await Product.findOne({ _id: keys[i] });
                    let update = await Product.updateOne({ _id: keys[i] }, { "stock": product.stock - qtys[i] }, { upsert: true });
                }

                await order.save();
                console.log('saved');
                return res.status(200).json({ message: "Order Placed" });
            } catch (err) {
                console.log(err);
                return res.status(400).json({ error: "Something went Wrong" });
            }
        },

        async getorder(req, res) {
            try {
                const orders = await Order.find({ customerId: req.body.customerId }, null, {
                    sort: {
                        'createdAt': -1
                    }
                });
                return res.json(orders);
            } catch (err) {
                console.log(err);
                return res.status(400).json({ error: "Something went Wrong" });
            }
        },

        async getOrderId(req, res) {
            try {
                const order = await Order.findById(req.body.orderId);

                if (req.body.customerId === order.customerId.toString()) {
                    return res.json(order);
                } else {
                    return res.status(400).json({ error: "Not Found" });
                }
            } catch (err) {
                console.log(err);
                return res.status(400).json({ error: "Something went Wrong" });
            }
        }
    };
}

module.exports = orderController;

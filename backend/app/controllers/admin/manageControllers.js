const Order = require('../../models/order');
const Product = require('../../models/product');
const multer = require('multer');

function manageController() {
    return {
        async addProcuct(req, res) {
            try {
                const { name, description, category, price, rating, stock } = req.body;

                if (!name || !description || !category || !price || !rating || !stock) {
                    return res.status(400).json({ error: "All Fields Are Required!" });
                }
                if (!req.file) {
                    return res.status(400).json({ error: "Image File is Required!" });
                }

                const product = new Product({
                    name: name,
                    image: req.file.filename,
                    description: description,
                    category: category,
                    price: price,
                    rating: rating,
                    stock: stock,
                    initialItems: stock,
                });

                await product.save();
                return res.status(200).json({ success: "Data Saved!!" });
            } catch (err) {
                console.log(err);
                return res.status(400).json({ error: "Error Occurred" });
            }
        },

        async updateProduct(req, res) {
            try {
                const { name, cimage, description, category, price, rating, stock } = req.body;
                let product;

                if (!name || !description || !category || !price || !rating || !stock) {
                    return res.json({ error: 'All fields are required!!' });
                }

                if (!req.file) {
                    product = {
                        name: name,
                        image: cimage,
                        description: description,
                        category: category,
                        price: price,
                        rating: rating,
                        stock: stock
                    };
                } else {
                    product = {
                        name: name,
                        image: req.file.filename,
                        description: description,
                        category: category,
                        price: price,
                        rating: rating,
                        stock: stock
                    };
                }

                const _id = req.body.id;
                if (_id) {
                    await Product.findByIdAndUpdate(_id, product);
                    return res.status(200).json({ success: "Data Updated!!" });
                } else {
                    return res.status(200).json({ error: "Data Update Failed!!" });
                }
            } catch (err) {
                console.log(err);
                return res.status(400).json({ error: "Error Occurred" });
            }
        },

        async deleteProduct(req, res) {
            try {
                const id = req.body.productId;
                if (id) {
                    await Product.findByIdAndDelete(id);
                    return res.status(200).json({ success: 'Product Deleted Successfully' });
                } else {
                    return res.status(200).json({ error: 'Product Delete failed' });
                }
            } catch (err) {
                console.log(err);
                return res.status(400).json({ error: "Error Occurred" });
            }
        }
    };
}

module.exports = manageController;

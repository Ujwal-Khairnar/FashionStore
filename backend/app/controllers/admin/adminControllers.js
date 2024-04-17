const Order = require("../../models/order");
const Product = require("../../models/product");

function adminController() {
  return {
    async index(req, res) {
      try {
        const orders = await Order.find({ status: { $ne: "completed" } }, null, {
          sort: { createdAt: -1 },
        })
          .populate("customerId", "-password")
          .exec();

        if (orders.length > 0) {
          return res.json(orders);
        } else {
          return res.status(400).json({ error: "Not found" });
        }
      } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    },

    updateOrderStat(req, res) {
      try {
        Order.updateOne(
          { _id: req.body.orderId },
          { status: req.body.status },
          (err, data) => {
            if (err) {
              return res.status(400).json({ error: "Error Occurred" });
            }
            return res.status(201).json({ message: "Updated Status" });
          }
        );
      } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    },

    async getstats(req, res) {
      try {
        const products = await Product.find();
        const mens = await Product.find({ category: "mens" });
        const womens = await Product.find({ category: "womens" });
        const kids = await Product.find({ category: "kids" });
        const living = await Product.find({ category: "living" });
        const sports = await Product.find({ category: "sports" });

        const categories = [mens, womens, kids, living, sports];
        const percentages = [];

        function getpercentage(itemsArray) {
          let totalsold = 0,
            totalitems = 0,
            category;
          itemsArray.forEach((item) => {
            totalsold += item.initialItems - item.stock;
            totalitems += item.initialItems;
            category = item.category;
          });
          const percent = Math.round((totalsold * 100) / totalitems);
          return {
            name: category,
            percent: percent,
            totalitems: totalitems,
            solditems: totalsold,
          };
        }

        categories.forEach((category) => {
          percentages.push(getpercentage(category));
        });

        if (req.body.filter !== "") {
          const filter = req.body.filter;
          const today = new Date();
          const d = new Date().toISOString();
          const wd = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() - 7
          ).toISOString();
          const md = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() - 28
          ).toISOString();

          function getSales(salesArray) {
            const salesDate = [];
            const statsData = [];
            const values = [];
            let i = 0;
            salesArray.forEach((sales) => {
              values.push(Object.values(sales.items));
              salesDate.push(sales.createdAt);
              i++;
            });
            values.forEach((item) => {
              item.forEach((itm) => {
                statsData.push(itm);
              });
            });
            return statsData;
          }

          let orders;
          if (filter === "week") {
            orders = await Order.find({ createdAt: { $lt: d, $gt: wd } })
              .populate("customerId", "-password")
              .exec();
          } else if (filter === "month") {
            orders = await Order.find({ createdAt: { $lt: d, $gt: md } })
              .populate("customerId", "-password")
              .exec();
          } else if (filter === "all") {
            orders = await Order.find().exec();
          }

          const statsData = getSales(orders || []);

          return res.status(200).json({ percentages: percentages, products: statsData });
        } else {
          return res.status(200).json({ percentages: percentages, products: products });
        }
      } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    },
  };
}

module.exports = adminController;

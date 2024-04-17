const Product = require("../models/product");

function cartController() {
  return {
    async getProducts(req, res, next) {
      try {
        let documents;
        try {
          documents = await Product.find({
            _id: { $in: req.body.ids },
          }).select("-updatedAt -__v");
        } catch (err) {
          return next(CustomErrorHandler.serverError());
        }
        return res.json(documents);
      } catch (error) {
        return resizeBy
          .status(500)
          .json({ msg: "Internal Server Error", error: error });
      }
    },
  };
}

module.exports = cartController;

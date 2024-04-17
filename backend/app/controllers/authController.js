const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

function authController() {
  return {
    //FOR LOGININ USER
    async login(req, res) {
      try {
        const { email, password } = req.body;

        if (!email || !password) {
          return res.status(400).json({ error: "Please Fill Credentials" });
        }
        const user = await User.findOne({ email }).lean();

        console.log("Email" + email + " pass: " + password);

        if (!user) {
          return res.status(400).json({ error: "Invalid email" });
        }

        if (await bcrypt.compare(password, user.password)) {
          // the email, password combination is successful

          const token = jwt.sign(
            {
              id: user._id,
              name: user.name,
              role: user.role,
              email: user.email,
              address: user.address,
            },
            process.env.JWT_SECRET
          );

          res.cookie("jwtoken", token, {
            expires: new Date(Date.now() + 25892000000),
            httpOnly: true,
          });

          return res.status(200).json({ data: token });
        }

        return res.status(400).json({ error: "Invalid password" });
      } catch (error) {
        return res
          .status(500)
          .json({ msg: "Internal Server Error", error: error });
      }
    },
    // For REGISTER USER
    async register(req, res) {
      try {
        const { name, email, password, address } = req.body;

        console.log(req.body);

        if (!email || !name || !password || !address) {
          return res.status(400).json({ error: "All felds are required!!" });
        }
        if (!email || typeof email !== "string") {
          return res.status(400).json({ error: "Invalid username" });
        }

        User.exists({ email: email }, (err, result) => {
          if (result) {
            return res.status(422).json({ error: "Username already in use" });
          }
        });

        //Hashing password
        const hashedPassword = await bcrypt.hash(password, 10);

        //creating user in db
        const user = new User({
          name: name,
          email: email,
          password: hashedPassword,
          address: address,
        });

        user
          .save()
          .then(() => {
            return res.status(201).json({ status: "ok" });
          })
          .catch((err) => {
            return res.status(400).json({ error: "Username already in use" });
          });
        console.log(req.body);
      } catch (error) {
        return res
          .status(500)
          .json({ msg: "Internal Server Error", error: error });
      }
    },
  };
}

module.exports = authController;

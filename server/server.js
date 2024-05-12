// Application server
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/User");
const bcrypt = require("bcrypt");
//Remember to include all external libraries like express.session
const session = require("express-session");
const MongoStore = require("connect-mongo");
mongoose.connect("mongodb://127.0.0.1/fake_so");

const mongoUrl = "mongodb://127.0.0.1:27017/auth_test";
const oneMinute = 60 * 1000;

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
const sessionStore = MongoStore.create({ mongoUrl });
app.use(
  session({
    secret: "itsasecret",
    resave: false,
    saveUninitialized: false,
    //I took secure out here, fix if it creates an issue
    cookie: { httpOnly: true, maxAge: oneMinute * 10, sameSite: "lax" },
    store: sessionStore,
  })
);

function isAuthenticated(req, res, next) {
  // console.log("Is Auth Session ID: ", req.session.id);
  if (req.session && req.session.user) {
    //Run next middle ware in chain
    next();
  } else {
    //They are not authenticated but no errors, therefore a guest
    res.send(false);
  }
}
app.get("/", isAuthenticated, async (req, res) => {
  res.send(req.session.user);
});
//Get requests should be idempotent meaning they just read a resource, not add one or anything
app.get("/check-existing-email", async (req, res) => {
  try {
    //Returns null if not found
    const user = await User.findOne({ email: req.query.email })
      .populate("userAnswers")
      .populate("userQuestions")
      .populate("userTags")
      .exec();
    if (user) {
      res.status(200).send(true);
    } else {
      res.status(200).send(false); // Email doesn't exist
    }
  } catch (error) {
    console.error("Error finding user:", error);
    res.status(500).send("Internal Server Error");
  }
});
//Sensitive information should always use post requests to hold in message body,
//not get request params and queries.
app.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    // hash employs Blowfish algorithm
    const hashedPassword = await bcrypt.hash(password, salt);
    const userFormat = {
      username: username,
      email: email,
      passwordHash: hashedPassword,
    };
    //Saves by along creating
    const newUser = await User.create(userFormat);

    res.status(201).json(newUser); //Sends the created user back if it is useful
  } catch (error) {
    console.error("Signup error: ", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      email: email,
    });
    if (!user) {
      return res.status(401).send("Invalid credentials");
    }
    const verdict = await bcrypt.compare(password, user.passwordHash);
    if (verdict) {
      req.session.user = user;
      res.send(user);
    } else {
      res.status(401).send("Invalid credentials");
    }
  } catch (error) {
    console.error("Login error: ", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/logout", async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Session destruction error:", err);
      return res.status(500).send("Failed to log out");
    }
    res.json({ redirectURL: "/" });
  });
});

//Routes for question,tags,answer querying
const questionRoutes = require("./routes/questionRoutes");
const tagRoutes = require("./routes/tagRoutes");
const answerRoutes = require("./routes/answerRoutes");
const userRoutes = require("./routes/userRoutes");
app.use("/questions/api", questionRoutes);
app.use("/tags/api", tagRoutes);
app.use("/answers/api", answerRoutes);
app.use("/users/api", userRoutes);

// const PORT = 8000;
// app.listen(PORT, () => console.log(`Running on PORT: ${PORT}`));

module.exports = { app, sessionStore };

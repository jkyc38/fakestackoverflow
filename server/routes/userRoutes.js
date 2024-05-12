const express = require("express");
const router = express.Router();

const User = require("../models/User");

router.get("/fetchUser/:viewedUserID", async (req, res) => {
  try {
    const { viewedUserID } = req.params;
    console.log("HERE USER: ", viewedUserID);
    const user = await User.findOne({ _id: viewedUserID })
      .populate("userQuestions")
      .populate("userTags")
      .populate("userAnswers")
      .exec();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Error fetching user and their information" });
  }
});

router.get("/fetchAllUsers", async (req, res) => {
  try {
    const AllUsers = await User.find({})
      .populate("userQuestions")
      .populate("userTags")
      .populate("userAnswers")
      .exec();

    res.json(AllUsers);
  } catch (err) {
    res.status(500).json({ error: "Error fetching all users and their information." });
  }
});

router.delete("/deleteUser/:userID", async (req, res) => {
  try {
    const { userID } = req.params;
    const deletedUser = await User.findByIdAndDelete({ _id: userID });
    res.json(deletedUser);
  } catch (err) {
    res.status(500).json({ error: "Error deleting a user" });
  }
});
module.exports = router;

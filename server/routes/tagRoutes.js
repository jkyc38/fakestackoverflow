const express = require("express");
const router = express.Router();

const Tag = require("../models/Tag");
const Question = require("../models/Question");
const User = require("../models/User");
//? means the userEmail is optional
router.get("/fetchTags", async (req, res) => {
  try {
    //I believe becomes url decoded once it lands, handled by express
    const { userID } = req.query;
    let matchStage = {};
    //If there is a userEmail being passed then create a match expression
    let foundUser;
    if (userID) {
      foundUser = await User.findOne({ _id: userID })
        .populate("userAnswers")
        .populate("userQuestions")
        .populate("userTags")
        .exec();
      matchStage = { userId: foundUser._id };
    }
    //Aggregation good for operating on mass data, instead of looping through one by one
    //Note: Non dollar sign means a defined field, and dollar sign means using the value of a defined field
    const formattedTags = await Question.aggregate([
      { $match: matchStage },
      { $unwind: "$tags" }, //Splits the question collections into individual documents with a single tag element each
      {
        $lookup: {
          //Fetches/joins the actual tag document based on the tagID from each question document that was unwinded
          from: "tags",
          localField: "tags",
          foreignField: "_id",
          as: "tagDetails", //Creates a new tagDetails array temporarily in each question document that holds the actual associated tag document
        },
      },
      { $unwind: "$tagDetails" }, //This split for the new field is mainly just for unpacking the document from its array so its just the object itself
      {
        $group: {
          _id: "$tags", //Regroup all the question documents now by the same tags elements
          tag: { $first: "$tagDetails.name" }, //Group the documents on the tag name value of the first document in each group
          count: { $sum: 1 }, //Count documents in each group
        },
      },
      //Basically lets you keep what you want in the aggregation
      {
        $project: {
          tag: 1,
          count: 1,
          _id: 0,
        },
      },
    ]);
    if (!foundUser) {
      res.json({ formattedTags: formattedTags });
    } else {
      console.log(foundUser);
      res.json({ formattedTags: formattedTags, foundUser: foundUser });
    }
  } catch (err) {
    res.status(500).send("Unable to fetch all tags from database.");
  }
});

router.put("/editTag", async (req, res) => {
  try {
    const { name: tagName, oldTagName } = req.query;
    const oldTag = await Tag.findOne({ name: oldTagName });
    //Is the new tag already existing?
    const newTag = await Tag.findOne({ name: tagName });
    // If the new name is already taken then just transfer the questions over and only if the old tag has no other questions
    if (oldTag.associatedUsers.length <= 1 && newTag) {
      newTag.associatedUsers.push(oldTag.associatedUsers[0]);
      newTag.save();
      await Tag.deleteTagAndRefsById(oldTag._id.toHexString());
    } else if (oldTag.associatedUsers.length <= 1 && !newTag) {
      oldTag.name = tagName;
      oldTag.save();
    } else {
      // If another user is using this tag, send a 400 Bad Request response
      res.status(400).json({ error: "Another user is using this tag, cannot delete." });
    }
    res.end();
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/deleteTag/:name", async (req, res) => {
  try {
    const { name: tagName } = req.params;
    const foundTag = await Tag.findOne({ name: tagName });
    console.log("The tag name: ", foundTag);
    if (foundTag.associatedUsers.length <= 1) {
      console.log("WHAT ARE UUUU ", foundTag._id.toHexString());
      await Tag.deleteTagAndRefsById(foundTag._id.toHexString());
    } else {
      // If another user is using this tag, send a 400 Bad Request response
      res.status(400).json({ error: "Another user is using this tag, cannot delete." });
    }
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = router;

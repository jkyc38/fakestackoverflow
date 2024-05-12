const express = require("express");
const router = express.Router();

const Question = require("../models/Question");
const Tag = require("../models/Tag");
const User = require("../models/User");
const Answer = require("../models/Answer");

async function createNewQuestion(questionData, user, existingQuestionId = null) {
  const tagNames = questionData.tags;
  // console.log("what is the data: ", questionData);
  // All promises need to fulfill before execution continues and async returns a promise no matter what
  const createdTags = await Promise.all(
    tagNames.map(async (tagName) => {
      const existingTag = await Tag.findOne({ name: tagName }).exec();
      // console.log("existing tag? ", existingTag);
      if (existingTag) {
        return existingTag;
      } else {
        const newTag = new Tag({ name: tagName });
        return await newTag.save();
      }
    })
  );

  let question;
  if (existingQuestionId) {
    question = await Question.findById(existingQuestionId).populate("tags");
    if (!question) {
      throw new Error("Question not found");
    }
    question.tags.forEach(async (tag) => {
      //Boolean to see if the newly created tags array contains a previously inserted tag
      const currentTagID = tag._id.toHexString();
      const isFound = createdTags.some(
        (createdTag) => createdTag._id.toHexString() === currentTagID
      );
      //Doesnt cover for the fact that a user can reuse a tag lol
      //If not included in the newly created array and it is not used in any other question, then delete it
      if (!isFound && tag.associatedUsers.length === 1) {
        //If it is just not found in the newly created tags array then just get rid of this question from its associated questions
        await Tag.deleteTagAndRefsById(currentTagID);
      } else if (!isFound) {
        tag.associatedUsers = tag.associatedUsers.filter(
          (tagsUser) => tagsUser._id.toHexString() !== question.userId.toHexString()
        );
        tag.save();
      }
    });

    question.title = questionData.questionTitle;
    question.summary = questionData.questionSummary;
    question.text = questionData.questionText;
    question.tags = createdTags;
  } else {
    question = new Question({
      title: questionData.questionTitle,
      summary: questionData.questionSummary,
      text: questionData.questionText,
      tags: createdTags,
      asked_by: user.username,
      userId: user._id,
    });
  }
  const savedQuestion = await question.save();
  createdTags.forEach((tag) => {
    //Pushing the actual doc so no need to populate
    // console.log("the tag: ", tag);
    if (!user.userTags.includes(tag._id)) {
      user.userQuestions.push(tag);
    }
    tag.associatedUsers.push(user);
    tag.save();
    // console.log("the tag now: ", tag);
  });
  //Only those that are new, you push the new object in
  if (!user.userQuestions.includes(savedQuestion._id)) {
    user.userQuestions.push(savedQuestion);
  }
  //Does this work for sensitive cases? idk, have to use id because the objects are treated differently.
  //Can i still convert the things back to documents? -> idk
  const newTags = createdTags.filter((tag) => !user.userTags.includes(tag._id));
  user.userTags.push(...newTags);
  await user.save();
  return question;
}

router.get("/fetchQuestions", async (req, res) => {
  try {
    const { userEmail } = req.query;
    // console.log(userEmail);
    //load all questions that user has answered
    const userQuestions = [];
    if (userEmail) {
      console.log("BRUH AND SHITS");
      const foundUser = await User.findOne({ email: userEmail });
      const answers = await Answer.find({ userId: foundUser._id }).populate("questionId");
      answers.forEach((answer) => {
        userQuestions.push(answer.questionId);
      });
      await Question.populate(userQuestions, { path: "tags answers" });
      return res.json(userQuestions);
    }
    // Replaces the tags array with ObjectIds that reference to tags
    const questions = await Question.find().populate("tags").populate("answers");
    res.json(questions);
  } catch (err) {
    res.status(500).send("Unable to fetch all questions from database.");
  }
});

router.post("/increment-view", async (req, res) => {
  try {
    const id = req.body.qid;
    const question = await Question.findById(id);
    question.views++;
    await question.save();
    res.json({ views: question.views });
    // next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Error incrementing view count:", error);
    res.status(500).json({ error: "Error incrementing view count" });
  }
});

router.post("/addQuestion", async (req, res) => {
  try {
    const { questionData, userEmail } = req.body;
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // Allows for a chainable alias of res.statusCode()
    res.status(201).json(createNewQuestion(questionData, user));
  } catch (err) {
    res.status(500).json({ error: "Error adding question" });
  }
});

router.get("/getQuestion", async (req, res) => {
  // console.log(req.query)
  // console.log(req.query.qid);
  // console.log(typeof req.query.qid);
  try {
    const question = await Question.findById(req.query.qid)
      .populate({
        path: "answers",
        populate: {
          path: "comments",
          model: "Comments",
        },
      })
      .populate("tags");
    // console.log(question);

    res.status(200).json(question);
  } catch (e) {
    res.status(500).json({ error: "Error fetching a question" });
  }
  //TODO
  //find question with the id given
  //return the question
  //load in the question content
  //reputation system
});

router.post("/updateQuestion/:qid", async (req, res) => {
  try {
    const { qid } = req.params;
    const { updatedData, currentUser } = req.body;
    const user = await User.findOne({ email: currentUser.email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const updatedQuestion = await createNewQuestion(updatedData, user, qid);
    res.json(updatedQuestion);
  } catch (err) {
    res.status(500).json({ error: "Error updating a question" });
  }
});

router.delete("/deleteQuestion/:qid", async (req, res) => {
  try {
    const { qid } = req.params;
    const deletedQuestion = await Question.findByIdAndDelete({ _id: qid });
    if (!deletedQuestion) {
      return res.status(400).json({ error: "Unable to delete question" });
    }
    res.json(deletedQuestion);
  } catch (err) {
    res.status(500).json({ error: "Error deleting a question" });
  }
});
module.exports = router;

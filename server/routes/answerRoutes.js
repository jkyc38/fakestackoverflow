const express = require("express");
const router = express.Router();

const Question = require("../models/Question");
const Answer = require("../models/Answer");
const User = require("../models/User");
const Comment = require("../models/Comment");

router.post("/add-answer", async (req, res) => {
  try {

    const answer = await Answer.create({
      text: req.body.text,
      ans_by: req.body.ans_by,
      userId: req.body.userId,
      questionId: req.body.questionId
    });
    answer.save();

    const foundUser = await User.findById(req.body.userId);
    foundUser.userAnswers.push(answer._id);
    foundUser.save()

    const question = await Question.findById(req.body.questionId);
    question.answers.push(answer._id);
    question.save();
    res.end();
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Error" });
  }
});

router.post("/upvote/question", async (req, res) => {
  try {
    const question = await Question.findById(req.body.postTypeId);
    question.upvotes = req.body.value;
    question.save();
    res.end();
  } catch (e) {
    console.log(e);
    console.log("wtf");
    res.status(500).json({ error: "Error" });
  }
});

router.post("/upvote/answer", async (req, res) => {
  try {
    const answer = await Answer.findById(req.body.postTypeId);
    answer.upvotes = req.body.value;
    answer.save();
    res.end();
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Error" });
  }
});

router.post("/upvote/comment", async (req, res)=>{
  try{
    const comment = await Comment.findById(req.body.postTypeId);
    comment.upvotes = req.body.value;
    comment.save();
    res.end();
  }catch (e) {
    res.status(500).json({ error: "Error" });
  }
});

router.post("/add-comment", async (req, res) => {
  //need to
  console.log(req.body);
  try {
    const comment = await Comment.create({
      text: req.body.comment,
      comment_by: req.body.user.username,
    });
    const answer = await Answer.findById(req.body.aid);
    answer.comments.push(comment);
    await answer.save();
    console.log(comment);
    res.end();
  } catch (e) {
    res.status(500).json({ error: "Error" });
  }
});

router.post("/update-reputation", async (req, res) => {
  // console.log("REPS AND SHIT")
  // console.log(req.body)
  try {
    const user = await User.findById(req.body.userId);
    // console.log(user);
    user.reputation += req.body.updateRep;
    // console.log(user.reputation);
    user.save();
    // console.log(user);
    res.end();
  } catch (e) {
    console.log(e);
  }
});

router.post("/delete-answer", async(req, res)=>{
  console.log(req.body.answerId);
  try{
    const answer = await Answer.deleteOne({_id: req.body.answerId})
  }
  catch(e){
    res.status(500).json({error: "Error"})
  }
})
router.post("/edit-answer", async(req, res)=>{
  try{
    const answer = await Answer.findById(req.body.answerId);
    answer.text = req.body.text;
    answer.save()
  }
  catch(e){
    res.status(500).json({error: "Error"})

  }
})

module.exports = router;

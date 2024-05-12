// Answer Document Schema
const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
  },
  ans_by: {
    type: String, //Cant have an anonymous user and guests cant make answers anyways
    // type: mongoose.Schema.Types.ObjectId,
    // ref: "User",
    required: true, //Required to have a user to answer
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  questionId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Questions",
  },
  ans_date_time: {
    type: Date,
    default: () => new Date(),
  },
  upvotes: {
    type: Number,
    default: 0,
  },
  comments: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comments" }],
  },
});

// Cannot use arrow function because of the way this is assigned
answerSchema.virtual("url").get(function () {
  return `posts/answer/${this._id}`;
});

module.exports = mongoose.model("Answers", answerSchema);

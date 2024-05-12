// Question Document Schema
const mongoose = require("mongoose");

//Need to import Tag and Answer schema because they are used as a ref in questions, even if unused
// const Tag = require('../models/Tag');
// const Answer = require('../models/Answer');
const User = require("./User");
const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxLength: 50,
  },
  summary: {
    type: String,
    required: true, //Is this required?
    maxLength: 140,
  },
  text: {
    type: String,
    required: true,
  },
  tags: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tags", required: true }],
  },
  answers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Answers" }],
  asked_by: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  ask_date_time: {
    type: Date,
    default: () => new Date(),
  },
  /*The page displays the question title, the total
number of answers, and the total number of views
(including the current view). Need to update views and grab answers array length? */
  views: {
    type: Number,
    default: 0,
  },
  upvotes: {
    type: Number,
    default: 0,
  },
});

questionSchema.virtual("url").get(function () {
  return `posts/question/${this._id}`;
});

questionSchema.pre("remove", async function () {
  const deletedQuestion = this;

  // Update references in User documents
  await User.updateMany(
    { userQuestions: { $in: [deletedQuestion._id] } },
    { $pull: { posts: deletedQuestion._id } }
  );
});

module.exports = mongoose.model("Questions", questionSchema);

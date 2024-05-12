const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    validate: {
      validator: function (text) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(text);
      },
      message: "Must be a valid email",
    },
  },
  passwordHash: {
    type: String,
    required: true,
  },
  acc_created_time: {
    type: Date,
    default: () => new Date(),
  },
  /* A field to enter tag names. Tag names are
separated by whitespace. A new tag name
can only be created by a user with at least 50
reputation points */
  reputation: {
    type: Number,
    default: 0,
  },
  admin: {
    type: Boolean,
    default: false,
  },
  userQuestions: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Questions" }],
  },
  userTags: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tags" }],
  },
  userAnswers: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Answers" }],
  },
});

userSchema.virtual("url").get(function () {
  return `posts/user/${this._id}`;
});

module.exports = mongoose.model("User", userSchema);

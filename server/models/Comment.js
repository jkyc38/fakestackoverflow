// Comment Document Schema
const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        const maxLength = 140;
        return value.length <= maxLength;
      },
      message: `Comment text exceeds the maximum length of 140 characters`,
    },
  }, //Do maxlength check on clientside too
  comment_by: { type: String, required: true },
  upvotes: { type: Number, default: 0 }, //No reputation constraint, do reputation checks on client instead of adding another field
  date: { type: Date, default: () => new Date() },
});

module.exports = mongoose.model("Comments", commentSchema);

// Tag Document Schema
const mongoose = require("mongoose");

const User = require("./User");
const Question = require("./Question");
const tagSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  associatedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

tagSchema.statics.deleteTagAndRefsById = async function (tagId) {
  try {
    // Delete the tag by ID
    const deletedTag = await this.findByIdAndDelete(tagId);
    if (!deletedTag) throw new Error("Tag not found.");

    // Update references in User documents
    await User.updateMany({ userTags: { $in: [tagId] } }, { $pull: { userTags: tagId } });
    await Question.updateMany({ tags: { $in: [tagId] } }, { $pull: { tags: tagId } });
    // Return the deleted tag
    return deletedTag;
  } catch (error) {
    throw error;
  }
};

module.exports = mongoose.model("Tags", tagSchema);

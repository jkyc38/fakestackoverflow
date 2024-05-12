import React, { useState } from "react";
import FormField from "./FormField";
import axios from "axios";
import LinkButton from "./LinkButton";
import { useParams } from "react-router-dom";

export default function TagsForm() {
  const { userID, tagName: oldTagName } = useParams();
  console.log(userID);
  const [tagName, setTagName] = useState(oldTagName);
  // State for checking if a error is present in the inputs
  const [error, setError] = useState(null);
  // Update the textbox values everytime they are changed lol
  function handleTextChange(value) {
    setTagName(value.trim());
  }

  async function handleOnEdit(newTagName) {
    try {
      console.log("huh");
      const res = await axios.put("http://localhost:8000/tags/api/editTag", null, {
        params: { name: newTagName, oldTagName },
      });
    } catch (err) {
      if (err.response && err.response.status === 400) {
        setError("Another user is using this tag, cannot edit.");
      } else {
        setError("Error editing tag.");
      }
    }
  }
  function handleTagSubmit(event) {
    if (tagName.length === 0) {
      setError("Tag name cannot be empty.");
      event.preventDefault();
      return;
    } else if (tagName === oldTagName) {
      // Do nothing if the tag name is the same as before
      return;
    } else {
      handleOnEdit(tagName);
    }
  }

  return (
    <div className="form-container">
      <form className="form">
        <FormField
          header="New Tag Name"
          caption="Edit tag name here"
          fieldType="input"
          errorMsg={error}
          isError={error}
          value={tagName}
          onTextChange={handleTextChange}
        />
        <LinkButton
          text="Change Tag"
          destination={`user/tags/${userID}`}
          handleOnClick={handleTagSubmit}
        />
      </form>
    </div>
  );
}

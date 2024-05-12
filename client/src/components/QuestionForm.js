import React, { useState, useContext, useEffect } from "react";
import FormField from "./FormField";
import LinkButton from "./LinkButton";
import axios from "axios";
import { useParams } from "react-router-dom";
import { LoginContext } from "./FakeStackOverflow";

export default function QuestionForm(props) {
  const { currentUser } = useContext(LoginContext);
  const { editMode } = props;
  const { qid } = useParams();
  const [editQuestion, setEditQuestion] = useState(null);
  // State for keeping track of the current inputs
  const [formFields, setFormFields] = useState({
    questionTitle: "",
    questionSummary: "",
    questionText: "",
    tags: "",
  });
  // State for checking if a error is present in the inputs
  const [errors, setErrors] = useState({
    questionTitle: false,
    questionSummary: false,
    questionText: false,
    tags: false,
    hyperlink: false,
  });
  // Update the textbox values everytime they are changed lol
  function handleTextChange(fieldName, value) {
    console.log("DJKAJD: ", value);
    setFormFields((prevFormFields) => ({
      ...prevFormFields,
      [fieldName]: value,
    }));
    if (fieldName === "questionText") {
      const regex = /(\[[^\]]+\])\(([^)]*)\)/g;
      const hasHyperlink = regex.test(value);
      setErrors((prevErrors) => ({
        ...prevErrors,
        hyperlink: hasHyperlink ? hasValidLink(value) === "invalidLink" : false,
      }));
    }
  }

  function hasValidLink(questionText) {
    const regex = /(\[[^\]]+\])\(([^)]*)\)/g;
    const matches = [...questionText.matchAll(regex)];
    let errorFlag = false;
    matches.forEach((match) => {
      const hyperlinkURL = match[2];
      if (!(hyperlinkURL.startsWith("https://") || hyperlinkURL.startsWith("http://"))) {
        errorFlag = true;
      }
    });
    return errorFlag || matches.length === 0 ? "invalidLink" : matches;
  }

  async function handleQuestionSubmit(questionData) {
    try {
      const oldTags = questionData.tags;
      const newTags = [];
      oldTags.forEach((oldTag) => {
        // If the new tags array does not include a duplicate or its lowercase effectively checking if it for both upper and lowercase
        if (!(newTags.includes(oldTag) || newTags.includes(oldTag.toLowerCase()))) {
          newTags.push(oldTag);
        }
      });
      questionData.tags = newTags;
      console.log("USER: ", currentUser);
      await axios.post("http://localhost:8000/questions/api/addQuestion", {
        questionData,
        userEmail: currentUser.email,
      });
      console.log("NEW QUESTION: ", questionData);
    } catch (err) {
      console.error(`Failed to add a question: ${err.message}`);
    }
  }

  async function updateQuestion(updatedData) {
    try {
      await axios.post(`http://localhost:8000/questions/api/updateQuestion/${qid}`, {
        updatedData,
        currentUser,
      });
      console.log("Question updated successfully!");
      // Perform any necessary UI updates or notifications
    } catch (error) {
      console.error("Failed to update question:", error);
    }
  }

  async function handleDelete(event) {
    try {
      await axios.delete(`http://localhost:8000/questions/api/deleteQuestion/${qid}`);
      console.log("Question deleted successfully!");
    } catch (err) {
      alert("Couldn't delete question");
    }
  }
  // Handle error checking when the "post question" button is clicked
  function handlePostSubmit(event) {
    const newErrors = { ...errors };
    let hasError = false;
    const updatedFormFields = { ...formFields };

    Object.keys(updatedFormFields).forEach((fieldName) => {
      const input = updatedFormFields[fieldName].trim();
      switch (fieldName) {
        case "questionTitle": {
          newErrors[fieldName] = input.length === 0 || input.length > 100;
          break;
        }
        case "questionText": {
          newErrors[fieldName] = input.length === 0;
          break;
        }
        case "tags": {
          // Console.log to make sure you are doing correct check for empty tag or any of the previous ones different checks
          const tags = input.split(/\s+/);
          let tagErrorFlag = 0;
          tags.forEach((tag) => {
            if (tag.length > 20) {
              tagErrorFlag = 1;
            }
          });

          updatedFormFields[fieldName] = tags
            .map((tag) => tag.toLowerCase())
            .filter((tag, index) => tags.indexOf(tag.toLowerCase()) === index);
          newErrors[fieldName] =
            (tags.length === 1 && tags[0] === "") || tagErrorFlag === 1 || tags.length > 5;
          break;
        }
        case "questionSummary": {
          newErrors[fieldName] = input.length === 0 || input.length > 140;
          break;
        }
        default:
          break;
      }
      // Check to see if there is at least one error present
      if (newErrors[fieldName] || newErrors.hyperlink) {
        hasError = true;
      }
    });
    setErrors(newErrors);
    // If there are errors then prevent button click and return from function
    if (hasError) {
      event.preventDefault();
      return;
    }

    const hyperLinks = hasValidLink(updatedFormFields.questionText);
    if (hyperLinks !== "invalidLink") {
      hyperLinks.forEach((match) => {
        const hyperlinkName = match[1].substring(1, match[1].length - 1);
        const hyperlinkURL = match[2];
        updatedFormFields.questionText = updatedFormFields.questionText.replace(
          `${match[1]}(${match[2]})`,
          `<a href="${hyperlinkURL}" target="_blank">${hyperlinkName}</a>`
        );
      });
    }
    // Due to react batching asynchronus operations, errors or form fields will not update immediately, apparent in a log
    setFormFields(updatedFormFields);

    //If a question is being edited then update the question else you are submitting a new question
    if (editQuestion) {
      updateQuestion(updatedFormFields);
    } else {
      handleQuestionSubmit(updatedFormFields);
    }
  }
  async function fetchQuestion(qid) {
    try {
      let response = await axios.get("http://localhost:8000/questions/api/getQuestion", {
        params: {
          qid,
        },
      });
      setEditQuestion(response.data);
      const newEditQuestion = response.data;
      const updatedFormFields = {
        questionTitle: newEditQuestion.title,
        questionSummary: newEditQuestion.summary,
        questionText: newEditQuestion.text,
        tags: newEditQuestion.tags.map((tag) => tag.name).join(" "),
      };
      setFormFields(updatedFormFields);
    } catch (err) {
      console.error("Unable to fetch a question for editing/answering ", err);
    }
  }

  useEffect(() => {
    if (editMode && qid) {
      fetchQuestion(qid);
    }
  }, [editMode, qid]);

  return (
    <div className="form-container">
      <form className="form">
        <FormField
          header="Question Title*"
          caption="Limit title to 100 characters or less"
          fieldType="input"
          errorMsg="Title must be 1-100 characters."
          value={formFields.questionTitle}
          formField="questionTitle"
          isError={errors.questionTitle}
          onTextChange={handleTextChange}
        />
        <FormField
          header="Summary*"
          fieldType="input"
          errorMsg="Summary must be 1-140 characters."
          value={formFields.questionSummary}
          formField="questionSummary"
          isError={errors.questionSummary}
          onTextChange={handleTextChange}
        />
        <FormField
          header="Question Text*"
          caption="Add details*"
          fieldType="textarea"
          errorMsg={
            errors.questionText
              ? "Text cannot be empty."
              : "Link target must begin with http:// or https://"
          }
          value={formFields.questionText}
          formField="questionText"
          isError={errors.questionText ? errors.questionText : errors.hyperlink}
          onTextChange={handleTextChange}
        />
        <FormField
          header="Tags*"
          caption="Add keywords separated by whitespace"
          fieldType="input"
          errorMsg="Limit tags to 5 with 20 characters max per tag."
          value={formFields.tags}
          formField="tags"
          isError={errors.tags}
          onTextChange={handleTextChange}
        />
        <LinkButton
          text={`${editMode ? "Submit Edit" : "Post Question"} `}
          destination="questions"
          handleOnClick={handlePostSubmit}
        />
        {editMode && (
          <LinkButton
            styles={{marginLeft: 20}}
            text={"Delete Question"}
            destination="questions"
            handleOnClick={handleDelete}
          />
        )}
        <span style={{ color: "red", marginLeft: "10px" }}>* indicates mandatory fields</span>
      </form>
    </div>
  );
}

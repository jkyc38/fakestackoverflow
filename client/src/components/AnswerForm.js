import React, { useState, useContext } from 'react';
import axios from 'axios';
import FormField from './FormField';
import LinkButton from './LinkButton'
import { useNavigate, useParams } from 'react-router-dom';
import { LoginContext } from './FakeStackOverflow';
// import PostButton from './PostButton';

export default function AnswerForm ({userEmail}) {
  // let answers = props.model.data.answers;
  const {currentUser} = useContext(LoginContext);
  const [serverError, setServerError] = useState(false);
  console.log(currentUser);
  const navigate = useNavigate();
  let {id, answerId} = useParams();
  // const question = props.model.getQuestion(props.qid);
  // State for keeping track of the current inputs
  const [formFields, setFormFields] = useState({
    answerText: ''
  });
  // State for checking if a error is present in the inputs
  const [errors, setErrors] = useState({
    username: false,
    answerText: false,
    hyperlink: false
  });
  // Update the textbox values everytime they are changed lol
  function handleTextChange (fieldName, value) {
    setFormFields((prevFormFields) => ({
      ...prevFormFields,
      [fieldName]: value
    }));
    if (fieldName === 'answerText') {
      const regex = /(\[[^\]]+\])\(([^)]*)\)/g;
      const hasHyperlink = regex.test(value);
      setErrors((prevErrors) => ({
        ...prevErrors,
        hyperlink: hasHyperlink ? hasValidLink(value) === 'invalidLink' : false
      }));
    }
  }

  function hasValidLink (answerText) {
    const regex = /(\[[^\]]+\])\(([^)]*)\)/g;
    const matches = [...answerText.matchAll(regex)];
    let errorFlag = false;
    matches.forEach((match) => {
      const hyperlinkURL = match[2];
      if (!(hyperlinkURL.startsWith('https://') || hyperlinkURL.startsWith('http://'))) {
        errorFlag = true;
      }
    });
    return errorFlag || matches.length === 0 ? 'invalidLink' : matches;
  }

  function handlePostSubmit (event) {
    console.log("bruh")
    const newErrors = { ...errors };
    let hasError = false;
    const updatedFormFields = { ...formFields };
    Object.keys(updatedFormFields).forEach((fieldName) => {
      const input = updatedFormFields[fieldName].trim();
      switch (fieldName) {
        case 'answerText':
          newErrors[fieldName] = input.length === 0;
          break;
        default:
          break;
      }
      // Check to see if there is at least one error present
      if (newErrors[fieldName] || newErrors.hyperlink) {
        hasError = true;
      }
    });

    const hyperLinks = hasValidLink(updatedFormFields.answerText);
    if (hyperLinks !== 'invalidLink') {
      console.log('HEREEE');
      console.log(hyperLinks);
      hyperLinks.forEach((match) => {
        const hyperlinkName = match[1].substring(1, match[1].length - 1);
        const hyperlinkURL = match[2];
        updatedFormFields.answerText = updatedFormFields.answerText.replace(
          `${match[1]}(${match[2]})`,
          `<a href="${hyperlinkURL}" target="_blank">${hyperlinkName}</a>`
        );
      });
    }
    setFormFields(updatedFormFields);
    setErrors(newErrors);
   
    console.log("yooo");
    if(updatedFormFields.answerText){
      const postData = {
        text: updatedFormFields.answerText,
        ans_by: currentUser.username,
        userId: currentUser._id,
        questionId: id,
        answerId: answerId
      }

    if(userEmail){
      const ENDPOINT = "http://localhost:8000/answers/api/edit-answer"
      axios.post(ENDPOINT, postData);

    }
    else{
      axios.post('http://localhost:8000/answers/api/add-answer', postData)
        .catch(error=>{
          console.log(error);
          setServerError(true);
        })
        setServerError(false);
    }
    }
    // If there are no errors then toggle the questionSection
    // If there are errors then prevent button click and return from function
    if (hasError||serverError) {
      event.preventDefault();
      return;
    }
    else{
      navigate(`/answers/${id}`);
    }

  }
  //if user is logged autofill the username with the users' username, 
  //if the person is guest lead them to this 
  return (
    <div className="form-container">
      {/* {serverError&&
      <span>Server Error</span>} */}
      <form className="form">
        <FormField
          header="Answer Text*"
          fieldType="textarea"
          caption="Add Details"
          errorMsg={
            errors.answerText
              ? 'Text cannot be empty.'
              : 'Link target must begin with http:// or https://'
          }
          formField="answerText"
          isError={errors.answerText ? errors.answerText : errors.hyperlink}
          onTextChange={handleTextChange}
        />
        {/* <PostButton onPostSubmit={handlePostSubmit} /> */}
        <LinkButton 
          text="Post Answer"
          handleOnClick={handlePostSubmit}
        ></LinkButton>
        
        <span style={{ color: 'red', marginLeft: '60px' }}>* indicates mandatory fields</span>
      </form>
    </div>
  );
}

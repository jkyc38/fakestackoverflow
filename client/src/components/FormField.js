import React from "react";
export default function FormField(props) {
  // Should the event handler be onChange to check if the character limit breaks one of the following to show the hidden error?
  function handleChange(event) {
    if (props.formField) {
      props.onTextChange(props.formField, event.target.value);
    } else {
      props.onTextChange(event.target.value);
    }
  };
  return (
    <div className="form-field__container">
      <div className="form-field">
        <h2 className="form-field__header">{props.header}</h2>
        <span className="form-field__caption">{props.caption}</span>
        <div className="form-field__container">
          {props.fieldType === "textarea" ? (
            <textarea className="form-field__input" onChange={handleChange} value={props.value} />
          ) : (
            <input
              className="form-field__input"
              type={props.fieldType} //Whatever type was passed in will be the type of the input tag
              onChange={handleChange}
              value={props.value}
            />
          )}
        </div>
        {props.isError && <span className="form-field__error-msg">{props.errorMsg}</span>}
      </div>
    </div>
  );
}

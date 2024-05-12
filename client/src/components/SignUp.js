import axios from "axios";
import { useState } from "react";
import FormField from "./FormField";
import LinkButton from "./LinkButton";
import { useNavigate } from "react-router-dom";

import styles from "../stylesheets/Form.module.css";
export default function SignUpForm() {
  const navigate = useNavigate();
  //For revealing the passwords in sign up
  const [showPasswords, setShowPasswords] = useState({
    show_password: false,
    show_verify_password: false,
  });
  const [signUpData, setSignUpData] = useState({
    email: "",
    username: "",
    password: "",
    verify_password: "",
  });
  const [errors, setErrors] = useState({
    empty_username: false,
    invalid_email: false,
    empty_email: false,
    existing_email: false,
    password_empty: false,
    password_containsInfo: false,
    password_unequal: false,
  });
  function handleTextChange(fieldName, value) {
    setSignUpData((prevFormFields) => ({
      ...prevFormFields,
      [fieldName]: value,
    }));
  }
  //Whether to show a password field or not
  function handleShowPassword(passwordField) {
    setShowPasswords((prevShowPasswords) => ({
      ...prevShowPasswords,
      [passwordField]: !prevShowPasswords[passwordField],
    }));
  }
  function getInfoFromEmail(email) {
    let atIndex = email.indexOf("@");
    //Return the length of the "email" field if it doesnt have the @ so we can still check
    let username = email.substring(0, atIndex === -1 ? email.length : atIndex);
    return username;
  }
  async function isExistingEmail(email) {
    try {
      let response = await axios.get("http://localhost:8000/check-existing-email", {
        params: {
          email: email,
        },
      });
      return response.data; // Assuming the response from the backend is a boolean indicating whether the email exists
    } catch (error) {
      console.error("Error checking existing email:", error);
      return false; // Return false if there's an error
    }
  }

  async function createAccount(event) {
    //Just check all of them, no need to loop through
    const newErrors = {
      empty_username: signUpData.username.length === 0,
      invalid_email: !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(signUpData.email),
      empty_email: signUpData.email.trim().length === 0,
      existing_email: await isExistingEmail(signUpData.email),
      password_empty: signUpData.password.trim().length === 0,
      password_containsInfo:
        getInfoFromEmail(signUpData.email) &&
        signUpData.username &&
        (signUpData.password.includes(getInfoFromEmail(signUpData.email)) ||
          signUpData.password.includes(signUpData.username)),
      password_unequal: signUpData.password !== signUpData.verify_password,
    };

    setErrors(newErrors);
    if (Object.values(newErrors).some((error) => error)) {
      event.preventDefault();
      return;
    }
    try {
      await axios.post("http://localhost:8000/signup", {
        email: signUpData.email,
        username: signUpData.username,
        password: signUpData.password,
      });
      navigate("/login");
    } catch (error) {
      console.error("Error signing up: ", error);
    }
  }
  return (
    <div className={styles.formContainer}>
      <h1>Join FakeStackOverflow Today!</h1>

      <form className="sign-up__form">
        <FormField
          header="Email"
          fieldType="email"
          formField="email"
          onTextChange={handleTextChange}
          errorMsg={
            errors.empty_email
              ? "Email cannot be empty"
              : errors.invalid_email
              ? "Email is invalid"
              : errors.existing_email
              ? "Email already exists"
              : null
          }
          isError={errors.empty_email || errors.invalid_email || errors.existing_email}
        />
        <FormField
          header="Username"
          fieldType="text"
          formField="username"
          onTextChange={handleTextChange}
          errorMsg="Username cannot be empty"
          isError={errors.empty_username}
        />
        <FormField
          header="Password"
          fieldType={`${showPasswords.show_password ? "text" : "password"}`}
          formField="password"
          onTextChange={handleTextChange}
          errorMsg={
            errors.password_empty
              ? "Password cannot be empty"
              : errors.password_containsInfo
              ? "Password can't contain username or email"
              : null
          }
          isError={errors.password_containsInfo || errors.password_empty}
        />
        <div style={{ marginTop: 5 }}>
          <input
            className="form-field__showpass"
            type="checkbox"
            onClick={() => handleShowPassword("show_password")}
          />
          Show Password
        </div>
        {/* verify that passwords are the same */}
        <FormField
          header="Verify Password"
          fieldType={`${showPasswords.show_verify_password ? "text" : "password"}`}
          formField="verify_password"
          onTextChange={handleTextChange}
          errorMsg={errors.password_unequal ? "Passwords are not the same" : null}
          isError={errors.password_unequal}
        />
        <div style={{ marginBottom: 20, marginTop: 5 }}>
          <input
            className="form-field__showpass"
            type="checkbox"
            onClick={() => handleShowPassword("show_verify_password")}
          />
          Show Password
        </div>

        <LinkButton
          text="Sign up"
          styles={{ width: 357 }}
          handleOnClick={(event) => createAccount(event)}>
          Sign Up
        </LinkButton>
      </form>
    </div>
  );
}

import axios from "axios";
import { useState, useContext } from "react";
import FormField from "./FormField";
import { useNavigate } from "react-router-dom";
import LinkButton from "./LinkButton";
import { LoginContext } from "./FakeStackOverflow";
import styles from "../stylesheets/Form.module.css";

export default function Login({ updateFetch }) {
  const { handleAuthentication, currentUser } = useContext(LoginContext);
  //use useContext to pass to every component if the user is logged in or not
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({
    login_email: "",
    login_pw: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState({
    emptyEmail: false,
    invalidEmail: false,
    emptyPassword: false,
    loginError: false,
  });
  function handleTextChange(fieldName, value) {
    setLoginData((prevFormFields) => ({
      ...prevFormFields,
      [fieldName]: value,
    }));
  }
  function handleShowPassword() {
    setShowPassword(!showPassword);
  }
  async function login() {
    // event.preventDefault();
    let hasLoginError = false;
    //check with the database if the account exists and if it doesn't then throw an error
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    let hasValidEmail = regex.test(loginData.login_email);
    //check that email and password are the same only if not an invalid email
    if (hasValidEmail && loginData.login_pw) {
      try {
        let response = await axios.post(
          "http://localhost:8000/login",
          {
            email: loginData.login_email,
            password: loginData.login_pw,
          },
          { withCredentials: true }
        );
        handleAuthentication("login", response.data);
        navigate("/questions");
        // updateFetch(true);
      } catch (error) {
        hasLoginError = true;
      }
    }
    setError((prevErrors) => ({
      ...prevErrors,
      emptyEmail: loginData.login_email ? false : true,
      invalidEmail: !hasValidEmail,
      emptyPassword: loginData.login_pw ? false : true,
      loginError: hasLoginError,
    }));
  }
  return (
    <div className={styles.formContainer}>
      <h1>Login Page</h1>
      <FormField
        header="Email"
        fieldType="email"
        formField="login_email"
        onTextChange={handleTextChange}
        isError={error.emptyEmail ? error.emptyEmail : error.invalidEmail}
        errorMsg={error.emptyEmail ? "Email cannot be empty" : "This is not a valid email adddress"}
      />
      <FormField
        header="Password"
        fieldType={`${showPassword ? "text" : "password"}`}
        formField="login_pw"
        onTextChange={handleTextChange}
        isError={error.emptyPassword ? error.emptyPassword : error.loginError}
        errorMsg={error.emptyPassword ? "Password cannot be empty" : "Incorrect Password or Email"}
      />
      <div style={{ marginBottom: 20, marginTop: 5 }}>
        <input
          className="form-field__showpass"
          type="checkbox"
          onClick={() => handleShowPassword()}
        />
        Show Password
      </div>
      <LinkButton styles={{ width: 365 }} handleOnClick={login} text="Login"></LinkButton>
    </div>
  );
}

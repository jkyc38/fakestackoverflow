import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import LinkButton from "./LinkButton";
import { LoginContext, ThemeContext } from "./FakeStackOverflow";
import axios from "axios";

export default function Header(props) {
  const { handleAuthentication, currentUser } = useContext(LoginContext);
  const { isDark: darkMode, setIsDark: toggleDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  function checkProfile() {
    navigate("/users/profile/" + currentUser._id);
  }

  useEffect(() => console.log(darkMode), [darkMode]);
  function keyDown(event) {
    if (event.key === "Enter") {
      const searchValues = event.target.value.trim().split(/\s+/);
      props.handleSort(searchValues, "search");
      event.target.value = "";
    }
  }

  function returnHome() {
    navigate("/");
    navigate(0); //Refreshes the page so they get an indicator
  }
  async function logOut() {
    try {
      console.log("bruh");
      const res = await axios.post("http://localhost:8000/logout", { withCredentials: true });
      handleAuthentication("logout");
      
      navigate(res.data.redirectURL);
    } catch (error) {
      alert("Server not found.")
      navigate("/login")
    }
  }
  return (
    <>
      <div
        className="header"
        style={darkMode ? { backgroundColor: "#202124" } : { backgroundColor: "lightgray" }}>
        <span
          onClick={() => toggleDarkMode(!darkMode)}
          style={{ cursor: "pointer", marginLeft: "20px" }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1.5rem"
            height="1.5rem"
            viewBox="0 0 24 24"
            fill="none">
            <path
              d={
                darkMode
                  ? "M12 3V4M12 20V21M4 12H3M6.31412 6.31412L5.5 5.5M17.6859 6.31412L18.5 5.5M6.31412 17.69L5.5 18.5001M17.6859 17.69L18.5 18.5001M21 12H20M16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12Z"
                  : "M3.32031 11.6835C3.32031 16.6541 7.34975 20.6835 12.3203 20.6835C16.1075 20.6835 19.3483 18.3443 20.6768 15.032C19.6402 15.4486 18.5059 15.6834 17.3203 15.6834C12.3497 15.6834 8.32031 11.654 8.32031 6.68342C8.32031 5.50338 8.55165 4.36259 8.96453 3.32996C5.65605 4.66028 3.32031 7.89912 3.32031 11.6835Z"
              }
              stroke={darkMode ? "lightgray" : "black"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <button className="header__title" onClick={returnHome}>
          <b>Fake</b> Stack Overflow
        </button>
        <input
          className="header__searchbar"
          type="search"
          onKeyDown={keyDown}
          placeholder="Search..."
        />
        <div className="header__user--buttons">
          {currentUser ? (
            <>
              <span onClick={checkProfile} style={{ cursor: "pointer" }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="2rem"
                  height="2rem"
                  viewBox="0 0 24 24"
                  fill="none">
                  <path
                    d="M22 12C22 6.49 17.51 2 12 2C6.49 2 2 6.49 2 12C2 14.9 3.25 17.51 5.23 19.34C5.23 19.35 5.23 19.35 5.22 19.36C5.32 19.46 5.44 19.54 5.54 19.63C5.6 19.68 5.65 19.73 5.71 19.77C5.89 19.92 6.09 20.06 6.28 20.2C6.35 20.25 6.41 20.29 6.48 20.34C6.67 20.47 6.87 20.59 7.08 20.7C7.15 20.74 7.23 20.79 7.3 20.83C7.5 20.94 7.71 21.04 7.93 21.13C8.01 21.17 8.09 21.21 8.17 21.24C8.39 21.33 8.61 21.41 8.83 21.48C8.91 21.51 8.99 21.54 9.07 21.56C9.31 21.63 9.55 21.69 9.79 21.75C9.86 21.77 9.93 21.79 10.01 21.8C10.29 21.86 10.57 21.9 10.86 21.93C10.9 21.93 10.94 21.94 10.98 21.95C11.32 21.98 11.66 22 12 22C12.34 22 12.68 21.98 13.01 21.95C13.05 21.95 13.09 21.94 13.13 21.93C13.42 21.9 13.7 21.86 13.98 21.8C14.05 21.79 14.12 21.76 14.2 21.75C14.44 21.69 14.69 21.64 14.92 21.56C15 21.53 15.08 21.5 15.16 21.48C15.38 21.4 15.61 21.33 15.82 21.24C15.9 21.21 15.98 21.17 16.06 21.13C16.27 21.04 16.48 20.94 16.69 20.83C16.77 20.79 16.84 20.74 16.91 20.7C17.11 20.58 17.31 20.47 17.51 20.34C17.58 20.3 17.64 20.25 17.71 20.2C17.91 20.06 18.1 19.92 18.28 19.77C18.34 19.72 18.39 19.67 18.45 19.63C18.56 19.54 18.67 19.45 18.77 19.36C18.77 19.35 18.77 19.35 18.76 19.34C20.75 17.51 22 14.9 22 12ZM16.94 16.97C14.23 15.15 9.79 15.15 7.06 16.97C6.62 17.26 6.26 17.6 5.96 17.97C4.44 16.43 3.5 14.32 3.5 12C3.5 7.31 7.31 3.5 12 3.5C16.69 3.5 20.5 7.31 20.5 12C20.5 14.32 19.56 16.43 18.04 17.97C17.75 17.6 17.38 17.26 16.94 16.97Z"
                    fill={darkMode ? "lightgray" : "black"}
                  />
                  <path
                    d="M12 6.92969C9.93 6.92969 8.25 8.60969 8.25 10.6797C8.25 12.7097 9.84 14.3597 11.95 14.4197C11.98 14.4197 12.02 14.4197 12.04 14.4197C12.06 14.4197 12.09 14.4197 12.11 14.4197C12.12 14.4197 12.13 14.4197 12.13 14.4197C14.15 14.3497 15.74 12.7097 15.75 10.6797C15.75 8.60969 14.07 6.92969 12 6.92969Z"
                    fill={darkMode ? "lightgray" : "black"}
                  />
                </svg>
              </span>
              <p>{`Welcome ${currentUser.username} `}</p>
              <LinkButton handleOnClick={logOut} text={"Log Out"} />
            </>
          ) : (
            <>
              <LinkButton styles={{ marginRight: 10 }} destination="login" text="Login" />
              <LinkButton styles={{ marginRight: 10 }} destination="register" text="Sign up" />
              <LinkButton
                styles={{ marginRight: 20 }}
                destination="questions"
                text="Continue as guest"
              />
            </>
          )}
        </div>
      </div>
      {/*Nests child UI underneath header*/}
      <Outlet />
    </>
  );
}

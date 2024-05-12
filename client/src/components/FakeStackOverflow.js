import SignUpForm from "./SignUp";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
  useLocation,
  Navigate,
  Outlet,
} from "react-router-dom";
import Login from "./Login";
import { createContext, useRef, useEffect, useState, useMemo, useCallback } from "react";
import Header from "./Header";
import QuestionsPage from "./QuestionsPage";
import TagsPage from "./TagsPage";
import TagsForm from "./TagsForm";
import QuestionForm from "./QuestionForm";
import axios from "axios";
import AnswerPage from "./AnswerPage";
import useDarkMode from "./useDarkMode";
import AnswerForm from "./AnswerForm";
import PrivateRoutes from "./PrivateRoutes";

import Profile from "./Profile";
export const LoginContext = createContext(null);
export const ThemeContext = createContext(null);
//Uncomment this if there is an issue with cookies
axios.defaults.withCredentials = true;

export default function FakeStackOverflow() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isDark, setIsDark } = useDarkMode();
  const mounted = useRef(true);
  console.log("WHAT IS THE ISSUE: ", setIsDark);
  const handleAuthentication = useCallback((action, userData) => {
    if (action === "login") {
      setCurrentUser(userData);
    } else if (action === "logout") {
      setCurrentUser(null);
    }
  }, []);

  const handleLoading = useCallback((isLoad) => {
    setIsLoading(isLoad);
  }, []);

  //Only check on initial render of the app
  useEffect(() => {
    //Gets current session if it exists, meaning if user has previously logged in before cookie maxAge
    const getSession = async () => {
      try {
        if (mounted.current) {
          const res = await axios.get("http://localhost:8000/", {
            withCredentials: true,
          });
          //Returns the user associated to the session if it exists
          if (res.data) {
            handleAuthentication("login", res.data);
            handleLoading(false);
          }
        }
      } catch (error) {
        console.error(error);
      }
    };
    getSession();
    //Clean up function for unmounting of this component, which is never except for extra cycle from react.strictmode
    return () => {
      mounted.current = false;
    };
  }, []);

  //No need to re render components that use these contexts unless they are changed
  const loginContexts = useMemo(
    () => ({
      currentUser,
      handleAuthentication,
      isLoading,
      handleLoading,
    }),
    [currentUser, handleAuthentication, isLoading, handleLoading]
  );

  const themeContexts = useMemo(() => ({ isDark, setIsDark }));
  const [sortingCriteria, setSortingCriteria] = useState({
    input: "",
    sortBy: "newest",
  });

  function handleSort(value, criteria) {
    setSortingCriteria({ input: value, sortBy: criteria });
  }
  console.log("CURRENT USERRRR ", currentUser);
  return (
    <>
      <LoginContext.Provider value={loginContexts}>
        <ThemeContext.Provider value={themeContexts}>
          <Router>
            <Routes>
              <Route element={<PrivateRoutes />}>
                <Route element={<Header handleSort={handleSort} />}>
                  <Route element={<Sidebar />}>
                    <Route element={<QuestionForm editMode={false} />} path="questions/new" exact />
                    <Route
                      element={<QuestionForm editMode={true} />}
                      path="questions/edit/:qid"
                      exact
                    />
                  </Route>
                </Route>
              </Route>

              <Route
                path="/"
                element={
                  <Header handleSort={handleSort} darkMode={isDark} toggleDarkMode={setIsDark} />
                }>
                {/* Home Page for guests */}
                {currentUser ? (
                  <Route index element={<Navigate to="/questions" />} />
                ) : (
                  <Route index element={<WelcomePage />} />
                )}
                {/* Authentication */}
                <Route path="register" element={<SignUpForm />} /> {/*Matches the parent path*/}
                <Route path="login" element={<Login />} />
                {/* Main Layout */}
                <Route element={<Sidebar />}>
                  <Route
                    path="questions"
                    element={
                      <QuestionsPage handleSort={handleSort} sortingCriteria={sortingCriteria} />
                    }
                  />
                  <Route
                    path="questions/:id"
                    element={
                      <QuestionsPage handleSort={handleSort} sortingCriteria={sortingCriteria} />
                    }
                  />
                  {currentUser && (
                    <Route
                      path="user/answers/:username"
                      element={
                        <QuestionsPage
                          handleSort={handleSort}
                          sortingCriteria={sortingCriteria}
                          userEmail={currentUser.email}
                        />
                        // <AnswerForm/>
                      }
                    />
                  )}
                  {currentUser && (
                    <Route
                      path="user/answered/:id"
                      element={
                        <AnswerPage
                          userEmail={currentUser.email}

                        />
                        // <AnswerForm/>
                      }
                    />
                  )}
                  {currentUser && (
                    <Route
                      path="user/editAnswer/:answerId/:id"
                      element={
                        <AnswerForm
                          userEmail={currentUser.email}

                        />
                        // <AnswerForm/>
                      }
                    />
                  )}
                  {/* Answers Section */}
                  <Route path="answers/:id" element={<AnswerPage />} />
                  {/* Answer Form */}
                  <Route path="answerform/:id" element={<AnswerForm />} />
                  {/* Tags Section */}
                  <Route path="tags" element={<TagsPage handleSort={handleSort} />} />
                  {/* {currentUser && (
                    <Route
                      path="profile"
                      element={<Profile userID={currentUser._id} isDark={isDark} />}
                    />
                  )} */}
                  {currentUser && (
                    <Route
                      path="users/profile/:viewedUserID"
                      element={<Profile userID={currentUser._id} isDark={isDark} />}
                    />
                  )}
                  {currentUser ? (
                    <>
                      <Route
                        path="user/tags/:userID"
                        element={<TagsPage handleSort={handleSort} isDark={isDark} />}
                      />
                      <Route path="user/tags/:userID/editTag/:tagName" element={<TagsForm />} />
                    </>
                  ) : null}
                </Route>
                <Route
                  path="*"
                  element={
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "75vh",
                      }}>
                      <h1 style={{ width: "fit-content" }}>Page not found</h1>
                    </div>
                  }
                />
              </Route>
            </Routes>
          </Router>
        </ThemeContext.Provider>
      </LoginContext.Provider>
    </>
  );
}

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;
  function changeDestination(path) {
    navigate(path);
    navigate(0);
  }
  return (
    <>
      <div className="sidebar">
        <div className="sidebar__nav">
          <nav>
            <ol className="sidebar__list">
              <li className="sidebar__list--item">
                <button
                  onClick={() => changeDestination("/questions")}
                  className={`sidebar__button
                ${pathname === "/questions" ? "sidebar__button--highlight" : "--not-highlight"}`}>
                  Questions
                </button>
              </li>
              <li className="sidebar__list--item">
                <button
                  onClick={() => changeDestination("/tags")}
                  className={`sidebar__button
                ${pathname === "/tags" ? "sidebar__button--highlight" : "--not-highlight"}`}>
                  Tags
                </button>
              </li>
            </ol>
          </nav>
        </div>
      </div>
      <Outlet />
    </>
  );
}

function WelcomePage() {
  const containerStyles = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "75vh", // Ensures the content takes at least the full height of the viewport
  };

  const contentStyles = {
    textAlign: "center",
    fontSize: 32,
    marginBottom: 20,
  };

  return (
    <>
      <div style={containerStyles}>
        <div style={contentStyles}>Welcome to Fake Stack Overflow</div>
        <div> We're frauds.</div>
      </div>
    </>
  );
}

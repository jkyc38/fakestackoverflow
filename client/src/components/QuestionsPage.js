import React, { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import LinkButton from "./LinkButton";
import { calculateDate } from "./UtilityFunctions";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import Pagination from "./Pagination";
import { LoginContext } from "./FakeStackOverflow";
// Can add a loading screen in the future to deal with the split second delay in rendering or conditional rendering
export default function QuestionsPage({ userEmail, ...props }) {
  const [searchParams, setSearchParams] = useSearchParams({ page: 1 });
  const currentPage = parseInt(searchParams.get("page"), 10);
  const [questions, setQuestions] = useState([]);
  const [sortedQuestions, setSortedQuestions] = useState([]);
  //Destructing you need the same variable names as the values you want
  const { handleSort, sortingCriteria } = props;
  const { input, sortBy } = sortingCriteria;
  const {currentUser} = useContext(LoginContext);
  //Handles pagination of questions
  const indexOfLastQuestion = currentPage * 5;
  const indexOfFirstQuestion = indexOfLastQuestion - 5; //Go back 5 questions from the last one for 0 counting
  const currentQuestions = sortedQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion);
  // This is where the sorting is done, so the sorting criteria state has to be read here only, updated in other areas
  const [activeCategory, setActiveCategory] = useState(null);
  //Memoize fetchData to get rid of eslint errors and possible infinite loops/breaks
  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:8000/questions/api/fetchQuestions", {
        params: { userEmail },
      });
      // Since .json stringfies objects need to convert those back to their respective objects
      console.log("SAGE RES");
      console.log(res.data);
      setQuestions(res.data);
      setSortedQuestions(res.data);
    } catch (err) {
      console.error("Error fetching data: ", err);
    }
    console.log("INITIAL RENDEERRRRR");
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setSearchParams({ page: currentPage - 1 });
    }
  };

  const handleNextPage = () => {
    if (currentPage < sortedQuestions.length / 5) {
      // console.log(sortedQuestions.length / 5);
      setSearchParams({ page: currentPage + 1 });
    }
  };

  function handleCategoryClick(category) {
    setActiveCategory(category);
    handleSort("", category);
  }

  useEffect(() => {
    const applySort = (criteria) => {
      let sortedQuestions = [...questions];
      switch (criteria) {
        case "newest":
          {
            // b < a => b first, b > a => a first, b = a => original order
            sortedQuestions.sort((a, b) => new Date(b.ask_date_time) - new Date(a.ask_date_time));
          }
          break;
        case "active": {
          sortedQuestions.sort((a, b) => {
            const getLatestAnswerTime = (question) => {
              //Finds most recent answer time of a question, spread operator lets you pass multiple args here
              return Math.max(...question.answers.map((answer) => new Date(answer.ans_date_time)));
            };
            // b < a => b first, b > a => a first, b = a => original order
            return getLatestAnswerTime(b) - getLatestAnswerTime(a);
          });
          break;
        }
        case "unanswered": {
          sortedQuestions = sortedQuestions.filter((question) => question.answers.length === 0);
          break;
        }
        // Search can cause duplicates like if user puts same search term twice?
        case "search": {
          const tagRegex = /^\[.*\]/;
          input.forEach((value) => {
            if (tagRegex.test(value)) {
              sortedQuestions = sortedQuestions.filter((question) =>
                hasTag(question, value.substring(1, value.length - 1))
              );
              // console.log(sortedQuestions);
            } else if (value.trim() !== "") {
              sortedQuestions = sortByText(value);
            }
          });
          break;
        }
        case "tags": {
          sortedQuestions = sortedQuestions.filter((question) => hasTag(question, input));
          break;
        }
        default:
          break;
      }
      // const uniqueQuestions = newQuestions.filter(
      // (question, index) => newQuestions.indexOf(question) === index
      // );
      setSortedQuestions(sortedQuestions);
      // console.log("SORTED: ", sortedQuestions);
    };

    function hasTag(question, searchTag) {
      return question.tags.some((tag) => tag.name.toLowerCase() === searchTag.toLowerCase());
    }

    function sortByText(text) {
      const lowerText = text.toLowerCase();

      return questions.filter(
        (question) =>
          question.text.toLowerCase().includes(lowerText) ||
          question.title.toLowerCase().includes(lowerText)
      );
    }
    applySort(sortBy);
    setSearchParams({ page: 1 });
  }, [input, sortBy, questions]);
  // console.log(sortBy);
  return (
    <div className="questions-section">
      <div className="questions-section__container">
        <div className="questions-section__header">
          <h1 className="questions-section__header-text">
            {sortBy === "search" ? "Search Results" : (userEmail?`${currentUser.username}'s Answered Questions`:"All Questions")}
          </h1>
          <div className="ask-questions__container">
            <LinkButton text="Ask Question" destination="questions/new" />
          </div>
        </div>
        <div className="questions-section__stats">
          <h3 className="questions-section__num-questions">
            {sortedQuestions //This is necessary to show # of all questions, not just current page
              ? `${`${sortedQuestions.length} question${sortedQuestions.length === 1 ? "" : "s"}`}`
              : "0 questions"}
          </h3>
          <div className="questions-section__cat-cont">
            <button
              className={`category-button category-button__newest ${
                activeCategory === "newest" ? "category-button--highlighted" : "--not-highlight"
              }`}
              onClick={() => handleCategoryClick("newest")}>
              Newest
            </button>
            <button
              className={`category-button category-button__active ${
                activeCategory === "active" ? "category-button--highlighted" : "--not-highlight"
              }`}
              onClick={() => handleCategoryClick("active")}>
              Active
            </button>
            <button
              className={`category-button category-button__unanswered ${
                activeCategory === "unanswered" ? "category-button--highlighted" : "--not-highlight"
              }`}
              onClick={() => handleCategoryClick("unanswered")}>
              Unanswered
            </button>
          </div>
        </div>
        {/* This is where questions go dynamically */}
        <div className="questions-section__forum">
          {currentQuestions.length > 0 ? (
            currentQuestions.map((question) => (
              <Question
                setQuestionViews={props.setQuestionViews}
                key={question._id}
                tags={question.tags}
                question={question}
                qid={question._id}
                userEmail={userEmail}
                // updateQid={props.updateQid}
              />
            ))
          ) : (
            <h3 className="no-questions-text">No Questions Found.</h3>
          )}
        </div>
        <Pagination onNext={handleNextPage} onPrev={handlePrevPage} currentPage={currentPage} />
      </div>
    </div>
  );
}

function Question(props) {
  const navigate = useNavigate();

  const { question } = props;
  // console.log(question);
  const { tags } = props;
  function handleClick() {
    if(props.userEmail){
      console.log(props.userEmail);
      console.log('LMFAO');
      navigate(`/user/answered/${props.qid}`);
      return;
    }
    navigate(`/answers/${props.qid}`);
    // console.log(props.qid);
    //need to navigate to path with the question
    // props.updateQid(question._id);
    // props.toggleSection("answerPage");
    axios.post("http://localhost:8000/questions/api/increment-view", { qid: props.qid });
  }
  return (
    <div className="question">
      <div className="question__stats">
        <span className="question__upvotes-count">{`${question.upvotes} upvotes`}</span>
        <span className="question__answers-count">{`${`${question.answers.length} answers`}`}</span>
        <span className="question__views-count">{`${`${question.views} views`}`}</span>
      </div>
      <div className="question__info">
        {/* Make it anchor tag in anticipation for backend part of project, where redirects might be necessary */}
        <span className="question__title" onClick={handleClick}>
          {question.title}
        </span>
        <span className="question__summary">{`Summary: ${question.summary}`}</span>
        <div className="question__tags">
          {tags.map((tag, index) => (
            <PostTag key={index} tagName={tag.name} />
          ))}
        </div>
      </div>
      <div className="question__user-info">
        <span className="question__username">{`${question.asked_by}`}</span>
        <span className="question__ask-date">
          {`${` asked ${calculateDate(question.ask_date_time)}`}`}
        </span>
      </div>
    </div>
  );
}

function PostTag(props) {
  return <span className="post-tag">{props.tagName}</span>;
}

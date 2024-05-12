import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { calculateDate } from "./UtilityFunctions";
import { useParams, useNavigate, Link } from "react-router-dom";
import LinkButton from "./LinkButton";
import { LoginContext, ThemeContext } from "./FakeStackOverflow";
import { useContext } from "react";
import Pagination from "./Pagination";
import CommentSection from "./CommentSection";
import Votes from "./Votes";

export default function AnswerPage({userEmail}) {
  const { currentUser } = useContext(LoginContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [question, updateQuestion] = useState(null);
  const [answers, updateAnswers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const indexOfLastAnswer = currentPage * 5;
  const indexOfFirstAnswer = indexOfLastAnswer - 5; //Go back 5 questions from the last one for 0 counting
  const currentAnswers = answers.slice(indexOfFirstAnswer, indexOfLastAnswer);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((currentPage) => currentPage - 1);
    }
  };
  const handleNextPage = () => {
    if (currentPage < answers.length / 5) {
      setCurrentPage((currentPage) => currentPage + 1);
    }
  };
  const { isDark } = useContext(ThemeContext);
  // console.log("lul")
  // const [comments, setComments] = useState([]);
  let { id } = useParams();
  // console.log(id)
  const fetchQuestion = useCallback(async () => {
    try {
      let response = await axios.get("http://localhost:8000/questions/api/getQuestion", {
        params: {
          qid: id,
        },
      });
      response.data.answers.reverse();
      updateQuestion(response.data);
      updateAnswers(response.data.answers);
      // setQid(response.data._id);
      // setVote(response.data.upvotes);
      setIsLoading(false);

      // console.log(question.upvotes);
    } catch (err) {
      console.error("Unable to fetch a question for editing/answering ", err);
    }
  }, [id, updateQuestion, updateAnswers, setIsLoading]);

  useEffect(() => {
    try{
      fetchQuestion();
    } catch(e){
      console.error(e);
    }

    //This fetches even when isLoading is set to false, might have unexpected consequences.
  }, [isLoading, fetchQuestion]);

  //TODO modularize the upvote and downvote feature DONE

  return (
    <div className="answers-page">
      {question && answers ? (
        <>
          <div className="answers-page__question-cont">
            <div className="answers-page__stats">
              <Votes
                isDark={isDark}
                postType="question"
                postTypeId={question._id}
                votes={question.upvotes}
                userId={question.userId}
                isLogin={currentUser}
              />
              <div className="answers-page__numbers_cont">
                <p className="answers-page__num-answers">{`${question.answers.length} answers`}</p>
                <p className="answers-page__num-views">{`${question.views} views`}</p>
              </div>
            </div>
            <div className="answers-page__question-header">
              <h3 className="answers-page__question-title">{question.title}</h3>
              <p
                className="answers-page__question-text"
                dangerouslySetInnerHTML={{ __html: question.text }}
              />
            </div>
            <div className="answers-page__btn-user-info-cont">
              <div className="ask-questions__container">
                {/* <AskQuestionsButton toggleSection={props.toggleSection} /> */}
              </div>
              <div className="answers-page__question-info">
                <span className="answers-page__askedUser">{question.asked_by}</span>
                <span className="answers-page__askedDate question__metadata">
                  {` asked ${calculateDate(question.ask_date_time)}`}
                </span>
              </div>
            </div>
          </div>
          <div className="answers-page__forum">
            {currentAnswers.map((answer) => (
              <Answer
                isDark={isDark}
                setIsLoading={setIsLoading}
                upvotes={answer.upvotes}
                text={answer.text}
                key={answer._id}
                ansBy={answer.ans_by}
                userId={answer.userId}
                ansDate={new Date(answer.ans_date_time)}
                aid={answer._id}
                comments={answer.comments}
                userEmail={userEmail}
                qid={question._id}
              />
            ))}
            {/* <AnswerQuestionButton toggleSection={props.toggleSection} /> */}
            {currentUser ? (
              <LinkButton text="Answer Question" destination={`answerform/${id}`} />
            ) : null}
            <Pagination onNext={handleNextPage} onPrev={handlePrevPage} currentPage={currentPage} />
          </div>
        </>
      ) : (
        <p />
      )}
    </div>
  );
}

function Answer({ isDark, ...props }) {
  const { currentUser } = useContext(LoginContext);
  const navigate = useNavigate();
  // function editAnswer(){
  //   navigate(`user/editAnswer/${props.qid}`);

  // }
  function deleteAnswer(){
    const ENDPOINT = "http://localhost:8000/answers/api/delete-answer";
    const postData = {
      answerId: props.aid
    }
    axios.post(ENDPOINT, postData); 
    navigate(0);
  }

  return (
    <>
      <div className="answer">
        <Votes
          isDark={isDark}
          postType="answer"
          postTypeId={props.aid}
          votes={props.upvotes}
          userId={props.userId}
          isLogin={currentUser}
        />
        {props.userEmail&&
        <>
        <LinkButton
        text="Edit"
        destination={`user/editAnswer/${props.aid}/${props.qid}`}
        />
        <LinkButton
        text="Delete"
        handleOnClick={deleteAnswer}
        />
        </>
        }
        <p dangerouslySetInnerHTML={{ __html: props.text }} />
        <div>
          <span className="answer__user">{props.ansBy}</span>
          <span className="answer__ask-date question__metadata">
            {`${` answered ${calculateDate(props.ansDate)}`}`}
          </span>
        </div>
      </div>
      <CommentSection
        isDark={isDark}
        setIsLoading={props.setIsLoading}
        comments={props.comments.slice().reverse()}
        aid={props.aid}></CommentSection>
    </>
  );
}

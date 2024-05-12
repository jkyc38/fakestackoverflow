import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
//modularize to userId, type of upvote via (comments, questions, answers, ) posttype, posttypeid, votes
export default function Votes({ isDark, ...props }) {
  const [vote, setVote] = useState(0);
  const [upvoted, setUpvoted] = useState(false);
  const [downvoted, setDownvoted] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [repError, setRepError] = useState(false);
  //check rep
  useEffect(() => {
    setVote(props.votes);
  }, [props.votes]);

  function upvote() {
    if (!props.isLogin) {
      setLoginError(true);
      return;
    } else {
      setLoginError(false);
    }
    if (props.isLogin.reputation < 50) {
      setRepError(true);
      return; //exit logic if rep is less thn 50
    } else {
      setRepError(false);
    }
    //check rep
    if (downvoted) {
      setVote((value) => value + 2);
      setDownvoted(false);
      setUpvoted(true);
    } else if (!upvoted) {
      setVote((value) => value + 1);
      setUpvoted(true);
      setDownvoted(false);
    } else if (upvoted) {
      setVote((value) => value - 1);
      setUpvoted(false);
    }
    if (props.postType === "comment") {
      return;
    }
    //update reputation of the user that answered
    axios.post("http://localhost:8000/answers/api/update-reputation", {
      userId: props.userId,
      updateRep: 5,
    });
  }
  //if its upvoted and you downvote it should subtract 2
  function downvote() {
    if (props.postType === "comment") {
      return;
    }
    if (!props.isLogin) {
      setLoginError(true);
      return;
    } else {
      setLoginError(false);
    }
    if (props.isLogin.reputation < 50) {
      setRepError(true);
      return; //exit logic if rep is less thn 50
    } else {
      setRepError(false);
    }
    if (upvoted) {
      setVote((value) => value - 2);
      setDownvoted(true);
      setUpvoted(false);
    } else if (!downvoted) {
      setVote((value) => value - 1);
      setDownvoted(true);
      setUpvoted(false);
    } else if (downvoted) {
      setVote((value) => value + 1);
      setDownvoted(false);
    }
    axios.post("http://localhost:8000/answers/api/update-reputation", {
      userId: props.userId,
      updateRep: -10,
    });
  }
  // console.log(props.postType);
  // console.log(props.postTypeId);
  useEffect(() => {
    if (upvoted || downvoted) {
      axios.post(`http://localhost:8000/answers/api/upvote/${props.postType}`, {
        postTypeId: props.postTypeId,
        value: vote,
      });
    }
  }, [vote, upvoted, downvoted, props.postTypeId, props.postType]);

  return (
    <>
      {loginError && <span>Must be logged in to vote</span>}
      {repError && <span>Need 50 rep to vote</span>}
      <div className="votes">
        <button onClick={upvote} style={{ background: "transparent", border: 0 }}>
          <svg
            className="voting__svg"
            xmlns="http://www.w3.org/2000/svg"
            stroke={isDark ? "lightgray" : "black"}
            fill={`${
              upvoted && isDark ? "lightgray" : upvoted && !isDark ? "black" : "transparent"
            }`}
            width="1.5rem"
            height="1.5rem"
            viewBox="0 0 24 24">
            <path d="M4 14h4v7a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-7h4a1.001 1.001 0 0 0 .781-1.625l-8-10c-.381-.475-1.181-.475-1.562 0l-8 10A1.001 1.001 0 0 0 4 14z" />
          </svg>
        </button>
        <div className="votes__num">{vote}</div>
        <button onClick={downvote} style={{ background: "transparent", border: 0 }}>
          <svg
            className="voting__svg"
            xmlns="http://www.w3.org/2000/svg"
            stroke={isDark ? "lightgray" : "black"}
            fill={`${
              downvoted && isDark ? "lightgray" : downvoted && !isDark ? "black" : "transparent"
            }`}
            width="1.5rem"
            height="1.5rem"
            viewBox="0 0 24 24">
            <path d="M20.901 10.566A1.001 1.001 0 0 0 20 10h-4V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v7H4a1.001 1.001 0 0 0-.781 1.625l8 10a1 1 0 0 0 1.562 0l8-10c.24-.301.286-.712.12-1.059z" />
          </svg>
        </button>
      </div>
    </>
  );
}

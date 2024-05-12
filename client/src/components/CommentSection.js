import { useState, useContext } from "react";
import axios from "axios";
import { LoginContext } from "./FakeStackOverflow";
import { calculateDate } from "./UtilityFunctions";
import Pagination from "./Pagination";
import Votes from "./Votes";

export default function CommentSection({ isDark, ...props }) {
  const { currentUser } = useContext(LoginContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [exitError, setExitError] = useState(""); //state to manage exiting the addcomment
  const [showTextArea, setShowTextArea] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentOverflow, setCommentOverflow] = useState(false);
  // const indexOfLastComment = currentPage * 5;
  // const indexOfFirstComment = indexOfLastComment - 5; //Go back 5 questions from the last one for 0 counting
  const PAGECONST = 3;
  const indexOfLastComment = currentPage * PAGECONST;
  const indexOfFirstComment = indexOfLastComment - PAGECONST; //Go back 5 questions from the last one for 0 counting
  const currentComments = props.comments.slice(indexOfFirstComment, indexOfLastComment);
  console.log("COMMENTS: ", currentComments);
  const handleChange = (e) => {
    setCommentText(e.target.value);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((currentPage) => currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < props.comments.length / PAGECONST) {
      setCurrentPage((currentPage) => currentPage + 1);
    }
  };
  function postComment() {
    if (commentText.length > 140) {
      setCommentOverflow(true);
      return;
    } else {
      setCommentOverflow(false);
    }

    const postData = {
      comment: commentText,
      user: currentUser,
      aid: props.aid,
      //when comment is posted append teh comment object to
      //the user and also add one to the database as well
      //add upvoting and downvoting for comments too
      //only registered users can upvote and downvote and make sure to
      //only display three comments at a time and sort by newest first
    };
    const endpoint = "http://localhost:8000/answers/api/add-comment";
    axios.post(endpoint, postData);
    setCommentText("");
    props.setIsLoading(true);
  }
  function handleKeyPress(event) {
    // event.preventDefault();
    if (event.key === "Enter") {
      console.log("yappington");
      event.preventDefault();
      postComment();
    }
  }
  async function checkRep() {
    //send request to backend to check for the account's reputation and if it's greater
    //than 50 then they can add a comment
    //guest users cannot add comments and will be linked to a login page if they try
    //to add a comment

    // let reputation = response.data.rep;
    // const ENDPOINT = "";
    
    // let response = await axios.get()
    if (currentUser.reputation < 50) {
      // console.log("you must have 50 rep to comment LMFAO");
      setExitError(true);
    } else {
      setExitError(false);
      setShowTextArea(true);
    }
  }
  return (
    <div className="comments-container">
      <div className="comments">
        {currentComments.map((comment) => (
          <Comment
            isDark={isDark}
            key={comment._id}
            commentId={comment._id}
            upvotes={comment.upvotes}
            date={comment.date}
            text={comment.text}
            author={comment.comment_by}
          />
        ))}
      </div>
      {currentUser && (
        <div className="add-comments__cont">
          {showTextArea ? (
            <textarea
              placeholder="Add a comment"
              value={commentText}
              onChange={handleChange}
              onKeyDown={handleKeyPress}></textarea>
          ) : (
            <a className="add-comment" onClick={checkRep}>
              Add a comment
            </a>
          )}
          {commentOverflow && (
            <div className="overflow-message">
              <p>Limit Characters to 140 characters</p>
            </div>
          )}
          {exitError ? (
            <div className="add-comment__exit-cont">
              <span style={{ fontSize: 13, marginRight: 10, color: "red" }}>
                You must have 50 reputation to add comment
              </span>
              <span className="add-comment__exit" onClick={() => setExitError(false)}>
                x
              </span>
            </div>
          ) : null}
        </div>
      )}
      <Pagination onNext={handleNextPage} onPrev={handlePrevPage} currentPage={currentPage} />
    </div>
  );
}

function Comment({ isDark, ...props }) {
  const { currentUser } = useContext(LoginContext);

  return (
    <>
      <div className="comment">
        <Votes
          postType="comment"
          votes={props.upvotes}
          postTypeId={props.commentId}
          isLogin={currentUser}
          isDark={isDark}
        />
        <span>{props.text}</span>
        <div className="comment-user">{props.author}</div>
        <div className="comment-date">{`commented ${calculateDate(props.date)}`}</div>
      </div>
    </>
  );
}

import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import LinkButton from "./LinkButton";
import axios from "axios";

//Need to spread syntax props or it treats it as a prop named props
export default function TagsPage({ ...props }) {
  console.log("props here: ", props);
  const [tags, setTags] = useState([]);
  const [whichUser, setWhichUser] = useState();
  const navigate = useNavigate();
  const { userID } = useParams();
  function handleTagClick(tagName) {
    props.handleSort(tagName, "tags");
    navigate("/questions");
  }
  async function fetchData() {
    try {
      //Optional to pass userEmail, it may be undefined
      const res = await axios.get("http://localhost:8000/tags/api/fetchTags", {
        params: { userID },
      });
      // Since .json stringfies objects need to convert those back to their respective objects
      const { formattedTags, foundUser } = res.data;
      setTags(formattedTags);
      setWhichUser(foundUser);
    } catch (err) {
      console.error("Error fetching tags: ", err);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="tags-section">
      <div className="tags-section__header">
        <h3 className="tags-section__num-tags">{`${
          tags.length === 1 ? tags.length + " tag" : tags.length + " tags"
        }`}</h3>
        <h3 className="tags-section__all-tags-text">{`${
          whichUser ? whichUser.username + "'s Tags" : "All Tags"
        }`}</h3>
        <div className="ask-questions__container">
          <LinkButton text="Ask Question" destination="questions/new" />
        </div>
      </div>
      <div className="tags-section__all-tags-cont">
        {tags.map((formatTag, index) => {
          return (
            <TagTracker
              userID={whichUser ? whichUser._id : null}
              username={whichUser ? whichUser.username : null}
              onTagClick={handleTagClick}
              key={index}
              name={formatTag.tag}
              tagAmount={formatTag.count}
            />
          );
        })}
      </div>
    </div>
  );
}

function TagTracker({ userID, username, ...props }) {
  const [error, setError] = useState(null);
  function handleTagClick() {
    props.onTagClick(props.name);
  }
  async function handleOnDelete() {
    try {
      await axios.delete("http://localhost:8000/tags/api/deleteTag/" + props.name);
    } catch (err) {
      if (err.response && err.response.status === 400) {
        setError("Another user is using this tag, cannot delete.");
      } else {
        setError("Unable to delete tag");
      }
    }
  }
  return (
    <div className="tag-tracker">
      <h3 className="tag-tracker__name tag-tracker__stats" onClick={handleTagClick}>
        {props.name}
      </h3>
      <h3 className="tag-tracker__tag-amount tag-tracker__stats">
        {props.tagAmount + " "}
        questions
      </h3>
      {userID ? (
        <div className="tag-tracker__options">
          <LinkButton
            text="Edit"
            hoverColor="darkgray"
            backgroundColor="transparent"
            destination={`user/tags/${userID}/editTag/${props.name}`}
            styles={{ fontWeight: "bold", color: "inherit" }}
          />
          <LinkButton
            text="Delete"
            hoverColor="darkgray"
            backgroundColor="transparent"
            handleOnClick={handleOnDelete}
            destination={`user/tags/${userID}`}
            styles={{ fontWeight: "bold", color: "inherit" }}
          />
        </div>
      ) : null}
      {error && <span style={{ color: "red" }}>{error}</span>}
    </div>
  );
}

import React from "react";
import { useNavigate } from "react-router-dom";
//Generic blue button or you can change the styling of it i guess, and pass a generic handleclick function for it
export default function Button(props) {
  // const isLoggedIn = useContext(LoginContext);
  const navigate = useNavigate();
  function handleClick(event) {
    if (props.handleOnClick) {
      //The button has its own click functionality too
      props.handleOnClick(event);
    }
    if (!event.defaultPrevented && props.destination) {
      setTimeout(() => {
        navigate("/" + props.destination);
        navigate(0);
      }, 1000);
    }
  }

  function changeHoverColor(e) {
    e.target.style.backgroundColor = props.hoverColor ? props.hoverColor : "#085ca8";
  }

  function revertHoverColor(e) {
    e.target.style.backgroundColor = props.backgroundColor ? props.backgroundColor : "#0b7fdb";
  }

  const buttonStyles = {
    //Default to blue button if no specification
    backgroundColor: props.backgroundColor ? props.backgroundColor : "#0b7fdb",
    ...props.styles, //Other styles from props
  };

  //Good note: button defaults to a submit button, so best to declare as button, so you do not get multi functionality that can mess up your button
  return (
    <>
      <button
        style={buttonStyles}
        className="link-button"
        onClick={handleClick}
        onMouseEnter={changeHoverColor}
        onMouseLeave={revertHoverColor}
        type="button">
        {props.text}
      </button>
    </>
  );
}

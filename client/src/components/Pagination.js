import React from "react";
import LinkButton from "./LinkButton";

export default function Pagination({ onPrev, onNext, currentPage}) {
  function handlePrevPage() {
    onPrev();
  }

  function handleNextPage() {
    onNext();
  }
  return (
    <div className="pagination-div">
      <LinkButton
        text="Prev"
        styles={{ marginRight: 20, border: "1px solid lightgray", color: "inherit" }}
        hoverColor="darkgray"
        handleOnClick={handlePrevPage} //UseSearchParams works the same as navigate, so do not pass a destination.
        backgroundColor="transparent"></LinkButton>
      Current Page: {currentPage}
      <LinkButton
        text="Next"
        styles={{ marginLeft: 20, border: "1px solid lightgray", color: "inherit" }}
        handleOnClick={handleNextPage}
        hoverColor="darkgray"
        backgroundColor="transparent"></LinkButton>
    </div>
  );
}

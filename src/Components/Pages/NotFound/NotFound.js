import React from "react";
import { Link } from "react-router-dom";
import "./NotFound.css";

function NotFound() {
  return (
    <div className="not-found-page">
      <img
        src={
          "https://img.freepik.com/free-vector/oops-404-error-with-broken-robot-concept-illustration_114360-1932.jpg?w=2000"
        }
      />
      <Link to="/login">Go to Home Page</Link>
    </div>
  );
}

export default NotFound;

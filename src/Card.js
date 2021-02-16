import React from "react";
import "./Card.css";

const Card = ({ img, rotation }) => {
  return (
    <div className="Card">
      <img src={img} style={{ transform: `rotate(${rotation})` }} />
    </div>
  );
};

export default Card;
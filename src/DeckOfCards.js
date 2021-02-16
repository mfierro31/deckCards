import React, { useState, useEffect, useRef } from "react";
import Card from "./Card";
import axios from "axios";
import { v4 as uuid } from "uuid";
import "./DeckOfCards.css";

const DeckOfCards = () => {
  const [remainingCards, setRemainingCards] = useState(null);
  const [drawnCards, setDrawnCards] = useState([]);
  const [hasDrawn, setHasDrawn] = useState(false);

  const deckId = useRef();
  const intervalId = useRef();

  // Starting a new deck - happens just once, after component first renders
  useEffect(() => {
    async function createNewDeck() {
      const res = await axios.get('https://deckofcardsapi.com/api/deck/new/shuffle');
      // set ref here
      deckId.current = res.data.deck_id;
      setRemainingCards(res.data.remaining);
    }
    createNewDeck();
  }, []);

  // logic for drawing from a deck of cards
  async function draw () {
    const res = await axios.get(`https://deckofcardsapi.com/api/deck/${deckId.current}/draw`);
    const newCard = res.data.cards[0];
    newCard.id = uuid();
    newCard.rotation = `${Math.floor(Math.random() * 361)}deg`;

    setDrawnCards(drawnCards => [...drawnCards, { id: newCard.id, image: newCard.image, rotation: newCard.rotation }]);
    setRemainingCards(res.data.remaining);
  }

  useEffect(() => {
    if (hasDrawn === false) {
      intervalId.current = setInterval(() => draw(), 1000);
    } else if (hasDrawn === true || remainingCards === 0) {
      clearInterval(intervalId.current);
    }

    return () => clearInterval(intervalId.current);
  }, [hasDrawn]);

  // const startDrawing = () => {
  //   setHasDrawn(!hasDrawn);
  //   intervalId.current = setInterval(() => draw(), 1000);
  // };

  // const stopDrawing = () => {
  //   setHasDrawn(!hasDrawn);
  //   clearInterval(intervalId.current);
  // };

  return (
    <div className="DeckOfCards">
      {
        remainingCards !== null && remainingCards === 0 ? 
        alert('Error: no cards remaining!') : 
        <button 
          className="DeckOfCards-btn" 
          onClick={() => setHasDrawn(!hasDrawn)}
        >
          {hasDrawn ? 'Stop drawing' : 'Start drawing'}
        </button>
      }
      {drawnCards.map(card => <Card key={card.id} img={card.image} rotation={card.rotation} />)}
    </div>
  );
};

export default DeckOfCards;
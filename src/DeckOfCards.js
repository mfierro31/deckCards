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
  // need to keep track of initial render for 2nd useEffect.  We don't want our 2nd useEffect to run on initial render.
  // we only want it to run when hasDrawn changes.
  const initialRender = useRef(true);

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
    // if no more cards in the deck, we want to clear the interval and show alert
    if (remainingCards === 0) {
      clearInterval(intervalId.current);
      alert('Error: no more cards in the deck!');
    } else {
      const res = await axios.get(`https://deckofcardsapi.com/api/deck/${deckId.current}/draw`);
      const newCard = res.data.cards[0];
      newCard.id = uuid();
      newCard.rotation = `${Math.floor(Math.random() * 361)}deg`;

      setDrawnCards(drawnCards => [...drawnCards, { id: newCard.id, image: newCard.image, rotation: newCard.rotation }]);
      setRemainingCards(res.data.remaining);
    }
  }

  // attempt to start interval - draw a card from deck of cards API every 1 second.  
  useEffect(() => {
    // don't want this to run on initial render, only when hasDrawn changes.
    if (initialRender.current === true) {
      initialRender.current = false;
    } else {
      if (hasDrawn === true) {
        intervalId.current = setInterval(() => draw(), 1000);
      } else {
        clearInterval(intervalId.current);
      }
  
      return () => clearInterval(intervalId.current);
    }
  }, [hasDrawn]);

  return (
    <div className="DeckOfCards">
      <button 
        className="DeckOfCards-btn" 
        onClick={() => setHasDrawn(!hasDrawn)}
      >
        {hasDrawn ? 'Stop drawing' : 'Start drawing'}
      </button>
      {drawnCards.map(card => <Card key={card.id} img={card.image} rotation={card.rotation} />)}
    </div>
  );
};

export default DeckOfCards;
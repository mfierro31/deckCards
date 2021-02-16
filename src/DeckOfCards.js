import React, { useState, useEffect, useRef } from "react";
import Card from "./Card";
import axios from "axios";
import { v4 as uuid } from "uuid";
import "./DeckOfCards.css";

const DeckOfCards = () => {
  // state to keep track of if we still have cards left to draw in the deck
  const [keepDrawing, setKeepDrawing] = useState(true);
  // state to keep track of the cards we've actually drawn
  const [drawnCards, setDrawnCards] = useState([]);
  // state to keep track of it user has clicked on 'Start drawing'/'Stop drawing'
  const [hasDrawn, setHasDrawn] = useState(false);

  // keep track of our deck ID
  const deckId = useRef();
  // setInterval's ID
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
    }
    createNewDeck();
  }, []);

  // logic for drawing from a deck of cards
  function draw () {
    axios.get(`https://deckofcardsapi.com/api/deck/${deckId.current}/draw`).then(res => {
      const newCard = res.data.cards[0];
      newCard.id = uuid();
      newCard.rotation = `${Math.floor(Math.random() * 361)}deg`;

      // if no cards remaining in deck, we set our keepDrawing state to false and that triggers our 2nd useEffect
      if (res.data.remaining === 0) {
        setKeepDrawing(false);
      } else {
        setDrawnCards(drawnCards => [...drawnCards, { id: newCard.id, image: newCard.image, rotation: newCard.rotation }]);
      }
    });
  }

  // start interval here - draw a card from deck of cards API every 1 second.  
  useEffect(() => {
    // don't want this to run on initial render, only when hasDrawn or keepDrawing changes.
    if (initialRender.current === true) {
      initialRender.current = false;
    } else {
      if (hasDrawn === true && keepDrawing === true) {
        // for some reason, when we pass a function into setInterval, that function won't be able to get updated state.
        // it takes a snapshot of the current state whenever setInterval gets called, but it won't get the updated state 
        // on every interval. The only time it will get an updated snapshot of state is when it's stopped and runs again.  
        // So we don't want to reference any state in our draw function, unless we're setting it.  We can SET state from there, 
        // but we can't rely on the value of a state variable in there
        intervalId.current = setInterval(draw, 1000);
      } else if (hasDrawn === false) {
        clearInterval(intervalId.current);
      } else if (keepDrawing === false) {
        clearInterval(intervalId.current);
        alert('Error: no more cards left to draw!');
      }
  
      return () => clearInterval(intervalId.current);
    }
  }, [hasDrawn, keepDrawing]);

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
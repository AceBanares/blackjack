// Cards app

// Description:
// Fetch JSON data from https://deckofcardsapi.com/ and display a new card everytime the "Deal Card" button is clicked.  Selecting some cards is indicated by highlights.  Clicking the "Show selected cards" button will only display the highlighted/selected cards.  Clicking the "Show discarded cards" button will only display the non-selected cards.

// See Sample gameplay: https://www.youtube.com/watch?v=DWx8LdW1k0Q

// STEP 1: Create html/css/js files that look similar to the above picture. ~~~(../images/sample.PNG)

// STEP 2: In your JS file create an empty array:  let hand = []
let hand = [];
let handJSON = [];
let blackJackHand = [];
let blackJackDealer = [];

// key represents the deck of cards
let deckKey;
let cardCount = 0;
let cardValue = 0;
let cardAces = 0;

// set variables to hold necessary elements
const cardBoxCollect = document.querySelector("#boxCollect");
const cardBtnGet = document.querySelector("#btnGet");
const cardBtnSelect = document.querySelector("#btnSelect");
const cardBtnDiscard = document.querySelector("#btnDiscard");
const cardBoxPlay = document.querySelector("#boxPlay");
const cardBtnDeal = document.querySelector("#btnDeal");
const cardBtnHit = document.querySelector("#btnHit");
const cardBtnStand = document.querySelector("#btnStand");
const cardBoxOnHand = document.querySelector("#boxHand");
const cardBtnReset = document.querySelector("#btnReset");
const cardBtnCount = document.querySelector("#btnCount");
const cardBtnBlackJack = document.querySelector("#btnBlackJack");

// STEP 3: Create a function called initialize() that uses the fetch command which gets JSON data from  https://deckofcardsapi.com/  in order to get the deck_id number (this id will will then be used to later fetch new cards)
function initialize() {
  fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1")
    .then(res => res.json())
    .then(data => {
      deckKey = data.deck_id;
    });
  // STEP 4: Inside the initialize function, listen for a click event on the "Deal button" and if clicked, fetch a new card using the appropriate API url
  cardBtnGet.addEventListener("click", deal);
  cardBtnSelect.addEventListener("click", cardShowSelected);
  cardBtnDiscard.addEventListener("click", cardShowDiscarded);
  cardBoxOnHand.addEventListener("click", cardSelect);
  cardBtnReset.addEventListener("click", reset);
  cardBtnBlackJack.addEventListener("click", blackJackStart);
}

function deal() {
  fetch(`https://deckofcardsapi.com/api/deck/${deckKey}/draw/?count=1`)
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        const id = 52 - data.remaining;
        const cardNew = { ...data.cards[0], id };
        cardDisplay(cardNew);
        console.log(cardNew);
      } else {
        console.log(data.error);
      }
    });
}

function reset() {
  handJSON = [];
  localStorage.setItem("cardsOnHand", handJSON);
  location.reload();
}

// STEP 5: Create a render(hand) function that has a parameter 'hand' that represents the array of cards you want to show, and uses the .map and .join method on that array that was passed in in order to display the cards
// function render(hand) {} ~~~(displays the card as soon as it is dealt and adds it to the array `hand` after)
function cardDisplay(cardNew) {
  // get the properties needed from the new card
  const { image, value, suit, id } = cardNew;
  // set a variable to hold cards
  const div = document.createElement("div");
  const img = document.createElement("img");
  // child element: card image
  img.src = image;
  img.alt = `${value} ${suit}`;
  // parent element: card holder
  div.appendChild(img);
  div.className = "card-box";
  div.id = `card${id}`;
  // add child to parent
  cardBoxOnHand.appendChild(div);
  // add parent to hand array
  hand.push(div);
  handJSON.push(cardNew);
  cardBtnCount.textContent = `Cards on hand: ${++cardCount}`;
  cardTotalValue(value);
}

// STEP 6: If the user clicks on a card(s), that card(s) is selected/highlighted.  This is done by adding a new boolean property to the card object called 'selected' ~~~(used classList to add property and css design at the same time)
function cardSelect(e) {
  // get the clicked element
  let card = e.target;
  let isCard = false;

  // if the clicked element is the card container
  if (card.classList.contains("card-box")) {
    // then it is the `card`
    isCard = true;
    // but if the clicked element is the card image
  } else if (card.parentNode.classList.contains("card-box")) {
    // then the container of it is the `card`
    card = card.parentNode;
    isCard = true;
  }

  // if the clicked element is a `card` and not the gap in between
  if (isCard) {
    if (card.classList.contains("selected")) {
      // then unselect the card if it is already selected
      card.classList.remove("selected");
    } else {
      // or select it if it is not yet selected
      card.classList.add("selected");
    }
  }
}

// STEP 7: If the user clicks "Show selected cards" button, then only display the selected/highlighted cards by using the filter method
function cardShowSelected() {
  // and hide unselected
  hand
    .filter(card => !card.classList.contains("selected"))
    .map(show => (show.style.display = "none"));
  hand
    .filter(card => card.classList.contains("selected"))
    .map(show => (show.style.display = "inline-block"));
}

// STEP 8: If the user clicks "Show discarded cards" button, then only display the non-selected/non-highlighted cards by using the filter method
function cardShowDiscarded() {
  // and hide selected
  hand
    .filter(card => card.classList.contains("selected"))
    .map(show => (show.style.display = "none"));
  hand
    .filter(card => !card.classList.contains("selected"))
    .map(show => (show.style.display = "inline-block"));
}

// STEP 9: BONUS +1: If the user refreshes the page, use localStorage to get the prior hand and display that instead
window.addEventListener("unload", () => {
  localStorage.setItem("cardsOnHand", JSON.stringify(handJSON));
});

window.addEventListener("load", () => {
  cardStorage = JSON.parse(localStorage.getItem("cardsOnHand"));
  if (cardStorage) cardStorage.forEach(card => cardDisplay(card));
  // cardDisplay(cardStorage);
});
// STEP 10: BONUS +1: Display a running total according to Blackjack rules (figure out how to change value of an Ace from 11 to 1 if needed)
function blackJackStart() {
  if (cardBtnBlackJack.textContent == "Play BlackJack") {
    cardBtnBlackJack.textContent = "Collect Cards";
    blackJackToggle(true);
    blackJackDeal();
  } else {
    cardBtnBlackJack.textContent = "Play BlackJack";
    blackJackToggle(false);
  }
}

function blackJackToggle(disable) {
  [...cardBoxCollect.getElementsByTagName("button")].forEach(
    button => (button.disabled = disable)
  );
  [...cardBoxPlay.getElementsByTagName("button")].forEach(
    button => (button.disabled = !disable)
  );
  cardBtnCount.textContent = disable
    ? `Card value: ${cardValue}`
    : `Cards on hand: ${cardCount}`;
  [...cardBoxOnHand.getElementsByTagName("div")].forEach(
    card => (card.style.display = disable ? "none" : "inline-block")
  );
}

function cardTotalValue(value) {
  if (value == "ACE") cardAces++;

  switch (value) {
    case "JACK":
    case "QUEEN":
    case "KING":
    case "ACE":
      value = 10;
  }

  cardValue += Number(value);

  while (cardAces > 0 && cardValue > 21) {
    cardValue -= 9;
    cardAces--;
  }
}
// STEP 11: BONUS 1+: Create a dealer/opponent who you can play against.  It can be as simple as generating a random number, or it can be more complex.

function blackJackDeal() {
  if (blackJackHand) blackJackHand.forEach(card => cardDisplay(card));
}

function debugCardDeal(value = "ACE", suit = "DIAMONDS") {
  value = String(value).toUpperCase();
  suit = String(suit).toUpperCase();

  let code;

  switch (value) {
    case "1":
    case "ACE":
      value = "ACE";
      break;
    case "2":
    case "3":
    case "4":
    case "5":
    case "6":
    case "7":
    case "8":
    case "9":
    case "10":
      break;
    case "11":
    case "JACK":
      value = "JACK";
      break;
    case "12":
    case "QUEEN":
      value = "QUEEN";
      break;
    case "13":
    case "KING":
      value = "KING";
      break;
  }

  code = value.slice(0, value.length == 2 ? 2 : 1);

  switch (suit) {
    case "C":
    case "CLUB":
    case "CLUBS":
      suit = "CLUBS";
      break;
    case "S":
    case "SPADE":
    case "SPADES":
      suit = "SPADES";
      break;
    case "H":
    case "HEART":
    case "HEARTS":
      suit = "HEARTS";
      break;
    default:
      suit = "DIAMONDS";
  }

  if (code == "10") code = "0";
  code += suit.slice(0, 1);

  const cardNew = {
    code,
    value,
    image: `https://deckofcardsapi.com/static/img/${code}.png`,
    images: {
      png: `https://deckofcardsapi.com/static/img/${code}.png`,
      svg: `https://deckofcardsapi.com/static/img/${code}.svg`
    },
    suit,
    id: 0
  };

  cardDisplay(cardNew);
}

function debugCardsAll() {
  for (let value = 1; value <= 13; value++) {
    for (let suit = 1; suit <= 4; suit++) {
      suitCode = { 1: "c", 2: "d", 3: "h", 4: "s" };
      debugCardDeal(value, suitCode[suit]);
    }
  }
}

initialize();
blackJackStart();

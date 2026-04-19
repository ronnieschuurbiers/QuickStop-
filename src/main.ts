interface Card {
  letter: string;
  question: string;
  wordCount: number;
}

interface LetterEntry {
  letter: string;
  wordCount: number;
}

interface Question {
  letters: LetterEntry[];
  question: string;
}

// ── Question data (each question maps to one card per letter) ──
const QUESTIONS: Question[] = [
  { letters: [{ letter: "M", wordCount: 3 }],                                                                   question: "Een dier dat kan vliegen" },
  { letters: [{ letter: "B", wordCount: 2 }],                                                                   question: "Iets met wielen" },
  { letters: [{ letter: "S", wordCount: 3 }],                                                                   question: "Iets groens" },
  { letters: [{ letter: "M", wordCount: 4 }, { letter: "O", wordCount: 2 }],                                   question: "Iets uit de keuken" },
  { letters: [{ letter: "H", wordCount: 2 }, { letter: "L", wordCount: 2 }],                                   question: "Speelgoed" },
  { letters: [{ letter: "D", wordCount: 2 }],                                                                   question: "Een vakantieland" },
  { letters: [{ letter: "C", wordCount: 2 }],                                                                   question: "Iets warms" },
  { letters: [{ letter: "S", wordCount: 2 }],                                                                   question: "Iets kouds" },
  { letters: [{ letter: "P", wordCount: 2 }, { letter: "M", wordCount: 2 }],                                   question: "Iets in de ruimte" },
  { letters: [{ letter: "T", wordCount: 3 }, { letter: "J", wordCount: 3 }, { letter: "C", wordCount: 2 }, { letter: "R", wordCount: 3 }], question: "Een voornaam" },
  { letters: [{ letter: "B", wordCount: 2 }],                                                                   question: "Een sport" },
  { letters: [{ letter: "H", wordCount: 2 }, { letter: "V", wordCount: 2 }],                                   question: "Een sport" },
  { letters: [{ letter: "K", wordCount: 2 }],                                                                   question: "Een hobby" },
  { letters: [{ letter: "T", wordCount: 2 }],                                                                   question: "Iets in de badkamer" },
  { letters: [{ letter: "Z", wordCount: 2 }, { letter: "P", wordCount: 3 }, { letter: "A", wordCount: 3 }],   question: "Iets uit de natuur" },
  { letters: [{ letter: "T", wordCount: 2 }, { letter: "F", wordCount: 2 }],                                   question: "Een muziekinstrument" },
  { letters: [{ letter: "R", wordCount: 3 }],                                                                   question: "Eten en drinken" },
  { letters: [{ letter: "S", wordCount: 2 }],                                                                   question: "Iets oranjes" },
  { letters: [{ letter: "P", wordCount: 2 }, { letter: "S", wordCount: 2 }],                                   question: "Televisieserie" },
  { letters: [{ letter: "S", wordCount: 3 }],                                                                   question: "Groente of fruit" },
  { letters: [{ letter: "S", wordCount: 2 }],                                                                   question: "Wat je niet tegen de politie moet zeggen" },
  { letters: [{ letter: "S", wordCount: 2 }],                                                                   question: "Iets wat je zegt als je in de poep trapt" },
  { letters: [{ letter: "B", wordCount: 3 }],                                                                   question: "Iets dat rond is" },
  { letters: [{ letter: "F", wordCount: 2 }],                                                                   question: "Iets wat nat mag wordt" },
  { letters: [{ letter: "J", wordCount: 2 }],                                                                   question: "Iets wat nat mag worden" },
];

// Expand questions into individual (letter, question) cards and shuffle
function buildDeck(): Card[] {
  const cards: Card[] = [];
  for (const q of QUESTIONS) {
    for (const entry of q.letters) {
      cards.push({ letter: entry.letter, question: q.question, wordCount: entry.wordCount });
    }
  }
  // Fisher-Yates shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

const CARDS: Card[] = buildDeck();

const SHADOW_CARD_COUNT = 4;

// ── State ─────────────────────────────────────────────────────
let currentIndex = 0;
let isFlipped = false;
let isAnimating = false;
let wordCounter = 0;

// ── DOM refs ──────────────────────────────────────────────────
const scene            = document.getElementById("card-scene")!;
const cardInner        = document.getElementById("card")!;
const letterEl         = document.getElementById("card-letter")!;
const letterTopLeftEl  = document.getElementById("card-letter-top-left")!;
const letterTopRightEl = document.getElementById("card-letter-top-right")!;
const questionEl       = document.getElementById("card-question")!;
const questionFlippedEl = document.getElementById("card-question-flipped")!;
const remainingInfoEl  = document.getElementById("remaining-info")!;
const emptyState       = document.getElementById("empty-state")!;
const pileWrapper      = document.getElementById("pile-wrapper")!;
const hintEl           = document.getElementById("hint")!;
const counterEl        = document.getElementById("counter")!;

// ── Pile shadow cards ─────────────────────────────────────────
function renderShadowCards(): void {
  pileWrapper.querySelectorAll(".shadow-card").forEach((n) => n.remove());

  const count = Math.min(SHADOW_CARD_COUNT, CARDS.length - currentIndex - 1);
  for (let i = count; i >= 1; i--) {
    const div = document.createElement("div");
    div.className = "shadow-card";
    div.style.transform = `translateX(${i * 4}px) translateY(${i * 5}px) rotate(${i * 1.5}deg)`;
    div.style.zIndex = String(10 - i);
    pileWrapper.insertBefore(div, scene);
  }
}

// ── Show current card ─────────────────────────────────────────
function showCard(): void {
  if (currentIndex >= CARDS.length) {
    pileWrapper.classList.add("hidden");
    emptyState.classList.remove("hidden");
    hintEl.classList.add("hidden");
    counterEl.classList.add("hidden");
    remainingInfoEl.classList.add("hidden");
    return;
  }

  const card = CARDS[currentIndex];
  letterEl.textContent = card.letter.toLowerCase();
  letterTopLeftEl.textContent = card.letter.toLowerCase();
  letterTopRightEl.textContent = card.letter.toLowerCase();
  questionEl.textContent = card.question;
  questionFlippedEl.textContent = card.question;

  // Reset card state – disable the flip transition so the next card
  // appears instantly on the front face without an unwanted animation.
  isFlipped = false;
  cardInner.style.transition = "none";
  scene.classList.remove("flipped", "fly-away", "card-enter");
  // Force a reflow so the browser applies the instant reset before
  // we re-enable the transition for the next user-triggered flip.
  void cardInner.offsetHeight;
  cardInner.style.transition = "";
  scene.classList.add("card-enter");

  const behind = CARDS.length - currentIndex - 1;
  remainingInfoEl.classList.remove("hidden");
  if (behind === 0) {
    remainingInfoEl.textContent = "laatste kaart";
  } else {
    remainingInfoEl.innerHTML = `<span id="remaining">${behind}</span> kaarten over`;
  }
  renderShadowCards();

  wordCounter = 0;
  const wordCount = CARDS[currentIndex].wordCount;
  counterEl.textContent = `0/${wordCount} woorden`;

  hintEl.textContent = "Druk om de kaart om te draaien";
  hintEl.classList.remove("hidden");
}

function handleCardTap(): void {
  if (isAnimating) return;

  if (!isFlipped) {
    // Flip card to show prompt
    isFlipped = true;
    scene.classList.add("flipped");
    hintEl.textContent = "Druk om een woord te tellen";
  } else {
    // Each tap increments the counter by one
    wordCounter++;

    const wordCount = CARDS[currentIndex].wordCount;

    // Replay the pop animation for each new number
    counterEl.style.animation = "none";
    void counterEl.offsetHeight;
    counterEl.style.animation = "";
    counterEl.textContent = `${wordCounter}/${wordCount} woorden`;
    if (wordCounter >= wordCount) {
      // All words counted – fly the card away
      isAnimating = true;
      hintEl.textContent = "Druk om de kaart om te draaien";
      setTimeout(() => {
        scene.classList.add("fly-away");
        scene.addEventListener(
          "animationend",
          () => {
            currentIndex++;
            isAnimating = false;
            showCard();
          },
          { once: true }
        );
      }, 500);
    }
  }
}

// ── Card tap/click handler ────────────────────────────────────
scene.addEventListener("click", () => {
  handleCardTap();
});

// ── Boot ──────────────────────────────────────────────────────
showCard();

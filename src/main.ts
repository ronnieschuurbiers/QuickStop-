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
  { letters: [{ letter: "A", wordCount: 3 }, { letter: "B", wordCount: 2 }, { letter: "C", wordCount: 4 }],    question: "Name animals" },
  { letters: [{ letter: "D", wordCount: 2 }, { letter: "E", wordCount: 3 }],                                   question: "Name movies" },
  { letters: [{ letter: "F", wordCount: 3 }, { letter: "G", wordCount: 1 }, { letter: "H", wordCount: 2 }],    question: "Name foods" },
  { letters: [{ letter: "I", wordCount: 2 }, { letter: "J", wordCount: 4 }],                                   question: "Name jobs or professions" },
  { letters: [{ letter: "K", wordCount: 3 }, { letter: "L", wordCount: 2 }, { letter: "M", wordCount: 3 }],    question: "Name countries" },
  { letters: [{ letter: "N", wordCount: 2 }, { letter: "O", wordCount: 3 }],                                   question: "Name cities" },
  { letters: [{ letter: "P", wordCount: 3 }, { letter: "Q", wordCount: 1 }, { letter: "R", wordCount: 2 }],    question: "Name plants or trees" },
  { letters: [{ letter: "S", wordCount: 4 }, { letter: "T", wordCount: 2 }, { letter: "U", wordCount: 3 }],    question: "Name sports" },
  { letters: [{ letter: "V", wordCount: 2 }, { letter: "W", wordCount: 3 }],                                   question: "Name vegetables or fruits" },
  { letters: [{ letter: "X", wordCount: 1 }, { letter: "Y", wordCount: 3 }, { letter: "Z", wordCount: 2 }],    question: "Name things from nature" },
  { letters: [{ letter: "A", wordCount: 3 }, { letter: "E", wordCount: 2 }, { letter: "I", wordCount: 4 }],    question: "Name musical instruments" },
  { letters: [{ letter: "B", wordCount: 2 }, { letter: "D", wordCount: 3 }],                                   question: "Name things in the kitchen" },
  { letters: [{ letter: "C", wordCount: 3 }, { letter: "F", wordCount: 1 }, { letter: "G", wordCount: 2 }],    question: "Name languages" },
  { letters: [{ letter: "H", wordCount: 2 }, { letter: "J", wordCount: 4 }],                                   question: "Name household items" },
  { letters: [{ letter: "L", wordCount: 3 }, { letter: "M", wordCount: 2 }, { letter: "N", wordCount: 3 }],    question: "Name bodies of water" },
  { letters: [{ letter: "O", wordCount: 2 }, { letter: "P", wordCount: 3 }],                                   question: "Name planets or space terms" },
  { letters: [{ letter: "R", wordCount: 3 }, { letter: "S", wordCount: 4 }, { letter: "T", wordCount: 2 }],    question: "Name weather phenomena" },
  { letters: [{ letter: "U", wordCount: 3 }, { letter: "V", wordCount: 1 }, { letter: "W", wordCount: 2 }],    question: "Name zoo animals" },
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
const remainingEl      = document.getElementById("remaining")!;
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
  remainingEl.textContent = String(behind);
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

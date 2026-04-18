interface Card {
  letter: string;
  question: string;
  wordCount: number;
}

interface Question {
  letters: string[];
  question: string;
  wordCount: number;
}

// ── Question data (each question maps to one card per letter) ──
const QUESTIONS: Question[] = [
  { letters: ["A", "B", "C"],    question: "Name 3 animals",                wordCount: 3 },
  { letters: ["D", "E"],         question: "Name 2 movies",                 wordCount: 2 },
  { letters: ["F", "G", "H"],    question: "Name 3 foods",                  wordCount: 3 },
  { letters: ["I", "J"],         question: "Name 2 jobs or professions",    wordCount: 2 },
  { letters: ["K", "L", "M"],    question: "Name 3 countries",              wordCount: 3 },
  { letters: ["N", "O"],         question: "Name 2 cities",                 wordCount: 2 },
  { letters: ["P", "Q", "R"],    question: "Name 3 plants or trees",        wordCount: 3 },
  { letters: ["S", "T", "U"],    question: "Name 3 sports",                 wordCount: 3 },
  { letters: ["V", "W"],         question: "Name 2 vegetables or fruits",   wordCount: 2 },
  { letters: ["X", "Y", "Z"],    question: "Name 3 things from nature",     wordCount: 3 },
  { letters: ["A", "E", "I"],    question: "Name 3 musical instruments",    wordCount: 3 },
  { letters: ["B", "D"],         question: "Name 2 things in the kitchen",  wordCount: 2 },
  { letters: ["C", "F", "G"],    question: "Name 3 languages",              wordCount: 3 },
  { letters: ["H", "J"],         question: "Name 2 household items",        wordCount: 2 },
  { letters: ["L", "M", "N"],    question: "Name 3 bodies of water",        wordCount: 3 },
  { letters: ["O", "P"],         question: "Name 2 planets or space terms", wordCount: 2 },
  { letters: ["R", "S", "T"],    question: "Name 3 weather phenomena",      wordCount: 3 },
  { letters: ["U", "V", "W"],    question: "Name 3 zoo animals",            wordCount: 3 },
];

// Expand questions into individual (letter, question) cards and shuffle
function buildDeck(): Card[] {
  const cards: Card[] = [];
  for (const q of QUESTIONS) {
    for (const letter of q.letters) {
      cards.push({ letter, question: q.question, wordCount: q.wordCount });
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
  letterEl.textContent = card.letter;
  letterTopLeftEl.textContent = card.letter;
  letterTopRightEl.textContent = card.letter;
  questionEl.textContent = card.question;

  // Reset card state – disable the flip transition so the next card
  // appears instantly on the front face without an unwanted animation.
  isFlipped = false;
  cardInner.style.transition = "none";
  scene.classList.remove("flipped", "fly-away");
  // Force a reflow so the browser applies the instant reset before
  // we re-enable the transition for the next user-triggered flip.
  void cardInner.offsetHeight;
  cardInner.style.transition = "";

  const behind = CARDS.length - currentIndex - 1;
  remainingEl.textContent = String(behind);
  renderShadowCards();

  counterEl.classList.add("hidden");
  counterEl.textContent = "";
  wordCounter = 0;

  hintEl.textContent = "Tap to flip";
  hintEl.classList.remove("hidden");
}

function handleCardTap(): void {
  if (isAnimating) return;

  if (!isFlipped) {
    // Flip card to show prompt
    isFlipped = true;
    scene.classList.add("flipped");
    hintEl.textContent = "Tap to count";
  } else {
    // Each tap increments the counter by one
    wordCounter++;
    counterEl.classList.remove("hidden");

    const wordCount = CARDS[currentIndex].wordCount;

    // Replay the pop animation for each new number
    counterEl.style.animation = "none";
    void counterEl.offsetHeight;
    counterEl.style.animation = "";
    counterEl.textContent = `${wordCounter}/${wordCount}`;
    if (wordCounter >= wordCount) {
      // All words counted – fly the card away
      isAnimating = true;
      hintEl.textContent = "";
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

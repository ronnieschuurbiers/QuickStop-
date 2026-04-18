interface Card {
  letter: string;
  question: string;
}

interface Question {
  letters: string[];
  question: string;
}

// ── Question data (each question maps to one card per letter) ──
const QUESTIONS: Question[] = [
  { letters: ["A", "B", "C"],    question: "Name an animal" },
  { letters: ["D", "E"],         question: "Name a movie" },
  { letters: ["F", "G", "H"],    question: "Name a food" },
  { letters: ["I", "J"],         question: "Name a job or profession" },
  { letters: ["K", "L", "M"],    question: "Name a country" },
  { letters: ["N", "O"],         question: "Name a city" },
  { letters: ["P", "Q", "R"],    question: "Name a plant or tree" },
  { letters: ["S", "T", "U"],    question: "Name a sport" },
  { letters: ["V", "W"],         question: "Name a vegetable or fruit" },
  { letters: ["X", "Y", "Z"],    question: "Name something you find in nature" },
  { letters: ["A", "E", "I"],    question: "Name a musical instrument" },
  { letters: ["B", "D"],         question: "Name something in the kitchen" },
  { letters: ["C", "F", "G"],    question: "Name a language" },
  { letters: ["H", "J"],         question: "Name a household item" },
  { letters: ["L", "M", "N"],    question: "Name an ocean, sea, or river" },
  { letters: ["O", "P"],         question: "Name a planet or space term" },
  { letters: ["R", "S", "T"],    question: "Name a weather phenomenon" },
  { letters: ["U", "V", "W"],    question: "Name an animal from the zoo" },
];

// Expand questions into individual (letter, question) cards and shuffle
function buildDeck(): Card[] {
  const cards: Card[] = [];
  for (const q of QUESTIONS) {
    for (const letter of q.letters) {
      cards.push({ letter, question: q.question });
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

  hintEl.textContent = "Tap to flip";
  hintEl.classList.remove("hidden");
}

function handleCardTap(): void {
  if (isAnimating) return;

  if (!isFlipped) {
    // Flip card to show prompt
    isFlipped = true;
    scene.classList.add("flipped");
    hintEl.textContent = "Tap to send away";
  } else {
    // Fly the entire scene away (preserves the flipped state visually)
    isAnimating = true;
    hintEl.classList.add("hidden");
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
  }
}

// ── Card tap/click handler ────────────────────────────────────
scene.addEventListener("click", () => {
  handleCardTap();
});

// ── Boot ──────────────────────────────────────────────────────
showCard();

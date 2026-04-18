interface Card {
  letter: string;
  question: string;
}

// ── Card data ─────────────────────────────────────────────────
const CARDS: Card[] = [
  { letter: "A", question: "Name an animal with this letter" },
  { letter: "B", question: "Name a fruit with this letter" },
  { letter: "C", question: "Name a city with this letter" },
  { letter: "D", question: "Name a movie with this letter" },
  { letter: "E", question: "Name a sport with this letter" },
  { letter: "F", question: "Name a food with this letter" },
  { letter: "G", question: "Name a country with this letter" },
  { letter: "H", question: "Name a household item with this letter" },
  { letter: "I", question: "Name an insect with this letter" },
  { letter: "J", question: "Name a job with this letter" },
  { letter: "K", question: "Name something in the kitchen with this letter" },
  { letter: "L", question: "Name a language with this letter" },
  { letter: "M", question: "Name a musical instrument with this letter" },
  { letter: "N", question: "Name a country in Europe with this letter" },
  { letter: "O", question: "Name an ocean or sea with this letter" },
  { letter: "P", question: "Name a planet or space term with this letter" },
  { letter: "Q", question: "Name something quiet with this letter" },
  { letter: "R", question: "Name a river with this letter" },
  { letter: "S", question: "Name a sport with this letter" },
  { letter: "T", question: "Name a tree with this letter" },
  { letter: "U", question: "Name something you use every day with this letter" },
  { letter: "V", question: "Name a vegetable with this letter" },
  { letter: "W", question: "Name a weather phenomenon with this letter" },
  { letter: "X", question: "Name something that starts with X" },
  { letter: "Y", question: "Name something yellow with this letter" },
  { letter: "Z", question: "Name an animal from the zoo with this letter" },
];

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

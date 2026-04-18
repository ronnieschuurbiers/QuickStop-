const PROMPTS: string[] = [
  "Name an animal",
  "Name a country",
  "Name a city",
  "Name a food",
  "Name a sport",
  "Name a movie",
  "Name a TV show",
  "Name a famous person",
  "Name a fruit",
  "Name a vegetable",
  "Name a car brand",
  "Name a musical instrument",
  "Name a flower",
  "Name a body part",
  "Name a clothing item",
  "Name a school subject",
  "Name an occupation",
  "Name a hobby",
  "Name a brand",
  "Name a superhero",
  "Name a board game",
  "Name a planet",
  "Name a language",
  "Name a drink",
  "Name a book",
  "Name a dog breed",
  "Name a cartoon character",
  "Name a song",
  "Name a holiday destination",
  "Name a type of dance",
];

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

interface Card {
  letter: string;
  prompt: string;
}

function randomLetter(): string {
  return LETTERS[Math.floor(Math.random() * LETTERS.length)];
}

function randomPrompt(): string {
  return PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
}

function generateCards(count: number): Card[] {
  return Array.from({ length: count }, () => ({
    letter: randomLetter(),
    prompt: randomPrompt(),
  }));
}

// ── State ─────────────────────────────────────────────────────
const cards: Card[] = generateCards(26);
let currentIndex = 0;
let isFlipped = false;
let isAnimating = false;

// ── DOM refs ──────────────────────────────────────────────────
const scene           = document.getElementById("card-scene")!;
const cardEl          = document.getElementById("card")!;
const letterEl        = document.getElementById("card-letter")!;
const letterFrontEl   = document.getElementById("card-letter-front")!;
const promptEl        = document.getElementById("card-prompt")!;
const remainingEl  = document.getElementById("remaining")!;
const emptyState   = document.getElementById("empty-state")!;
const pileWrapper  = document.getElementById("pile-wrapper")!;
const hintEl       = document.getElementById("hint")!;

// ── Pile shadow cards ─────────────────────────────────────────
function renderShadowCards(behind: number): void {
  // Remove old shadows
  pileWrapper.querySelectorAll(".shadow-card").forEach((n) => n.remove());

  const count = Math.min(behind, 3);
  for (let i = count; i >= 1; i--) {
    const div = document.createElement("div");
    div.className = "shadow-card";
    div.style.transform = `translateX(${i * 5}px) translateY(${i * 5}px) rotate(${i * 2}deg)`;
    div.style.zIndex = String(-i);
    pileWrapper.insertBefore(div, scene);
  }
}

// ── Show current card ─────────────────────────────────────────
function showCard(): void {
  if (currentIndex >= cards.length) {
    pileWrapper.classList.add("hidden");
    emptyState.classList.remove("hidden");
    hintEl.classList.add("hidden");
    return;
  }

  const card = cards[currentIndex];
  letterEl.textContent = card.letter;
  letterFrontEl.textContent = card.letter;
  promptEl.textContent = card.prompt;

  // Reset state
  isFlipped = false;
  scene.classList.remove("flipped");
  cardEl.classList.remove("fly-away");
  cardEl.style.visibility = "visible";

  const behind = cards.length - currentIndex - 1;
  remainingEl.textContent = String(behind);
  renderShadowCards(behind);

  hintEl.textContent = "Tap to flip";
  hintEl.classList.remove("hidden");
}

// ── Card click ────────────────────────────────────────────────
scene.addEventListener("click", () => {
  if (isAnimating) return;

  if (!isFlipped) {
    // Flip card to show prompt
    isFlipped = true;
    scene.classList.add("flipped");
    hintEl.textContent = "Tap to send away";
  } else {
    // Fly the card away
    isAnimating = true;
    hintEl.classList.add("hidden");
    cardEl.classList.add("fly-away");

    cardEl.addEventListener(
      "animationend",
      () => {
        currentIndex++;
        isAnimating = false;
        showCard();
      },
      { once: true }
    );
  }
});

// ── Boot ──────────────────────────────────────────────────────
showCard();

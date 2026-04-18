interface Card {
  letter: string;
  question: string;
}

const CARDS_DATA_PATH = "./cards-data.json";

// ── State ─────────────────────────────────────────────────────
let cards: Card[] = [];
let currentIndex = 0;
let isFlipped = false;
let isAnimating = false;
let isReady = false;

// ── DOM refs ──────────────────────────────────────────────────
const scene           = document.getElementById("card-scene")!;
const cardEl          = document.getElementById("card")!;
const letterEl        = document.getElementById("card-letter")!;
const letterTopLeftEl = document.getElementById("card-letter-top-left")!;
const letterTopRightEl = document.getElementById("card-letter-top-right")!;
const questionEl      = document.getElementById("card-question")!;
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
  letterTopLeftEl.textContent = card.letter;
  letterTopRightEl.textContent = card.letter;
  questionEl.textContent = card.question;

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

function isCardArray(data: unknown): data is Card[] {
  return (
    Array.isArray(data) &&
    data.every(
      (card) =>
        typeof card === "object" &&
        card !== null &&
        "letter" in card &&
        "question" in card &&
        typeof (card as Card).letter === "string" &&
        typeof (card as Card).question === "string"
    )
  );
}

async function loadCards(): Promise<void> {
  try {
    const response = await fetch(CARDS_DATA_PATH);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${CARDS_DATA_PATH}: HTTP ${response.status}`);
    }

    const data: unknown = await response.json();
    if (!isCardArray(data)) throw new Error("Invalid card data format");

    cards = data;
    isReady = true;
    showCard();
  } catch (error) {
    console.error("Failed to load card data.", error);
    pileWrapper.classList.add("hidden");
    emptyState.classList.remove("hidden");
    hintEl.classList.add("hidden");
  }
}

// ── Card click ────────────────────────────────────────────────
scene.addEventListener("click", () => {
  if (!isReady || isAnimating) return;

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
void loadCards();

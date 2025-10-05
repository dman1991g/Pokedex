const questions = [
  {
    question: "What type is Pikachu?",
    answers: ["Electric", "Fire", "Water", "Grass"],
    correct: "Electric"
  },
  {
    question: "Which Pokémon evolves into Charizard?",
    answers: ["Charmander", "Charmeleon", "Squirtle", "Bulbasaur"],
    correct: "Charmeleon"
  },
  {
    question: "Who is the Legendary bird of Ice type?",
    answers: ["Moltres", "Articuno", "Zapdos", "Lugia"],
    correct: "Articuno"
  },
  {
    question: "What type is super effective against Water?",
    answers: ["Electric", "Fire", "Grass", "Ground"],
    correct: "Electric"
  },
  {
    question: "Which Pokémon is known as the 'Mouse Pokémon'?",
    answers: ["Pikachu", "Raichu", "Eevee", "Jigglypuff"],
    correct: "Pikachu"
  }
];

let currentQuestionIndex = 0;
let score = 0;

const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");
const nextBtn = document.getElementById("next-btn");
const scoreEl = document.getElementById("score");

function showQuestion() {
  const currentQuestion = questions[currentQuestionIndex];
  questionEl.textContent = currentQuestion.question;
  answersEl.innerHTML = "";
  currentQuestion.answers.forEach(answer => {
    const button = document.createElement("button");
    button.textContent = answer;
    button.classList.add("answer-btn");
    button.addEventListener("click", selectAnswer);
    answersEl.appendChild(button);
  });
}

function selectAnswer(e) {
  const selectedBtn = e.target;
  const currentQuestion = questions[currentQuestionIndex];

  if (selectedBtn.textContent === currentQuestion.correct) {
    selectedBtn.classList.add("correct");
    score++;
  } else {
    selectedBtn.classList.add("wrong");
    // Highlight correct answer
    Array.from(answersEl.children).forEach(btn => {
      if (btn.textContent === currentQuestion.correct) {
        btn.classList.add("correct");
      }
    });
  }

  // Disable all buttons after selection
  Array.from(answersEl.children).forEach(btn => btn.disabled = true);
}

nextBtn.addEventListener("click", () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showScore();
  }
});

function showScore() {
  questionEl.textContent = `Game Over! You scored ${score} out of ${questions.length}.`;
  answersEl.innerHTML = "";
  nextBtn.style.display = "none";
}

showQuestion();
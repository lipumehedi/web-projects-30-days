
const questions = [
  {
    category: "JavaScript Basics",
    question: "Which keyword declares a block-scoped variable that can be reassigned?",
    options: ["const", "let", "static", "define"],
    answer: "let"
  },
  {
    category: "JavaScript Basics",
    question: "Which method displays a message in the browser console?",
    options: ["console.write()", "print()", "console.log()", "show()"],
    answer: "console.log()"
  },
  {
    category: "JavaScript Basics",
    question: "Which symbol is used for strict equality?",
    options: ["=", "==", "===", "!="],
    answer: "==="
  },
  {
    category: "Arrays",
    question: "Which method adds an item to the end of an array?",
    options: ["push()", "pop()", "shift()", "slice()"],
    answer: "push()"
  },
  {
    category: "Functions",
    question: "Which keyword returns a value from a function?",
    options: ["break", "return", "continue", "output"],
    answer: "return"
  },
  {
    category: "DOM",
    question: "Which method selects an element using a CSS selector?",
    options: [
      "document.querySelector()",
      "document.createText()",
      "window.selectCSS()",
      "document.getStyle()"
    ],
    answer: "document.querySelector()"
  },
  {
    category: "Events",
    question: "Which event is commonly used when a form is submitted?",
    options: ["hover", "changeColor", "submit", "scrollEnd"],
    answer: "submit"
  },
  {
    category: "Objects",
    question: "Which syntax accesses the name property of an object called user?",
    options: ["user->name", "user.name", "user::name", "user#name"],
    answer: "user.name"
  },
  {
    category: "Async JavaScript",
    question: "Which keyword is used to wait for a Promise inside an async function?",
    options: ["defer", "wait", "await", "pause"],
    answer: "await"
  },
  {
    category: "Data Types",
    question: "Which value represents an intentional absence of a value in JavaScript?",
    options: ["undefined", "null", "NaN", "false"],
    answer: "null"
  }
];

const quizScreen = document.querySelector("#quizScreen");
const resultScreen = document.querySelector("#resultScreen");

const questionCounter = document.querySelector("#questionCounter");
const scoreLabel = document.querySelector("#scoreLabel");
const progressBar = document.querySelector("#progressBar");
const categoryLabel = document.querySelector("#categoryLabel");
const questionText = document.querySelector("#questionText");
const answerButtons = document.querySelector("#answerButtons");
const feedback = document.querySelector("#feedback");

const nextButton = document.querySelector("#nextButton");
const restartButton = document.querySelector("#restartButton");

const resultTitle = document.querySelector("#resultTitle");
const finalScore = document.querySelector("#finalScore");
const resultMessage = document.querySelector("#resultMessage");

let currentQuestionIndex = 0;
let score = 0;
let answerSelected = false;

function loadQuestion() {
  const currentQuestion = questions[currentQuestionIndex];

  answerSelected = false;

  questionCounter.textContent =
    `Question ${currentQuestionIndex + 1} of ${questions.length}`;

  scoreLabel.textContent = `Score: ${score}`;

  progressBar.style.width =
    `${(currentQuestionIndex / questions.length) * 100}%`;

  categoryLabel.textContent = currentQuestion.category;
  questionText.textContent = currentQuestion.question;

  feedback.textContent = "Choose your answer.";
  feedback.className = "feedback";

  nextButton.disabled = true;
  nextButton.textContent =
    currentQuestionIndex === questions.length - 1
      ? "See Results →"
      : "Next Question →";

  answerButtons.replaceChildren();

  currentQuestion.options.forEach((option) => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "answer-button";
    button.textContent = option;

    button.addEventListener("click", () => {
      selectAnswer(button, option, currentQuestion.answer);
    });

    answerButtons.appendChild(button);
  });
}

function selectAnswer(selectedButton, selectedOption, correctAnswer) {
  if (answerSelected) {
    return;
  }

  answerSelected = true;

  const buttons = answerButtons.querySelectorAll(".answer-button");

  buttons.forEach((button) => {
    button.disabled = true;

    if (button.textContent === correctAnswer) {
      button.classList.add("correct");
    }
  });

  if (selectedOption === correctAnswer) {
    score++;

    feedback.textContent = "Correct! Great job! 🎉";
    feedback.className = "feedback correct-text";
  } else {
    selectedButton.classList.add("wrong");

    feedback.textContent =
      `Not quite! The correct answer is: ${correctAnswer}`;

    feedback.className = "feedback wrong-text";
  }

  scoreLabel.textContent = `Score: ${score}`;
  nextButton.disabled = false;
}

function showResults() {
  quizScreen.hidden = true;
  resultScreen.hidden = false;

  progressBar.style.width = "100%";
  finalScore.textContent = `${score} / ${questions.length}`;

  const percentage = (score / questions.length) * 100;

  if (percentage === 100) {
    resultTitle.textContent = "Perfect Score! 🏆";
    resultMessage.textContent =
      "Excellent! You answered every question correctly.";
  } else if (percentage >= 70) {
    resultTitle.textContent = "Great Job! 🎉";
    resultMessage.textContent =
      "You have a good understanding of JavaScript. Keep going!";
  } else if (percentage >= 40) {
    resultTitle.textContent = "Good Effort! 💪";
    resultMessage.textContent =
      "You are making progress. Review the topics and try again.";
  } else {
    resultTitle.textContent = "Keep Practicing! 📚";
    resultMessage.textContent =
      "Review the basics and give the quiz another try.";
  }
}

function restartQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  answerSelected = false;

  resultScreen.hidden = true;
  quizScreen.hidden = false;

  loadQuestion();
}

nextButton.addEventListener("click", () => {
  if (!answerSelected) {
    return;
  }

  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++;
    loadQuestion();
  } else {
    showResults();
  }
});

restartButton.addEventListener("click", restartQuiz);

// Start the quiz.
loadQuestion();

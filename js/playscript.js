document.addEventListener("DOMContentLoaded", function () {
    setupQuiz();
});

let currentQuestionIndex = 0;

const questions = [
    { image: "question1.png", answer: "ozil" },
    { image: "question2.png", answer: "jinping" },
    { image: "question3.png", answer: "djokovic" },
    { image: "question4.png", answer: "brady" },
    { image: "question6.png", answer: "sakho" },
    { image: "question7.png", answer: "singe" },
    { image: "question5.png", answer: "hitler" },
    { image: "question8.png", answer: "georges" }
];

function setupQuiz() {
    const answerInput = document.getElementById("answer");
    const questionTitle = document.querySelector(".question h2");
    const questionImage = document.querySelector(".question img");

    if (!answerInput || !questionTitle || !questionImage) return;

    answerInput.focus();

    answerInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            checkAnswer(this, questionTitle, questionImage);
        }
    });

    loadQuestion(questionTitle, questionImage);
}

function loadQuestion(titleElement, imageElement) {
    const current = questions[currentQuestionIndex];
    const questionNumber = currentQuestionIndex + 1;
    titleElement.textContent = `Who is this ?`;
    imageElement.src = `../questions/${current.image}`;
    imageElement.alt = `Question ${questionNumber}`;
}

function checkAnswer(inputElement, titleElement, imageElement) {
    const userAnswer = inputElement.value.trim().toLowerCase();

    if (currentQuestionIndex >= questions.length) return;

    const correctAnswer = questions[currentQuestionIndex].answer.toLowerCase();
    const pattern = new RegExp(`\\b${correctAnswer}\\b`, "i");

    if (pattern.test(userAnswer)) {
        currentQuestionIndex++;

        if (currentQuestionIndex < questions.length) {
            inputElement.value = "";
            loadQuestion(titleElement, imageElement);
        } else {
            lockInput(inputElement, "You found all the correct answers");
        }
    } else {
        inputElement.value = "";
    }
}

function lockInput(inputElement, message) {
    inputElement.disabled = true;
    inputElement.value = message;
    inputElement.style.color = "green";
    inputElement.style.fontWeight = "bold";
}
zoeinsf
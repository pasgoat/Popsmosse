document.addEventListener("DOMContentLoaded", function () {
    setupQuiz();

});


let currentQuestionIndex = 0;

const questions = [
    { image: "question1.png", answer: "ozil" },
    { image: "question3.png", answer: "djokovic" },
    { image: "question4.png", answer: "brady" },
    { image: "question6.png", answer: "sakho" },
    { image: "question7.png", answer: "matteo" },
    { image: "question5.png", answer: "felix" },
    { image: "question2.png", answer: "jinping" },
    { image: "question8.png", answer: "maxime" }
];

function setupQuiz() {

    const answerInput = document.getElementById("answer");
    const questionTitle = document.querySelector(".question h2");
    const questionImage = document.querySelector(".question img");

    if (!answerInput || !questionTitle || !questionImage) {
        console.error("Missing quiz elements");
        return;
    }

    answerInput.focus();
    answerInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            console.log("Enter key pressed");
            event.preventDefault();
            console.log("Enter pressed, checking answer...");
            checkAnswer(this, questionTitle, questionImage);
        }
    });

    loadQuestion(questionTitle, questionImage);
}

function loadQuestion(titleElement, imageElement) {
    if (currentQuestionIndex >= questions.length) {
        console.log("No more questions");
        return;
    }
    const current = questions[currentQuestionIndex];
    const questionNumber = currentQuestionIndex + 1;
    titleElement.textContent = `Who is this?`;
    imageElement.src = `../questions/${current.image}`;
    imageElement.alt = `Question ${questionNumber}`;
}

function checkAnswer(inputElement, titleElement, imageElement) {
    const userAnswer = inputElement.value.trim().toLowerCase();
    console.log(`User answered: "${userAnswer}"`);

    if (currentQuestionIndex >= questions.length) {
        console.log("Quiz complete");
        return;
    }

    const correctAnswer = questions[currentQuestionIndex].answer.toLowerCase();
    const pattern = new RegExp(`\\b${correctAnswer}\\b`, "i");

    if (pattern.test(userAnswer)) {
        console.log("Correct answer!");
        currentQuestionIndex++;

        if (currentQuestionIndex < questions.length) {
            inputElement.value = "";
            loadQuestion(titleElement, imageElement);
        } else {
            lockInput(inputElement, "You found all the correct answers!");
        }
    } else {
        console.log("Incorrect answer, try again.");
        inputElement.value = "";
    }
}

function lockInput(inputElement, message) {
    inputElement.disabled = true;
    inputElement.value = message;
    inputElement.style.color = "green";
    inputElement.style.fontWeight = "bold";
}

function getUsername() {
    return localStorage.getItem("currentUser") || "Player";
}

function updateLeaderboard(players) {
    console.log("Leaderboard update:", players);

    const list = document.getElementById("leaderboard-list");
    if (!list) return;

    list.innerHTML = "";

    players.sort((a, b) => b.score - a.score);

    players.forEach(player => {
        const li = document.createElement("li");
        li.textContent = `${player.name} – ${player.score} pts`;
        list.appendChild(li);
    });
}


const socket = io();
const urlParams = new URLSearchParams(window.location.search);
const roomCode = urlParams.get('room');
const username = getUsername();

socket.emit('joinRoom', { username, roomCode });
// You can now use this roomCode to sync game logic, send/receive answers, etc.
// Save username before emitting
localStorage.setItem("currentUser", username);

socket.on('playerJoined', (players) => {
    console.log("Updated player list:", players);
    const formattedPlayers = players.map(name => ({ name, score: 0 }));
    updateLeaderboard(formattedPlayers);
});


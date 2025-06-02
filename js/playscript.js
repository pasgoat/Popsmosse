document.addEventListener("DOMContentLoaded", function () {
    setupQuiz();

});

let currentQuestionIndex = 0;

const questions = [
    { image: "question1.png", answer: "ozil" },
    { image: "question2.png", answer: "cantabria" },
    { image: "question3.png", answer: "djokovic" },
    { image: "question4.png", answer: "brady" },
    { image: "question5.png", answer: "arcteryx" },
    { image: "question6.png", answer: "yakko's world" },
    { image: "question7.png", answer: "kosovo" },
    { image: "question8.png", answer: "syria" },
    { image: "question9.png", answer: "paramore" },
    { image: "question10.png", answer: "4chan" },
    { image: "question11.png", answer: "spiderman" },
    { image: "question12.png", answer: "penn" },
    { image: "question13.png", answer: "zendaya" },
    { image: "question14.png", answer: "skoda" },
    { image: "question15.png", answer: "the name of the rose" },
    { image: "question16.png", answer: "mulan" },
    { image: "question17.png", answer: "kill bill" },
    { image: "question18.png", answer: "21 savage" },
    { image: "question19.png", answer: "chili pepper" },
    { image: "question20.png", answer: "markiplier" }
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

// function loadQuestion(titleElement, imageElement) {
//     if (currentQuestionIndex >= questions.length) {
//         console.log("No more questions");
//         return;
//     }
//     const current = questions[currentQuestionIndex];
//     const questionNumber = currentQuestionIndex + 1;
//     titleElement.textContent = `Who is this?`;
//     imageElement.src = `../questions/${current.image}`;
//     imageElement.alt = `Question ${questionNumber}`;
// }

function checkAnswer(inputElement) {
    const userAnswer = inputElement.value.trim().toLowerCase();
    if (!userAnswer) return;

    socket.emit('submitAnswer', { roomCode, username, answer: userAnswer });

    inputElement.value = "";
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

localStorage.setItem("currentUser", username);

socket.on('playerJoined', (players) => {
    console.log("✅ Updated leaderboard:", players);
    updateLeaderboard(players);
});

let timerInterval;
let timer = 0;

socket.on('newQuestion', ({ image, question, duration }) => {
    const title = document.querySelector(".question h2");
    const imageEl = document.querySelector(".question img");
    const input = document.getElementById("answer");

    title.textContent = question;
    imageEl.src = `../questions/${image}`;
    input.disabled = false;
    input.value = "";
    input.style.color = "";
    input.focus();

    timer = duration;
    updateTimerDisplay(timer);

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timer--;
        updateTimerDisplay(timer);
        if (timer <= 0) {
            clearInterval(timerInterval);
            input.disabled = true;
        }
    }, 1000);
});

socket.on('revealAnswer', ({ answer }) => {
    const input = document.getElementById("answer");
    input.value = `Answer: ${answer}`;
    input.style.color = "green";
    input.disabled = true;
});

function updateTimerDisplay(time) {
    let timerDiv = document.getElementById("timer");
    if (!timerDiv) {
        timerDiv = document.createElement("div");
        timerDiv.id = "timer";
        timerDiv.style.fontWeight = "bold";
        document.body.prepend(timerDiv);
    }
    timerDiv.textContent = `⏱ Time left: ${time}s`;
}

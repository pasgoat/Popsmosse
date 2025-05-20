document.addEventListener("DOMContentLoaded", function () {
    setupAnswerListener();
});

function setupAnswerListener() {
    const answerInput = document.getElementById("answer");

    if (!answerInput) return;

    answerInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            checkAnswer(this);
        }
    });
}

function checkAnswer(inputElement) {
    const userAnswer = inputElement.value.trim().toLowerCase();
    const answers = [
        { number: "1", answer: "ozil" }
    ];

    const correctAnswer = answers.find(a => a.number === "1");

    if (correctAnswer) {
        const wordPattern = new RegExp("\\b" + correctAnswer.answer.toLowerCase() + "\\b");

        if (wordPattern.test(userAnswer)) {
            lockInput(inputElement, "You found the correct answer");
            return;
        }
    }

    inputElement.value = "";
}

function lockInput(inputElement, message) {
    inputElement.disabled = true;             // Lock the input
    inputElement.value = message;             // Show success message
    inputElement.style.color = "green";       // Optional styling
    inputElement.style.fontWeight = "bold";
}

function setupAnswerListener() {
    const answerInput = document.getElementById("answer");

    if (!answerInput) return;

    answerInput.focus(); // ✅ Automatically focus the input box

    answerInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            checkAnswer(this);
        }
    });
}

document.addEventListener("click", () => {
    const input = document.getElementById("answer");
    if (input && !input.disabled) {
        input.focus();
    }
});

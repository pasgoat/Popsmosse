document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.querySelector(".create-game");
  const usernameInput = document.querySelector(".username-input");

  startButton.addEventListener("click", () => {
    const username = usernameInput.value.trim();

    if (username !== "") {
      // Store the username locally
      localStorage.setItem("username", username);

      // Redirect to play page
      window.location.href = "../html/play.html";
    } else {
      alert("Please enter a username.");
    }
  });
});

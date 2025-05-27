document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.querySelector(".create-game");
  const usernameInput = document.querySelector(".username-input");

  startButton.addEventListener("click", () => {
    const username = usernameInput.value.trim();

      // Store the username locally
      localStorage.setItem("currentUser", username);

      // Redirect to play page
      window.location.href = "./play.html";
  });
});

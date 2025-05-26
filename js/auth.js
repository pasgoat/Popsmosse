function showUsername() {
  const user = localStorage.getItem("currentUser");
  const display = document.getElementById("userDisplay");
  const loginLink = document.getElementById("openLogin");
  const logoutBtn = document.getElementById("logoutBtn");

  if (user) {
    display.textContent = `Welcome, ${user}`;
    loginLink.style.display = "none";
    logoutBtn.style.display = "inline-block";
  } else {
    display.textContent = "";
    loginLink.style.display = "inline-block";
    logoutBtn.style.display = "none";
  }
}


document.addEventListener("DOMContentLoaded", () => {
  showUsername();
  const showLoginBtn = document.getElementById("showLogin");
  const showSignupBtn = document.getElementById("showSignup");
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const closeModalBtn = document.getElementById("closeModal");
  const modal = document.getElementById("loginModal");
  const openLogin = document.getElementById("openLogin");
  const logoutBtn = document.getElementById("logoutBtn");
  const logoutConfirmModal = document.getElementById("logoutConfirmModal");
  const confirmLogoutBtn = document.getElementById("confirmLogoutBtn");
  const cancelLogoutBtn = document.getElementById("cancelLogoutBtn");

  
  // Toggle forms
  showLoginBtn.addEventListener("click", () => {
    loginForm.style.display = "block";
    signupForm.style.display = "none";
    showLoginBtn.classList.add("active");
    showSignupBtn.classList.remove("active");
  });
  
  showSignupBtn.addEventListener("click", () => {
    signupForm.style.display = "block";
    loginForm.style.display = "none";
    showSignupBtn.classList.add("active");
    showLoginBtn.classList.remove("active");
  });
  
  // Open modal
  openLogin.addEventListener("click", () => {
    modal.style.display = "flex";
  });
  
  // Close modal
  closeModalBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });
  
  // Sign Up logic
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const username = signupForm.querySelector('input[placeholder="Username"]').value;
    const email = signupForm.querySelector('input[placeholder="Email"]').value;
    const password = signupForm.querySelectorAll('input[placeholder="Password"]')[0].value;
    const confirmPassword = signupForm.querySelector('input[placeholder="Confirm Password"]').value;
    
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    
    const users = JSON.parse(localStorage.getItem("users")) || [];
    
    if (users.find(u => u.username === username)) {
      alert("Username already exists!");
      return;
    }
    
    users.push({ username, email, password });
    localStorage.setItem("users", JSON.stringify(users));
    
    alert("Account created successfully! You can now sign in.");
    signupForm.reset();
    showLoginBtn.click(); // Switch to login tab
  });
  
  // Login logic
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const username = loginForm.querySelector('input[placeholder="Username"]').value;
    const password = loginForm.querySelector('input[placeholder="Password"]').value;
    
    const users = JSON.parse(localStorage.getItem("users")) || [];
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      alert(`Welcome back, ${username}!`);
      localStorage.setItem("currentUser", username);
      modal.style.display = "none";
      loginForm.reset();
      showUsername();
    } else {
      alert("Invalid username or password!");
    }
    
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    logoutConfirmModal.style.display = "flex"; // show modal
  });

  // If user confirms logout, remove currentUser and update UI
  confirmLogoutBtn.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    logoutConfirmModal.style.display = "none";
    showUsername();
  });

  // If user cancels, just hide the modal
  cancelLogoutBtn.addEventListener("click", () => {
    logoutConfirmModal.style.display = "none";
  });
  });
});






import { loadQuizzes, addQuiz, addQuestionToQuiz } from './quizStorage.js';

document.addEventListener("DOMContentLoaded", () => {
  const typeCards = document.querySelectorAll('.question-type-card');
  const formContainer = document.querySelector('.question-form');
  const quizListUl = document.querySelector('.quiz-list ul');
  const newQuizBtn = document.querySelector('.new-quiz-btn');

  let selectedQuizId = null;

  const quizzes = loadQuizzes();
  if (quizzes.length > 0) {
    selectedQuizId = quizzes[0].id; // Preselect first quiz on page load if exists
  }

  // Render the quiz list with clickable items
function renderQuizList() {
  const quizzes = loadQuizzes();
  console.log('selectedQuizId:', selectedQuizId);
  quizListUl.innerHTML = '';
  quizzes.forEach(quiz => {
    console.log('quiz.id:', quiz.id, 'matches selected?', quiz.id === selectedQuizId);
    const li = document.createElement('li');
    li.textContent = quiz.name;
    li.dataset.id = quiz.id;
    li.classList.toggle('selected', quiz.id === selectedQuizId);
    li.addEventListener('click', () => {
      selectedQuizId = quiz.id;
      console.log('Selected quiz:', selectedQuizId);
      renderQuizList();
    });
    quizListUl.appendChild(li);
  });
}


  // Add new quiz button
  newQuizBtn.addEventListener('click', () => {
    const name = prompt("Enter new quiz name:");
    if (!name) return;
    const newQuiz = addQuiz(name);
    selectedQuizId = newQuiz.id;
    renderQuizList();
  });

  // Render form for selected question type
  function renderForm(type) {
    formContainer.innerHTML = '';

    if (type === 'quote') {
      formContainer.innerHTML = `
        <textarea class="quote-textarea" placeholder="Enter your quote question..." rows="4"></textarea>
        <input type="text" class="possible-answers" placeholder="Possible answers (comma separated)" />
        <button type="submit">Add to Quiz</button>
      `;
    } else if (type === 'image') {
      formContainer.innerHTML = `
        <div class="upload-box" id="drop-area">
            <input type="file" id="image-upload" class="image-upload" accept="image/*" />
            <label for="image-upload" class="upload-btn">📁 Upload Image</label>
            <p class="drop-text">or drag and drop an image here</p>
            <img id="image-preview" class="image-preview" style="display: none;" />
        </div>
        <input type="text" class="possible-answers" placeholder="Possible answers (comma separated)" />
        <button type="submit">Add to Quiz</button>
      `;

      const dropArea = formContainer.querySelector('#drop-area');
      const imageInput = formContainer.querySelector('#image-upload');
      const imagePreview = formContainer.querySelector('#image-preview');

      const showPreview = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          imagePreview.src = e.target.result;
          imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
      };

      imageInput.addEventListener('change', () => {
        const file = imageInput.files[0];
        if (file) showPreview(file);
      });

      ['dragenter', 'dragover'].forEach(event => {
        dropArea.addEventListener(event, (e) => {
          e.preventDefault();
          dropArea.classList.add('dragover');
        });
      });

      ['dragleave', 'drop'].forEach(event => {
        dropArea.addEventListener(event, (e) => {
          e.preventDefault();
          dropArea.classList.remove('dragover');
        });
      });

      dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
          imageInput.files = e.dataTransfer.files; // assign to input for consistency
          showPreview(file);
        }
      });
    }
  }

  // Default form on page load
  let currentType = 'quote';
  renderForm(currentType);

  typeCards.forEach(card => {
    card.addEventListener('click', () => {
      typeCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      currentType = card.dataset.type;
      renderForm(currentType);
    });
  });

  // Listen for form submit events on dynamically generated form
  formContainer.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!selectedQuizId) {
      alert("Please select a quiz to add questions to.");
      return;
    }

    let question = { type: currentType };

    if (currentType === 'quote') {
      const questionText = formContainer.querySelector('.quote-textarea').value.trim();
      const answers = formContainer.querySelector('.possible-answers').value.trim();

      if (!questionText || !answers) {
        alert("Please fill both the question and possible answers.");
        return;
      }

      question.question = questionText;
      question.answers = answers.split(',').map(a => a.trim());
    } else if (currentType === 'image') {
      const imageInput = formContainer.querySelector('#image-upload');
      const answers = formContainer.querySelector('.possible-answers').value.trim();

      if (imageInput.files.length === 0) {
        alert("Please upload an image.");
        return;
      }
      if (!answers) {
        alert("Please provide possible answers.");
        return;
      }

      const file = imageInput.files[0];
      // We cannot store the file directly in localStorage; convert to base64 string
      const reader = new FileReader();
      reader.onload = function(event) {
        question.imageData = event.target.result; // base64 string
        question.answers = answers.split(',').map(a => a.trim());

        // Save question after image is read
        const success = addQuestionToQuiz(selectedQuizId, question);
        if (success) {
          alert("Question added!");
          formContainer.reset?.();
          renderForm(currentType); // reset form
        } else {
          alert("Failed to add question.");
        }
      };
      reader.readAsDataURL(file);
      return; // wait for async read, don't proceed further here
    }

    // For quote type (sync)
    const success = addQuestionToQuiz(selectedQuizId, question);
    if (success) {
      alert("Question added!");
      formContainer.reset?.();
      renderForm(currentType);
    } else {
      alert("Failed to add question.");
    }
  });

  // Initial render of quiz list
  renderQuizList();
});

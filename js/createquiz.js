import { loadQuizzes, addQuiz, addQuestionToQuiz } from './quizStorage.js';

document.addEventListener("DOMContentLoaded", () => {
  const quizListUl = document.querySelector('.quiz-list ul');
  const newQuizBtn = document.querySelector('.new-quiz-btn');
  const questionWrapper = document.querySelector('.question-wrapper');

  let selectedQuizId = null;
  let currentType = 'quote';

  // Load quizzes and select first if any
  let quizzes = loadQuizzes();
  if (quizzes.length > 0) {
    selectedQuizId = quizzes[0].id;
  }

  // --- Helpers ---

  function saveQuizzes(quizzes) {
    localStorage.setItem('quizzes', JSON.stringify(quizzes));
  }

  function resetForm(container, type) {
    container.reset?.();
    renderForm(type, container);
  }

  // --- Render quiz list ---

  function renderQuizList() {
    quizzes = loadQuizzes();
    quizListUl.innerHTML = '';

    quizzes.forEach(quiz => {
      const li = document.createElement('li');
      li.dataset.id = quiz.id;
      li.classList.toggle('selected', quiz.id === selectedQuizId);

      const nameSpan = document.createElement('span');
      nameSpan.textContent = quiz.name;

      const btnContainer = document.createElement('div');
      btnContainer.style.display = 'flex';
      btnContainer.style.gap = '6px';

      const eyeBtn = document.createElement('button');
      eyeBtn.innerHTML = '<i class="fas fa-eye"></i>';
      eyeBtn.classList.add('eye-button');
      eyeBtn.title = "View questions";
      eyeBtn.addEventListener('click', e => {
        e.stopPropagation();
        renderQuestionsForQuiz(quiz);
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.innerHTML = '🗑️';
      deleteBtn.classList.add('delete-quiz-button');
      deleteBtn.title = "Delete quiz";
      deleteBtn.addEventListener('click', e => {
        e.stopPropagation();
        if (confirm(`Delete the quiz "${quiz.name}"?`)) {
          const updatedQuizzes = loadQuizzes().filter(q => q.id !== quiz.id);
          saveQuizzes(updatedQuizzes);
          if (selectedQuizId === quiz.id) {
            selectedQuizId = updatedQuizzes.length > 0 ? updatedQuizzes[0].id : null;
          }
          renderQuizList();
          if (selectedQuizId) {
            renderQuestionFormWrapper();
          } else {
            questionWrapper.innerHTML = '';
          }
        }
      });

      btnContainer.append(eyeBtn, deleteBtn);
      li.append(nameSpan, btnContainer);

      li.addEventListener('click', () => {
        selectedQuizId = quiz.id;
        renderQuizList();
      });

      quizListUl.appendChild(li);
    });
  }

  // --- Render form ---

  function renderForm(type, container = document.querySelector('.question-form')) {
    container.innerHTML = '';

    if (type === 'quote') {
      container.innerHTML = `
        <textarea class="quote-textarea" placeholder="Enter your quote question..." rows="4"></textarea>
        <input type="text" class="possible-answers" placeholder="Possible answers (comma separated)" />
        <button type="submit">Add to Quiz</button>
      `;
    } else if (type === 'image') {
      container.innerHTML = `
        <div class="upload-box" id="drop-area">
          <input type="file" id="image-upload" class="image-upload" accept="image/*" />
          <label for="image-upload" class="upload-btn">📁 Upload Image</label>
          <p class="drop-text">or drag and drop an image here</p>
          <img id="image-preview" class="image-preview" style="display: none;" />
        </div>
        <input type="text" class="image-question-input" placeholder="Enter a question for this image..." />
        <input type="text" class="possible-answers" placeholder="Possible answers (comma separated)" />
        <button type="submit">Add to Quiz</button>
      `;

      setupImageUpload(container);
    }
  }

  function setupImageUpload(container) {
    const dropArea = container.querySelector('#drop-area');
    const imageInput = container.querySelector('#image-upload');
    const imagePreview = container.querySelector('#image-preview');

    const showPreview = (file) => {
      const reader = new FileReader();
      reader.onload = e => {
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
      dropArea.addEventListener(event, e => {
        e.preventDefault();
        dropArea.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(event => {
      dropArea.addEventListener(event, e => {
        e.preventDefault();
        dropArea.classList.remove('dragover');
      });
    });

    dropArea.addEventListener('drop', e => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        imageInput.files = e.dataTransfer.files;
        showPreview(file);
      }
    });
  }

  // --- Render questions for quiz ---

  function renderQuestionsForQuiz(quiz) {
    questionWrapper.innerHTML = `<h2>Questions for "${quiz.name}"</h2>`;

    if (!quiz.questions.length) {
      questionWrapper.innerHTML += `<p>No questions added yet.</p>`;
      return;
    }

    const ul = document.createElement('ul');
    ul.classList.add('question-list');

    quiz.questions.forEach((q, index) => {
      const li = document.createElement('li');

      if (q.type === 'quote') {
        li.innerHTML = `
          <div class="question-content">
            <strong>Q${index + 1} (Quote):</strong> ${q.question}<br>
            <em>Answers:</em> ${q.answers.join(', ')}
          </div>
          <div class="question-actions">
            <button class="edit-btn" data-index="${index}">✏️ Edit</button>
            <button class="delete-btn" data-index="${index}">🗑️ Delete</button>
          </div>
        `;
      } else if (q.type === 'image') {
        li.innerHTML = `
          <div class="question-content">
            <strong>Q${index + 1} (Image):</strong><br>
            <img src="${q.imageData}" alt="Question Image" style="max-width: 500px;"><br>
            <p><strong>Question:</strong> ${q.question}</p>
            <em>Answers:</em> ${q.answers.join(', ')}
          </div>
          <div class="question-actions">
            <button class="edit-btn" data-index="${index}">✏️ Edit</button>
            <button class="delete-btn" data-index="${index}">🗑️ Delete</button>
          </div>
        `;
      }

      ul.appendChild(li);
    });

    const scrollWrapper = document.createElement('div');
    scrollWrapper.classList.add('question-scroll-container');
    scrollWrapper.appendChild(ul);
    questionWrapper.appendChild(scrollWrapper);

    // Add event listeners for edit/delete buttons
    questionWrapper.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => editQuestion(quiz.id, parseInt(btn.dataset.index)));
    });

    questionWrapper.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteQuestion(quiz.id, parseInt(btn.dataset.index)));
    });

    // Back button
    const backBtn = document.createElement('button');
    backBtn.textContent = "← Back to Add Questions";
    backBtn.classList.add('btn-back');
    backBtn.addEventListener('click', renderQuestionFormWrapper);
    questionWrapper.appendChild(backBtn);
  }

  // --- Render question form wrapper ---

  function renderQuestionFormWrapper() {
    questionWrapper.innerHTML = `
      <h2>Create a Question</h2>
      <div class="question-type-selector">
        <div class="question-type-card ${currentType === 'quote' ? 'selected' : ''}" data-type="quote">📜 Quote Question</div>
        <div class="question-type-card ${currentType === 'image' ? 'selected' : ''}" data-type="image">🖼️ Image Question</div>
      </div>
      <form class="question-form"></form>
    `;

    const typeCards = questionWrapper.querySelectorAll('.question-type-card');
    const formContainer = questionWrapper.querySelector('.question-form');

    typeCards.forEach(card => {
      card.addEventListener('click', () => {
        typeCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        currentType = card.dataset.type;
        renderForm(currentType, formContainer);
      });
    });

    formContainer.addEventListener('submit', handleFormSubmit);

    renderForm(currentType, formContainer);
  }

  // --- Handle form submission ---

  function handleFormSubmit(e) {
    e.preventDefault();

    if (!selectedQuizId) {
      alert("Please select a quiz to add questions to.");
      return;
    }

    const container = e.currentTarget;
    let question = { type: currentType };

    if (currentType === 'quote') {
      const questionText = container.querySelector('.quote-textarea').value.trim();
      const answers = container.querySelector('.possible-answers').value.trim();

      if (!questionText || !answers) {
        alert("Please fill both the question and possible answers.");
        return;
      }

      question.question = questionText;
      question.answers = answers.split(',').map(a => a.trim());

      saveQuestion(question);

    } else if (currentType === 'image') {
      const imageInput = container.querySelector('#image-upload');
      const answers = container.querySelector('.possible-answers').value.trim();
      const questionText = container.querySelector('.image-question-input').value.trim();

      if (imageInput.files.length === 0) {
        alert("Please upload an image.");
        return;
      }
      if (!answers) {
        alert("Please provide possible answers.");
        return;
      }
      if (!questionText) {
        alert("Please enter a question for the image.");
        return;
      }

      question.question = questionText;

      const file = imageInput.files[0];
      const reader = new FileReader();
      reader.onload = event => {
        question.imageData = event.target.result;
        question.answers = answers.split(',').map(a => a.trim());
        saveQuestion(question);
      };
      reader.readAsDataURL(file);
    }
  }

  function saveQuestion(question) {
    const success = addQuestionToQuiz(selectedQuizId, question);
    if (success) {
      alert("Question added!");
      renderQuestionFormWrapper();
    } else {
      alert("Failed to add question.");
    }
  }

  // --- Delete question ---

  function deleteQuestion(quizId, index) {
    const quizzes = loadQuizzes();
    const quiz = quizzes.find(q => q.id === quizId);
    if (!quiz) return;

    if (confirm("Are you sure you want to delete this question?")) {
      quiz.questions.splice(index, 1);
      saveQuizzes(quizzes);
      renderQuestionsForQuiz(quiz);
    }
  }

  // --- Edit question ---

  function editQuestion(quizId, index) {
    const quizzes = loadQuizzes();
    const quiz = quizzes.find(q => q.id === quizId);
    const question = quiz?.questions[index];
    if (!question) return;

    selectedQuizId = quizId;
    currentType = question.type;
    renderQuestionFormWrapper();

    const form = document.querySelector('.question-form');

    if (question.type === 'quote') {
      form.querySelector('.quote-textarea').value = question.question;
      form.querySelector('.possible-answers').value = question.answers.join(', ');
    } else if (question.type === 'image') {
      const preview = form.querySelector('#image-preview');
      preview.src = question.imageData;
      preview.style.display = 'block';

      form.querySelector('.image-question-input').value = question.question;
      form.querySelector('.possible-answers').value = question.answers.join(', ');
    }

    // Remove old question so it's replaced when submitting edited version
    quiz.questions.splice(index, 1);
    saveQuizzes(quizzes);
  }

  // --- Add new quiz button ---

  newQuizBtn.addEventListener('click', () => {
    const name = prompt("Enter new quiz name:");
    if (!name) return;

    const newQuiz = addQuiz(name);
    selectedQuizId = newQuiz.id;
    renderQuizList();
    renderQuestionFormWrapper();
  });

  // --- Initial render ---

  renderQuizList();
  renderQuestionFormWrapper();
});

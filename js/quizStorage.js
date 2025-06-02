export function loadQuizzes() {
  const quizzes = localStorage.getItem('quizzes');
  return quizzes ? JSON.parse(quizzes) : [];
}

export function saveQuizzes(quizzes) {
  localStorage.setItem('quizzes', JSON.stringify(quizzes));
}

export function addQuiz(name) {
  const quizzes = loadQuizzes();
  const newQuiz = {
    id: 'quiz-' + Date.now(),
    name,
    questions: []
  };
  console.log('Adding new quiz:', newQuiz);
  quizzes.push(newQuiz);
  saveQuizzes(quizzes);
  return newQuiz;
}

export function getQuizById(id) {
  const quizzes = loadQuizzes();
  return quizzes.find(q => q.id === id);
}

export function addQuestionToQuiz(quizId, question) {
  const quizzes = loadQuizzes();
  const quiz = quizzes.find(q => q.id === quizId);
  if (!quiz) return false;
  quiz.questions.push(question);
  saveQuizzes(quizzes);
  return true;
}

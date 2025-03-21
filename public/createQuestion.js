/**
 * @file cerateQuestion.js
 * @description Adds more fields for answers to a question on the press of a button.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date Februray 20, 2025
 */

/**
 * @description Adds more fields for answers to a question on the press of a button.
 */
document.addEventListener('DOMContentLoaded', () => {
  const addButton = document.getElementById('add-answer');
  const answersContainer = document.getElementById('answers-container');
  addButton.addEventListener('click', () => {
    const currentCount =
      answersContainer.querySelectorAll('.answer-block').length;
    const newCount = currentCount + 1;

    if (newCount <= 8) {
      const answerBlock = document.createElement('div');
      answerBlock.classList.add('answer-block');
      answerBlock.innerHTML = `
      <label for="ans${newCount}">${window.localization.newAnswerString} ${newCount}:</label>
      <input type="text" name="ans${newCount}" id="ans${newCount}" />
      <label for="correctAnswer">${window.localization.isAnswerCorrect}:</label>
      <input type="checkbox" name="correctAnswer" value="${newCount}" />
    `;

      answersContainer.appendChild(answerBlock);
      if (newCount >= 8) {
        addButton.disabled = true;
      }
    }
  });

  const categorySelect = document.getElementById('categorySelect');
  const newCategoryContainer = document.getElementById('newCategoryContainer');
  categorySelect.addEventListener('change', () => {
    if (categorySelect.value === 'new') {
      newCategoryContainer.style.display = 'block';
    } else {
      newCategoryContainer.style.display = 'none';
    }
  });
});

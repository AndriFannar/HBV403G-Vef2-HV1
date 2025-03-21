/**
 * @file event.js
 * @description Handles the event of submitting a question.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date January 20, 2025
 */

/**
 * @description Listens for the submit event on the document and prevents the default action.
 */
document.addEventListener('submit', event => {
  event.preventDefault();
  const form = event.target;
  const selectedInput = form.querySelector('input[type="radio"]:checked');

  const correctFeedback = form.querySelector('.correct.feedback');
  const incorrectFeedback = form.querySelector('.incorrect.feedback');

  if (selectedInput.dataset.info === 'true') {
    correctFeedback.classList.remove('hidden');
    incorrectFeedback.classList.add('hidden');
  } else {
    correctFeedback.classList.add('hidden');
    incorrectFeedback.classList.remove('hidden');
  }
});

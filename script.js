const API_URL = 'http://127.0.0.1:8000/predict';

const form = document.querySelector('#prediction-form');
const submitButton = document.querySelector('#submit-button');
const errorMessage = document.querySelector('#error-message');
const resultTitle = document.querySelector('#result-title');
const resultDescription = document.querySelector('#result-description');
const scoreDisplay = document.querySelector('#score-display');
const scoreValue = document.querySelector('#score-value');

function getPayload(formData) {
  return {
    age: Number(formData.get('age')),
    gender: formData.get('gender'),
    country: formData.get('country').trim(),
    academic_level: formData.get('academic_level'),
    most_used_platform: formData.get('most_used_platform'),
    purpose_of_use: formData.get('purpose_of_use'),
    avg_daily_usage_hours: Number(formData.get('avg_daily_usage_hours')),
    daily_unlocks: Number(formData.get('daily_unlocks')),
    study_hours: Number(formData.get('study_hours')),
    physical_activity_hours: Number(formData.get('physical_activity_hours')),
    sleep_hours_per_night: Number(formData.get('sleep_hours_per_night')),
    stress_level: formData.get('stress_level')
  };
}

function setLoading(isLoading) {
  submitButton.disabled = isLoading;
  submitButton.classList.toggle('is-loading', isLoading);
  submitButton.querySelector('.button-label').textContent = isLoading
    ? 'Calculating your estimate...'
    : 'Get my estimate';
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.hidden = false;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  errorMessage.hidden = true;
  scoreDisplay.hidden = true;
  setLoading(true);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(getPayload(new FormData(form)))
    });

    if (!response.ok) {
      if (response.status === 422) {
        throw new Error('Some values were not accepted. Check each field and try again.');
      }
      if (response.status === 405) {
        throw new Error('The API rejected this request method. Make sure the backend has a POST /predict endpoint.');
      }
      throw new Error(`The API returned an error (${response.status}). Please try again.`);
    }

    const result = await response.json();
    if (typeof result.predicted_mental_health_score !== 'number' ||
        !Number.isFinite(result.predicted_mental_health_score)) {
      throw new Error('The API response did not contain a valid prediction. Please try again.');
    }

    scoreValue.textContent = result.predicted_mental_health_score.toFixed(2);
    scoreDisplay.hidden = false;
    resultTitle.textContent = 'Your estimate is ready.';
    resultDescription.textContent = 'Here is the model’s predicted mental health score based on your answers.';
  } catch (error) {
    if (error instanceof TypeError) {
      showError('Could not reach the API. Start the backend and check that it is available at http://127.0.0.1:8000.');
    } else {
      showError(error.message);
    }
  } finally {
    setLoading(false);
  }
});

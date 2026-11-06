const API_URL = 'http://127.0.0.1:8000/predict';

const form = document.querySelector('#prediction-form');
const submitButton = document.querySelector('#submit-button');
const errorMessage = document.querySelector('#error-message');
const resultTitle = document.querySelector('#result-title');
const resultDescription = document.querySelector('#result-description');
const scoreDisplay = document.querySelector('#score-display');
const scoreValue = document.querySelector('#score-value');
const scoreGauge = document.querySelector('#score-gauge');
const scoreRing = document.querySelector('#score-ring');
const resultCard = document.querySelector('#result-card');
const scoreRingCircumference = 2 * Math.PI * 46;

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
  scoreRing.style.strokeDashoffset = String(scoreRingCircumference);
  resultCard.classList.remove('is-ready');
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
    if (result.predicted_mental_health_score < 0 || result.predicted_mental_health_score > 10) {
      throw new Error('The API returned a score outside the expected 0–10 scale. Please check the model output.');
    }

    const score = result.predicted_mental_health_score;
    const formattedScore = score.toFixed(2);
    scoreValue.textContent = formattedScore;
    scoreGauge.setAttribute('aria-valuenow', formattedScore);
    scoreGauge.setAttribute('aria-valuetext', `${formattedScore} out of 10`);
    scoreDisplay.hidden = false;
    resultCard.classList.add('is-ready');
    requestAnimationFrame(() => {
      scoreRing.style.strokeDashoffset = String(scoreRingCircumference * (1 - score / 10));
    });
    resultTitle.textContent = 'Your estimate is ready.';
    resultDescription.textContent = 'Your model-predicted score, shown out of 10. Use it as a reflection prompt, not a diagnosis.';
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

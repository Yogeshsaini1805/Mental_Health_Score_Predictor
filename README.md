# Mental Health Score Predictor

A web app that estimates a mental health score from student demographics and daily habits. The model's prediction is shown on a 0–10 scale; it is for reflection only and is not a diagnosis.

## Project files

- `main.py` — FastAPI app, static web page, and prediction endpoint.
- `index.html`, `style.css`, `script.js` — browser interface.
- `Mental_Health_Model.pkl` — trained scikit-learn model required by the API.
- `requirements.txt` — Python dependencies.
- `render.yaml` — Render Blueprint configuration.

## Run locally

Requires Python 3.11.

1. Create and activate a virtual environment:

   ```bash
   python -m venv .venv
   ```

   Windows PowerShell:

   ```powershell
   .\.venv\Scripts\Activate.ps1
   ```

   macOS or Linux:

   ```bash
   source .venv/bin/activate
   ```

2. Install dependencies and start the app:

   ```bash
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

3. Open [http://127.0.0.1:8000](http://127.0.0.1:8000). Interactive API documentation is at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

Keep `Mental_Health_Model.pkl` in the project root alongside `main.py`.

## Deploy to Render

1. Push the project to a GitHub repository. Include `Mental_Health_Model.pkl`; it is required to load the model at startup.
2. In Render, select **New → Blueprint** and connect the repository containing `render.yaml`.
3. Review and apply the Blueprint. Render installs the packages from `requirements.txt` and starts the FastAPI app using the configured command.
4. Open the Render URL after deployment. The `/healthz` endpoint is used for health checks.

## API

- `GET /` — serves the web app.
- `GET /healthz` — health check.
- `POST /predict` — returns `predicted_mental_health_score` for valid student data.
- `GET /docs` — interactive API documentation.

The prediction is an estimate based on the trained model and should not be used as a clinical assessment or a replacement for professional advice.

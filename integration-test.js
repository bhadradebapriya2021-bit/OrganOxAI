import assert from 'node:assert/strict';
import express from 'express';
import { createApiRouter } from './server/api.js';

const app = express();
app.use('/api', createApiRouter({ enableAi: false }));

const server = app.listen(0, '127.0.0.1');
await new Promise(resolve => server.once('listening', resolve));

try {
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  const healthResponse = await fetch(`${baseUrl}/api/health`);
  assert.equal(healthResponse.status, 200);
  assert.equal((await healthResponse.json()).status, 'ok');

  const predictionResponse = await fetch(`${baseUrl}/api/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      age: 36,
      gender: 'female',
      glucose: 94,
      bloodPressure: 118,
      bmi: 22.4,
      oxygenSaturation: 98,
      lengthOfStay: 0,
      cholesterol: 174,
      triglycerides: 98,
    }),
  });
  assert.equal(predictionResponse.status, 200);
  const prediction = await predictionResponse.json();
  assert.ok(prediction.scores.length > 0);
  assert.equal(prediction.model.type, 'Gaussian Naive Bayes');
  assert.equal(prediction.aiTranscriptStatus, 'disabled');

  const xgboostResponse = await fetch(`${baseUrl}/api/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'xgboost-healthcare-risk', age: 58, gender: 'male', glucose: 142,
      bloodPressure: 152, bmi: 31.7, oxygenSaturation: 96, lengthOfStay: 2,
      cholesterol: 246, triglycerides: 231,
    }),
  });
  assert.equal(xgboostResponse.status, 200);
  const xgboost = await xgboostResponse.json();
  assert.equal(xgboost.model.type, 'XGBoost decision-tree ensemble');
  assert.equal(xgboost.model.classCount, 7);
  assert.equal(xgboost.model.trainingPercent, 85);
  assert.equal(xgboost.model.testPercent, 15);
  assert.equal(xgboost.scores.reduce((sum, item) => sum + item.score, 0), 100);

  const invalidResponse = await fetch(`${baseUrl}/api/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ age: -1 }),
  });
  assert.equal(invalidResponse.status, 400);

  console.log('ML API integration checks passed.');
} finally {
  await new Promise((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve());
  });
}

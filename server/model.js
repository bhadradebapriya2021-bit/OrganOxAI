import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const trained = JSON.parse(
  fs.readFileSync(path.join(currentDirectory, 'model.json'), 'utf8'),
);

const limits = {
  age: [0, 120],
  glucose: [20, 700],
  bloodPressure: [50, 260],
  bmi: [10, 80],
  oxygenSaturation: [50, 100],
  lengthOfStay: [0, 365],
  cholesterol: [50, 600],
  triglycerides: [20, 1500],
};

export function predict(input) {
  const numericInput = {};

  for (const [key, [minimum, maximum]] of Object.entries(limits)) {
    const value = Number(input[key]);

    if (!Number.isFinite(value) || value < minimum || value > maximum) {
      throw new Error(`${key} must be between ${minimum} and ${maximum}.`);
    }

    numericInput[key] = value;
  }

  const gender = input.gender === 'male'
    ? 'male'
    : input.gender === 'female'
      ? 'female'
      : 'other';

  const rawScores = Object.entries(trained.classes).map(([name, condition]) => {
    let logScore = Math.log(condition.prior) + Math.log(condition.gender[gender]);

    for (const [feature, value] of Object.entries(numericInput)) {
      const { mean, variance } = condition.numeric[feature];
      logScore += -0.5 * Math.log(2 * Math.PI * variance)
        - ((value - mean) ** 2) / (2 * variance);
    }

    return { name, logScore };
  });

  const maximumLogScore = Math.max(...rawScores.map(item => item.logScore));
  const total = rawScores.reduce(
    (sum, item) => sum + Math.exp(item.logScore - maximumLogScore),
    0,
  );

  const scores = rawScores
    .map(item => ({
      name: item.name,
      score: Math.round((100 * Math.exp(item.logScore - maximumLogScore)) / total),
    }))
    .sort((first, second) => second.score - first.score);

  return {
    scores,
    model: {
      type: trained.modelType,
      trainingRows: trained.trainingRows,
      sourceDataset: trained.sourceDataset,
      classCount: Object.keys(trained.classes).length,
    },
    disclaimer: 'Educational demonstration only. Dataset-label confidence is not a diagnosis, medical probability, or clinical advice.',
  };
}

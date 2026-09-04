import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const trained = JSON.parse(fs.readFileSync(path.join(currentDirectory, 'xgboost-model.json'), 'utf8'));
const limits = { age: [0, 120], glucose: [20, 700], bloodPressure: [50, 260], bmi: [10, 80], oxygenSaturation: [50, 100], lengthOfStay: [0, 365], cholesterol: [50, 600], triglycerides: [20, 1500] };

function encode(input) {
  const features = Object.fromEntries(trained.featureColumns.map(name => [name, 0]));
  for (const [name, [minimum, maximum]] of Object.entries(limits)) {
    const value = Number(input[name]);
    if (!Number.isFinite(value) || value < minimum || value > maximum) throw new Error(`${name} must be between ${minimum} and ${maximum}.`);
    features[name] = value;
  }
  const gender = input.gender === 'male' ? 'male' : input.gender === 'female' ? 'female' : 'other';
  if (`gender_${gender}` in features) features[`gender_${gender}`] = 1;
  return features;
}

function treeValue(node, features) {
  if (typeof node.leaf === 'number') return node.leaf;
  const value = features[node.split];
  const childId = Number.isFinite(value) ? (value < node.split_condition ? node.yes : node.no) : node.missing;
  const child = node.children.find(item => item.nodeid === childId);
  if (!child) throw new Error('Invalid XGBoost tree structure.');
  return treeValue(child, features);
}

export function predictXgboost(input) {
  const features = encode(input);
  const margins = Array(trained.classCount).fill(0);
  trained.trees.forEach((tree, index) => { margins[index % trained.classCount] += treeValue(tree, features); });
  const maximum = Math.max(...margins);
  const exponents = margins.map(value => Math.exp(value - maximum));
  const total = exponents.reduce((sum, value) => sum + value, 0);
  const scores = trained.classes.map((name, index) => ({ name, score: Math.round((100 * exponents[index]) / total) })).sort((first, second) => second.score - first.score);
  scores[0].score += 100 - scores.reduce((sum, item) => sum + item.score, 0);
  return {
    scores,
    model: { type: trained.modelType, trainingRows: trained.trainingRows, testRows: trained.testRows, sourceDataset: trained.sourceDataset, classCount: trained.classCount, trainingPercent: trained.trainingPercent, testPercent: trained.testPercent, metrics: trained.metrics },
    disclaimer: 'Educational demonstration only. Dataset-label confidence is not a diagnosis, calibrated medical probability, or clinical advice.',
  };
}

export const xgboostMetadata = { type: trained.modelType, trainingRows: trained.trainingRows, testRows: trained.testRows, metrics: trained.metrics };

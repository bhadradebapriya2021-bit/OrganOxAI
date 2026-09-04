import express from 'express';
import { predict } from './model.js';
import { predictXgboost, xgboostMetadata } from './xgboost-model.js';

const TRANSCRIPT_WORD_LIMIT = 80;

function capWords(text, limit = TRANSCRIPT_WORD_LIMIT) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return `${words.slice(0, limit).join(' ')}${words.length > limit ? '…' : ''}`;
}

function extractOutputText(response) {
  if (typeof response.output_text === 'string') return response.output_text;

  return (response.output || [])
    .flatMap(item => item.content || [])
    .filter(item => item.type === 'output_text' && typeof item.text === 'string')
    .map(item => item.text)
    .join('\n');
}

async function createAiTranscript(scores, enabled) {
  if (!enabled) {
    return {
      aiTranscript: 'AI interpretation is disabled for this test run.',
      aiTranscriptStatus: 'disabled',
    };
  }

  if (!process.env.OPENAI_API_KEY) {
    return {
      aiTranscript: 'Add OPENAI_API_KEY to the server .env file to enable the 80-word AI interpretation.',
      aiTranscriptStatus: 'not_configured',
    };
  }

  const scoreSummary = scores.map(item => `${item.name}: ${item.score}%`).join(', ');

  try {
    const apiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-5.6-luna',
        store: false,
        max_output_tokens: 180,
        text: { verbosity: 'low' },
        instructions: 'Write one plain-language paragraph of no more than 80 words. Summarize the highest classifier labels first, mention meaningful competing labels, and explain that scores are dataset-label confidence rather than diagnostic probabilities. Do not diagnose, prescribe treatment, or claim clinical validation. Recommend professional evaluation only when the pattern warrants it.',
        input: `Classifier scores: ${scoreSummary}`,
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!apiResponse.ok) throw new Error(`OpenAI returned ${apiResponse.status}.`);

    const transcript = capWords(extractOutputText(await apiResponse.json()));
    if (!transcript) throw new Error('OpenAI returned no text.');

    return { aiTranscript: transcript, aiTranscriptStatus: 'generated' };
  } catch (error) {
    console.error('OpenAI transcript unavailable:', error instanceof Error ? error.message : error);
    return {
      aiTranscript: 'AI interpretation is temporarily unavailable. The model scores above were still calculated successfully.',
      aiTranscriptStatus: 'unavailable',
    };
  }
}

export function createApiRouter({ enableAi = true } = {}) {
  const router = express.Router();

  router.use(express.json({ limit: '100kb' }));

  router.get('/health', (_request, response) => {
    response.set('Cache-Control', 'no-store').json({
      status: 'ok',
      model: 'gaussian-naive-bayes',
      models: ['gaussian-naive-bayes', 'xgboost-healthcare-risk'],
      xgboost: xgboostMetadata,
      dashboard: '/model-testing',
      aiTranscript: enableAi && Boolean(process.env.OPENAI_API_KEY),
    });
  });

  router.post('/predict', async (request, response) => {
    try {
      const prediction = request.body.model === 'xgboost-healthcare-risk'
        ? predictXgboost(request.body)
        : predict(request.body);
      const transcript = await createAiTranscript(prediction.scores, enableAi);
      response.set('Cache-Control', 'no-store').json({ ...prediction, ...transcript });
    } catch (error) {
      response.status(400).json({
        error: error instanceof Error ? error.message : 'Unable to calculate scores.',
      });
    }
  });

  router.use((error, _request, response, _next) => {
    const status = error?.type === 'entity.too.large' ? 413 : 400;
    response.status(status).json({
      error: status === 413 ? 'Request body is too large.' : 'Request body must be valid JSON.',
    });
  });

  return router;
}

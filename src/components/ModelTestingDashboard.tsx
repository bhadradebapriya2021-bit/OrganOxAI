import React, { useEffect, useState } from 'react';
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  FlaskConical,
  RefreshCw,
  Server,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

type Gender = 'female' | 'male' | 'other';

interface ModelInput {
  age: number;
  gender: Gender;
  glucose: number;
  bloodPressure: number;
  bmi: number;
  oxygenSaturation: number;
  lengthOfStay: number;
  cholesterol: number;
  triglycerides: number;
}

interface PredictionResponse {
  scores: Array<{ name: string; score: number }>;
  model: {
    type: string;
    trainingRows: number;
    sourceDataset: string;
    classCount: number;
    testRows?: number;
    trainingPercent?: number;
    testPercent?: number;
    metrics?: { accuracy: number; macroF1: number; weightedF1: number };
  };
  disclaimer: string;
  aiTranscript: string;
  aiTranscriptStatus: 'generated' | 'not_configured' | 'unavailable' | 'disabled';
}

const SAMPLE_PROFILES: Array<{ name: string; description: string; values: ModelInput }> = [
  {
    name: 'Baseline',
    description: 'Lower-risk synthetic profile',
    values: { age: 36, gender: 'female', glucose: 94, bloodPressure: 118, bmi: 22.4, oxygenSaturation: 98, lengthOfStay: 0, cholesterol: 174, triglycerides: 98 },
  },
  {
    name: 'Metabolic',
    description: 'Elevated metabolic markers',
    values: { age: 58, gender: 'male', glucose: 142, bloodPressure: 152, bmi: 31.7, oxygenSaturation: 96, lengthOfStay: 2, cholesterol: 246, triglycerides: 231 },
  },
  {
    name: 'Stress test',
    description: 'High-range synthetic inputs',
    values: { age: 72, gender: 'male', glucose: 238, bloodPressure: 186, bmi: 34.8, oxygenSaturation: 89, lengthOfStay: 6, cholesterol: 285, triglycerides: 360 },
  },
];

const FIELD_CONFIG: Array<{
  key: Exclude<keyof ModelInput, 'gender'>;
  label: string;
  unit: string;
  minimum: number;
  maximum: number;
  step?: number;
}> = [
  { key: 'age', label: 'Age', unit: 'years', minimum: 0, maximum: 120 },
  { key: 'glucose', label: 'Glucose', unit: 'mg/dL', minimum: 20, maximum: 700 },
  { key: 'bloodPressure', label: 'Systolic blood pressure', unit: 'mmHg', minimum: 50, maximum: 260 },
  { key: 'bmi', label: 'Body mass index', unit: 'kg/m²', minimum: 10, maximum: 80, step: 0.1 },
  { key: 'oxygenSaturation', label: 'Oxygen saturation', unit: '%', minimum: 50, maximum: 100 },
  { key: 'lengthOfStay', label: 'Length of stay', unit: 'days', minimum: 0, maximum: 365 },
  { key: 'cholesterol', label: 'Total cholesterol', unit: 'mg/dL', minimum: 50, maximum: 600 },
  { key: 'triglycerides', label: 'Triglycerides', unit: 'mg/dL', minimum: 20, maximum: 1500 },
];

export const ModelTestingDashboard: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [form, setForm] = useState<ModelInput>(SAMPLE_PROFILES[0].values);
  const [algorithm, setAlgorithm] = useState<'gnb' | 'xgboost'>('gnb');
  const [connection, setConnection] = useState<'checking' | 'online' | 'offline'>('checking');
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const checkConnection = async () => {
    setConnection('checking');
    try {
      const response = await fetch('/api/health', { cache: 'no-store' });
      if (!response.ok) throw new Error();
      setConnection('online');
    } catch {
      setConnection('offline');
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(algorithm === 'xgboost'
          ? { model: 'xgboost-healthcare-risk', ...form }
          : { model: 'gaussian-naive-bayes', ...form }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Prediction request failed.');
      setResult(payload);
      setConnection('online');
    } catch (requestError) {
      setResult(null);
      setError(requestError instanceof Error ? requestError.message : 'Prediction request failed.');
      setConnection('offline');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EDEFEE] text-[#41403C] font-['Roboto',sans-serif]">
      <header className="bg-[#41403C] text-white border-b-4 border-[#D08856]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <button type="button" onClick={onExit} className="w-10 h-10 rounded-xl border border-white/20 hover:bg-white/10 flex items-center justify-center cursor-pointer" aria-label="Back to clinical portal">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-[#E8B995] text-[11px] font-bold uppercase tracking-[0.18em]">
                <FlaskConical className="w-4 h-4" /> Independent validation workspace
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mt-1">ML Model Testing Dashboard</h1>
              <p className="text-white/65 text-sm mt-1">Compare local Gaussian Naive Bayes and XGBoost inference.</p>
            </div>
          </div>
          <button type="button" onClick={checkConnection} className="self-start sm:self-auto flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold cursor-pointer hover:bg-white/10">
            <span className={`w-2 h-2 rounded-full ${connection === 'online' ? 'bg-emerald-400' : connection === 'offline' ? 'bg-red-400' : 'bg-amber-300 animate-pulse'}`} />
            {connection === 'online' ? 'API connected' : connection === 'offline' ? 'API unavailable' : 'Checking API'}
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 py-7">
        <div className="bg-[#FAF2EB] border border-[#EACAB2] rounded-2xl px-4 py-3 flex gap-3 items-start mb-6">
          <ShieldAlert className="w-5 h-5 text-[#A65B27] shrink-0 mt-0.5" />
          <p className="text-[13px] leading-relaxed text-[#6F4A31]"><strong>Testing environment only.</strong> Inputs should be synthetic or de-identified. Scores measure similarity to dataset labels and are not diagnostic probabilities.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.82fr)] gap-6 items-start">
          <form onSubmit={submit} className="bg-white border border-[#D4D8D5] rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 py-5 border-b border-[#D4D8D5] flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">Inference inputs</h2>
                <p className="text-sm text-[#6F6D68] mt-1">Load a synthetic case or set every feature manually.</p>
              </div>
              <Server className="w-5 h-5 text-[#D08856]" />
            </div>

            <div className="p-5 sm:p-6">
              <label className="block text-[12px] font-bold text-[#6F6D68] uppercase tracking-wide mb-6">
                Algorithm
                <select value={algorithm} onChange={event => { setAlgorithm(event.target.value as 'gnb' | 'xgboost'); setResult(null); setError(null); }} className="mt-1.5 w-full bg-[#F7F8F7] border border-[#D4D8D5] rounded-xl px-3.5 py-2.5 text-sm text-[#41403C]">
                  <option value="gnb">Gaussian Naive Bayes — multi-condition</option>
                  <option value="xgboost">XGBoost — multi-condition ensemble</option>
                </select>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                {SAMPLE_PROFILES.map(profile => (
                  <button key={profile.name} type="button" onClick={() => { setForm(profile.values); setResult(null); setError(null); }} className="text-left border border-[#D4D8D5] rounded-xl p-3 hover:border-[#D08856] hover:bg-[#FAF2EB] transition-colors cursor-pointer">
                    <span className="block text-[13px] font-bold">{profile.name}</span>
                    <span className="block text-[11px] text-[#6F6D68] mt-0.5">{profile.description}</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="text-[12px] font-bold text-[#6F6D68] uppercase tracking-wide">
                  Gender
                  <select value={form.gender} onChange={event => setForm(current => ({ ...current, gender: event.target.value as Gender }))} className="mt-1.5 w-full bg-[#F7F8F7] border border-[#D4D8D5] rounded-xl px-3.5 py-2.5 text-sm text-[#41403C] focus:outline-none focus:ring-2 focus:ring-[#D08856]/40">
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other / unspecified</option>
                  </select>
                </label>

                {FIELD_CONFIG.map(field => (
                  <label key={field.key} className="text-[12px] font-bold text-[#6F6D68] uppercase tracking-wide">
                    {field.label} <span className="normal-case font-normal">({field.unit})</span>
                    <input type="number" required min={field.minimum} max={field.maximum} step={field.step || 1} value={form[field.key]} onChange={event => setForm(current => ({ ...current, [field.key]: Number(event.target.value) }))} className="mt-1.5 w-full bg-[#F7F8F7] border border-[#D4D8D5] rounded-xl px-3.5 py-2.5 text-sm text-[#41403C] focus:outline-none focus:ring-2 focus:ring-[#D08856]/40" />
                  </label>
                ))}
              </div>

              <button type="submit" disabled={submitting || connection === 'offline'} className="mt-6 w-full rounded-xl bg-[#41403C] hover:bg-[#2F2E2B] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 px-4 font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors">
                {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4 text-[#E8B995]" />}
                {submitting ? 'Running inference…' : 'Run model inference'}
              </button>
            </div>
          </form>

          <section className="bg-white border border-[#D4D8D5] rounded-2xl shadow-sm overflow-hidden lg:sticky lg:top-6" aria-live="polite">
            <div className="px-5 sm:px-6 py-5 border-b border-[#D4D8D5]">
              <h2 className="text-lg font-bold">Prediction output</h2>
              <p className="text-sm text-[#6F6D68] mt-1">Ranked normalized class scores from the backend.</p>
            </div>

            <div className="p-5 sm:p-6">
              {error && <div className="rounded-xl bg-[#FDF1EF] border border-[#F5C2BA] text-[#AA210F] p-4 text-sm">{error}</div>}

              {!result && !error && (
                <div className="min-h-64 flex flex-col items-center justify-center text-center px-6">
                  <div className="w-14 h-14 rounded-2xl bg-[#EDEFEE] flex items-center justify-center mb-4"><FlaskConical className="w-6 h-6 text-[#6F6D68]" /></div>
                  <h3 className="font-bold">Ready for a test run</h3>
                  <p className="text-sm text-[#6F6D68] mt-1 max-w-xs">Submit the synthetic input vector to see model classes and response metadata.</p>
                </div>
              )}

              {result && (
                <div>
                  <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold mb-5">
                    <CheckCircle2 className="w-4 h-4" /> Inference completed successfully
                  </div>

                  <div className="space-y-4">
                    {result.scores.map((item, index) => (
                      <div key={item.name}>
                        <div className="flex justify-between gap-4 text-sm mb-1.5">
                          <span className={index === 0 ? 'font-bold' : 'font-medium'}>{item.name}</span>
                          <span className="font-mono font-bold">{item.score}%</span>
                        </div>
                        <div className="h-2.5 bg-[#EDEFEE] rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${index === 0 ? 'bg-[#D08856]' : 'bg-[#8D918E]'}`} style={{ width: `${item.score}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {result.model.metrics && <div className="mt-4 rounded-xl bg-[#F7F8F7] border border-[#D4D8D5] p-4">
                    <div className="text-xs font-bold mb-2">Held-out evaluation ({result.model.trainingPercent}% train / {result.model.testPercent}% test)</div>
                    <div className="text-xs">
                      <span>Accuracy <strong>{(result.model.metrics.accuracy * 100).toFixed(1)}%</strong></span>
                    </div>
                  </div>}

                  <div className="mt-5 rounded-2xl border border-[#EACAB2] bg-[#FAF2EB] overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#EACAB2] flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-[#8A4A1C]">
                        <Sparkles className="w-4 h-4" />
                        <h3 className="text-sm font-bold">AI transcript</h3>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider font-mono text-[#A65B27]">80 words max</span>
                    </div>
                    <p className="px-4 py-4 text-[13px] leading-relaxed text-[#6F4A31]">{result.aiTranscript}</p>
                    <div className="px-4 pb-3 text-[10px] text-[#8A6A53]">
                      {result.aiTranscriptStatus === 'generated'
                        ? 'Generated by OpenAI from label scores only.'
                        : 'OpenAI generation is not currently active.'}
                    </div>
                  </div>

                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

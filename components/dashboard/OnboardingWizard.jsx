import { useState, useEffect } from 'react';

const WIZARD_DONE_KEY = 'cloudach_wizard_done';

const USE_CASES = [
  { id: 'chatbot', label: 'Chatbot / Assistant' },
  { id: 'content', label: 'Content Generation' },
  { id: 'code', label: 'Code Assistant' },
  { id: 'research', label: 'Research & Analysis' },
  { id: 'data', label: 'Data Processing' },
  { id: 'other', label: 'Something else' },
];

const FALLBACK_MODELS = [
  { model_id: 'llama3-8b', display_name: 'Llama 3 8B', description: 'Fast and efficient for most tasks', tags: ['fast', 'versatile'] },
  { model_id: 'llama3-70b', display_name: 'Llama 3 70B', description: 'High quality output for complex tasks', tags: ['powerful', 'reasoning'] },
  { model_id: 'mistral-7b', display_name: 'Mistral 7B', description: 'Multilingual with strong instruction-following', tags: ['multilingual', 'fast'] },
  { model_id: 'codellama-13b', display_name: 'Code Llama 13B', description: 'Optimised for code generation and review', tags: ['code', 'fast'] },
];

export default function OnboardingWizard() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(1);
  const [useCase, setUseCase] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [models, setModels] = useState(FALLBACK_MODELS);
  const [keyName, setKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(WIZARD_DONE_KEY) === '1') return;
    } catch (_) {}
    setVisible(true);
    fetch('/api/dashboard/models')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.models?.length) setModels(data.models); })
      .catch(() => {});
  }, []);

  async function createKey() {
    if (!keyName.trim()) return;
    setCreating(true);
    setCreateError('');
    try {
      const res = await fetch('/api/dashboard/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: keyName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || 'Failed to create API key.');
        setCreating(false);
        return;
      }
      setCreatedKey(data.rawKey);
      try { localStorage.setItem(WIZARD_DONE_KEY, '1'); } catch (_) {}
      setStep('done');
    } catch {
      setCreateError('Network error. Please try again.');
    }
    setCreating(false);
  }

  async function copyKey() {
    try {
      await navigator.clipboard.writeText(createdKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  }

  if (!visible) return null;

  const stepNum = step === 'done' ? 3 : step;

  return (
    <div className="ob-overlay" role="dialog" aria-modal="true" aria-label="Welcome to Cloudach">
      <div className="ob-modal">

        {/* Skip button */}
        {step !== 'done' && (
          <button className="ob-skip" onClick={() => setVisible(false)}>
            Skip for now
          </button>
        )}

        {/* Progress dots */}
        <div className="ob-progress" aria-label={`Step ${stepNum} of 3`}>
          {[1, 2, 3].map(n => (
            <div
              key={n}
              className={`ob-progress-dot${
                n === stepNum ? ' ob-progress-dot--active' :
                n < stepNum || step === 'done' ? ' ob-progress-dot--done' : ''
              }`}
            />
          ))}
        </div>

        {/* Step 1 — Use case */}
        {step === 1 && (
          <>
            <h2 className="ob-title">What will you build?</h2>
            <p className="ob-subtitle">We'll help you get started with the right setup.</p>
            <div className="ob-use-case-grid">
              {USE_CASES.map(uc => (
                <button
                  key={uc.id}
                  className={`ob-use-case-card${useCase === uc.id ? ' ob-use-case-card--selected' : ''}`}
                  onClick={() => setUseCase(uc.id)}
                >
                  {uc.label}
                </button>
              ))}
            </div>
            <button
              className="ob-btn ob-btn--primary"
              disabled={!useCase}
              onClick={() => setStep(2)}
            >
              Continue
            </button>
          </>
        )}

        {/* Step 2 — Model selection */}
        {step === 2 && (
          <>
            <h2 className="ob-title">Select a model</h2>
            <p className="ob-subtitle">Choose the model that will power your application.</p>
            <div className="ob-model-list">
              {models.slice(0, 4).map(m => (
                <button
                  key={m.model_id}
                  className={`ob-model-card${selectedModel === m.model_id ? ' ob-model-card--selected' : ''}`}
                  onClick={() => setSelectedModel(m.model_id)}
                >
                  <span className="ob-model-name">{m.display_name}</span>
                  <span className="ob-model-desc">{m.description}</span>
                  {m.tags?.length > 0 && (
                    <span className="ob-model-tags">
                      {m.tags.slice(0, 2).map(t => (
                        <span key={t} className="ob-model-tag">{t}</span>
                      ))}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="ob-btn-row">
              <button className="ob-btn ob-btn--ghost" onClick={() => setStep(1)}>Back</button>
              <button
                className="ob-btn ob-btn--primary"
                disabled={!selectedModel}
                onClick={() => setStep(3)}
              >
                Continue
              </button>
            </div>
          </>
        )}

        {/* Step 3 — Create API key */}
        {step === 3 && (
          <>
            <h2 className="ob-title">Create your first API key</h2>
            <p className="ob-subtitle">This key authenticates your requests to the Cloudach API.</p>
            <div className="ob-field">
              <label className="ob-label" htmlFor="ob-key-name">Key name</label>
              <input
                id="ob-key-name"
                type="text"
                className="ob-input"
                placeholder="e.g. Development key"
                value={keyName}
                onChange={e => setKeyName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') createKey(); }}
                autoFocus
                maxLength={80}
              />
            </div>
            {createError && <div className="ob-error">{createError}</div>}
            <div className="ob-btn-row">
              <button className="ob-btn ob-btn--ghost" onClick={() => setStep(2)}>Back</button>
              <button
                className="ob-btn ob-btn--primary"
                disabled={!keyName.trim() || creating}
                onClick={createKey}
              >
                {creating ? 'Creating…' : 'Create key'}
              </button>
            </div>
          </>
        )}

        {/* Done state */}
        {step === 'done' && (
          <>
            <div className="ob-success-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="22" stroke="#10B981" strokeWidth="2.5" />
                <path d="M14 24l7 7 13-13" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="ob-title">You're all set!</h2>
            <p className="ob-subtitle">Your API key has been created. Copy it now — it won't be shown again.</p>
            <div className="ob-key-display">
              <code className="ob-key-value">{createdKey}</code>
              <button className="ob-copy-btn" onClick={copyKey}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <button
              className="ob-btn ob-btn--primary"
              style={{ marginTop: 24 }}
              onClick={() => setVisible(false)}
            >
              Go to dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}

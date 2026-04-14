import { useState, useEffect } from 'react';
import Link from 'next/link';

const DISMISS_KEY = 'cloudach_onboarding_dismissed';

const STEPS = [
  {
    id: 'api-key',
    title: 'Create an API key',
    description: 'API keys authenticate your requests to the Cloudach API.',
    ctaLabel: 'Go to API Keys',
    ctaHref: '/dashboard/api-keys',
    isComplete: (stats) => (stats?.apiKeyCount ?? 0) > 0,
  },
  {
    id: 'deploy-model',
    title: 'Deploy a model',
    description: 'Choose from open-source LLMs and deploy a private endpoint.',
    ctaLabel: 'Browse models',
    ctaHref: '/dashboard/models',
    isComplete: (stats) => (stats?.activeDeployments ?? 0) > 0,
  },
  {
    id: 'first-request',
    title: 'Make your first request',
    description: 'Call the API with your key. Use the OpenAI-compatible format:',
    ctaLabel: 'View docs',
    ctaHref: '/docs',
    codeSnippet: `curl https://api.cloudach.com/v1/chat/completions \\
  -H "Authorization: Bearer <your-api-key>" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"llama3-8b","messages":[{"role":"user","content":"Hello!"}]}'`,
    isComplete: (stats) => (stats?.totalRequests ?? 0) > 0,
  },
];

export default function OnboardingChecklist({ stats }) {
  const [dismissed, setDismissed] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      if (localStorage.getItem(DISMISS_KEY) === '1') {
        setDismissed(true);
        return;
      }
    } catch (_) {}
    // Auto-expand the first incomplete step
    const firstIncomplete = STEPS.find((s) => !s.isComplete(stats));
    if (firstIncomplete) setExpandedId(firstIncomplete.id);
  }, [stats]);

  if (!mounted || dismissed) return null;

  const completedCount = STEPS.filter((s) => s.isComplete(stats)).length;
  const allDone = completedCount === STEPS.length;

  function handleDismiss() {
    try { localStorage.setItem(DISMISS_KEY, '1'); } catch (_) {}
    setDismissed(true);
  }

  function toggleExpand(id) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  if (allDone) {
    return (
      <div className="db-onboarding-success">
        <IconCheckCircle />
        <span>You&rsquo;re all set! Your first model is deployed and ready to use.</span>
        <button
          onClick={handleDismiss}
          style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#065F46', fontSize: 13 }}
        >
          Dismiss
        </button>
      </div>
    );
  }

  const pct = Math.round((completedCount / STEPS.length) * 100);

  return (
    <div className="db-onboarding-card">
      <div className="db-onboarding-progress-track">
        <div className="db-onboarding-progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="db-onboarding-header">
        <span className="db-onboarding-title">Get started with Cloudach</span>
        <span className="db-onboarding-count">{completedCount} of {STEPS.length} done</span>
      </div>
      {STEPS.map((step) => {
        const done = step.isComplete(stats);
        const expanded = expandedId === step.id;
        const isActive = !done && STEPS.find((s) => !s.isComplete(stats))?.id === step.id;
        return (
          <div key={step.id} className="db-onboarding-step">
            <div
              className="db-onboarding-step-row"
              onClick={() => !done && toggleExpand(step.id)}
              role={done ? undefined : 'button'}
              tabIndex={done ? -1 : 0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleExpand(step.id); }}
            >
              <div
                className={`db-onboarding-check${done ? ' db-onboarding-check--done' : isActive ? ' db-onboarding-check--active' : ''}`}
              >
                {done && <IconCheck />}
              </div>
              <span className={`db-onboarding-step-label${done ? ' db-onboarding-step-label--done' : ''}`}>
                {step.title}
              </span>
              {done ? (
                <Link
                  href={step.ctaHref}
                  style={{ fontSize: 12, color: '#6B7280', flexShrink: 0 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {step.ctaLabel} →
                </Link>
              ) : (
                <span className={`db-onboarding-chevron${expanded ? ' db-onboarding-chevron--open' : ''}`}>
                  <IconChevron />
                </span>
              )}
            </div>
            {!done && (
              <div className={`db-onboarding-step-body${expanded ? ' db-onboarding-step-body--expanded' : ''}`}>
                <p className="db-onboarding-step-desc">{step.description}</p>
                {step.codeSnippet && (
                  <pre className="db-onboarding-code">{step.codeSnippet}</pre>
                )}
                <Link href={step.ctaHref}>
                  <button className="db-btn db-btn--primary db-btn--sm">{step.ctaLabel} →</button>
                </Link>
              </div>
            )}
          </div>
        );
      })}
      <button className="db-onboarding-dismiss" onClick={handleDismiss}>
        Dismiss checklist
      </button>
    </div>
  );
}

function IconCheck() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCheckCircle() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" stroke="#10B981" strokeWidth="2" />
      <path d="M6 10l3 3 5-5" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

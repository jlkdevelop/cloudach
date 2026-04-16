import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import DashboardLayout, { PageLoader, ErrorBanner } from '../../components/dashboard/DashboardLayout';

const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 1024;
const DEFAULT_TOP_P = 1;

export default function PlaygroundPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Models
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');

  // Parameters
  const [systemPrompt, setSystemPrompt] = useState('');
  const [temperature, setTemperature] = useState(DEFAULT_TEMPERATURE);
  const [maxTokens, setMaxTokens] = useState(DEFAULT_MAX_TOKENS);
  const [topP, setTopP] = useState(DEFAULT_TOP_P);
  const [stopSequences, setStopSequences] = useState('');

  // Conversation
  const [messages, setMessages] = useState([]); // { role: 'user'|'assistant', content: string }
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [lastUsage, setLastUsage] = useState(null); // { prompt_tokens, completion_tokens, total_tokens }
  const [streamError, setStreamError] = useState('');

  // Copy-as-code
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyLang, setCopyLang] = useState('curl');
  const [copied, setCopied] = useState(false);

  // Sidebar collapse (mobile)
  const [paramsOpen, setParamsOpen] = useState(false);

  const abortRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    async function init() {
      try {
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) { router.replace('/login'); return; }
        setUser((await meRes.json()).user);

        const modelsRes = await fetch('/api/dashboard/models');
        if (modelsRes.ok) {
          const { models: catalog } = await modelsRes.json();
          setModels(catalog);
          const active = catalog.find(m => m.deploy_status === 'active');
          if (active) setSelectedModel(active.model_id);
          else if (catalog.length) setSelectedModel(catalog[0].model_id);
        } else {
          setError('Failed to load model catalog.');
        }
      } catch {
        setError('Network error. Please refresh.');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const sendMessage = useCallback(async () => {
    const content = input.trim();
    if (!content || streaming) return;
    if (!selectedModel) { setStreamError('Please select a model.'); return; }

    setStreamError('');
    setLastUsage(null);
    const newMessages = [...messages, { role: 'user', content }];
    setMessages(newMessages);
    setInput('');
    setStreaming(true);
    setStreamingContent('');

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/dashboard/playground', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          messages: newMessages,
          systemPrompt,
          temperature,
          maxTokens,
          topP,
          stopSequences: stopSequences.split(',').map(s => s.trim()).filter(Boolean),
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setStreamError(data.error || 'Request failed. Please try again.');
        setMessages(msgs => msgs.slice(0, -1));
        setStreaming(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assembled = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const data = trimmed.slice(5).trim();
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);

            if (parsed.error) {
              setStreamError(parsed.error);
              break;
            }

            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assembled += delta;
              setStreamingContent(assembled);
            }

            if (parsed.usage) {
              setLastUsage({
                promptTokens: parsed.usage.prompt_tokens,
                completionTokens: parsed.usage.completion_tokens,
                totalTokens: parsed.usage.total_tokens,
              });
            }
          } catch {
            // skip malformed
          }
        }
      }

      if (assembled) {
        setMessages(msgs => [...msgs, { role: 'assistant', content: assembled }]);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setStreamError('Connection lost. Please try again.');
        setMessages(msgs => msgs.slice(0, -1));
      }
    } finally {
      setStreaming(false);
      setStreamingContent('');
      abortRef.current = null;
      inputRef.current?.focus();
    }
  }, [input, streaming, selectedModel, messages, systemPrompt, temperature, maxTokens, topP, stopSequences]);

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function stopStream() {
    abortRef.current?.abort();
  }

  function clearConversation() {
    if (streaming) stopStream();
    setMessages([]);
    setStreamingContent('');
    setStreamError('');
    setLastUsage(null);
  }

  function buildCodeSnippet(lang) {
    const stopArr = stopSequences.split(',').map(s => s.trim()).filter(Boolean);
    const chatMessages = [];
    if (systemPrompt.trim()) chatMessages.push({ role: 'system', content: systemPrompt.trim() });
    const allMsgs = [...messages];
    // Add a placeholder user message if conversation is empty
    if (!allMsgs.length) allMsgs.push({ role: 'user', content: 'Hello!' });
    chatMessages.push(...allMsgs);

    const body = {
      model: selectedModel,
      messages: chatMessages,
      temperature,
      max_tokens: maxTokens,
      top_p: topP,
      stream: true,
      ...(stopArr.length ? { stop: stopArr } : {}),
    };

    if (lang === 'curl') {
      return `curl https://api.cloudach.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $CLOUDACH_API_KEY" \\
  -d '${JSON.stringify(body, null, 2)}'`;
    }

    if (lang === 'python') {
      const msgs = chatMessages.map(m => `    {"role": "${m.role}", "content": ${JSON.stringify(m.content)}}`).join(',\n');
      const stop = stopArr.length ? `,\n    stop=${JSON.stringify(stopArr)}` : '';
      return `import openai

client = openai.OpenAI(
    api_key="YOUR_CLOUDACH_API_KEY",
    base_url="https://api.cloudach.com/v1",
)

stream = client.chat.completions.create(
    model="${selectedModel}",
    messages=[
${msgs}
    ],
    temperature=${temperature},
    max_tokens=${maxTokens},
    top_p=${topP},
    stream=True${stop}
)

for chunk in stream:
    delta = chunk.choices[0].delta.content or ""
    print(delta, end="", flush=True)`;
    }

    if (lang === 'node') {
      const msgs = JSON.stringify(chatMessages, null, 6).replace(/^/gm, '  ');
      const stop = stopArr.length ? `\n    stop: ${JSON.stringify(stopArr)},` : '';
      return `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.CLOUDACH_API_KEY,
  baseURL: "https://api.cloudach.com/v1",
});

const stream = await client.chat.completions.create({
  model: "${selectedModel}",
  messages: ${msgs.trim()},
  temperature: ${temperature},
  max_tokens: ${maxTokens},
  top_p: ${topP},
  stream: true,${stop}
});

for await (const chunk of stream) {
  const delta = chunk.choices[0]?.delta?.content ?? "";
  process.stdout.write(delta);
}`;
    }

    return '';
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(buildCodeSnippet(copyLang));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  const allDisplayMessages = [
    ...messages,
    ...(streaming && streamingContent ? [{ role: 'assistant', content: streamingContent, isStreaming: true }] : []),
  ];

  if (loading || !user) return <PageLoader />;

  return (
    <>
      <Head><title>Playground — Cloudach</title></Head>
      <DashboardLayout user={user}>
        <div className="db-page-header" style={{ marginBottom: 16 }}>
          <h1 className="db-page-title">Playground</h1>
          <p className="db-page-subtitle">Test models interactively in your browser</p>
        </div>

        {error && <ErrorBanner message={error} />}

        <div style={styles.shell}>
          {/* ── Parameters Panel ─────────────────────────── */}
          <aside style={styles.panel}>
            {/* Mobile toggle */}
            <button
              style={styles.panelToggle}
              onClick={() => setParamsOpen(o => !o)}
              aria-expanded={paramsOpen}
            >
              <span style={{ fontWeight: 600, fontSize: 13 }}>Parameters</span>
              <svg
                width="14" height="14" viewBox="0 0 14 14" fill="none"
                style={{ transform: paramsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
              >
                <path d="M2 5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div style={{ ...styles.panelBody, display: paramsOpen || typeof window === 'undefined' ? 'block' : undefined }}>
              {/* Model selector */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Model</label>
                <select
                  style={styles.select}
                  value={selectedModel}
                  onChange={e => setSelectedModel(e.target.value)}
                  disabled={streaming}
                >
                  {models.length === 0 && <option value="">No models available</option>}
                  {models.map(m => (
                    <option key={m.model_id} value={m.model_id}>
                      {m.display_name}
                      {m.deploy_status === 'active' ? ' ✓' : ''}
                    </option>
                  ))}
                </select>
                {selectedModel && models.find(m => m.model_id === selectedModel)?.deploy_status !== 'active' && (
                  <div style={styles.modelWarning}>
                    This model is not deployed. Requests will queue until it&apos;s active.
                  </div>
                )}
              </div>

              {/* System prompt */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>System prompt</label>
                <textarea
                  style={{ ...styles.textarea, minHeight: 80 }}
                  placeholder="You are a helpful assistant…"
                  value={systemPrompt}
                  onChange={e => setSystemPrompt(e.target.value)}
                  disabled={streaming}
                />
              </div>

              {/* Temperature */}
              <div style={styles.fieldGroup}>
                <div style={styles.labelRow}>
                  <label style={styles.label}>Temperature</label>
                  <span style={styles.paramValue}>{temperature.toFixed(2)}</span>
                </div>
                <input
                  type="range" min="0" max="2" step="0.01"
                  value={temperature}
                  onChange={e => setTemperature(parseFloat(e.target.value))}
                  style={styles.range}
                  disabled={streaming}
                />
                <div style={styles.rangeHints}><span>Precise</span><span>Creative</span></div>
              </div>

              {/* Max tokens */}
              <div style={styles.fieldGroup}>
                <div style={styles.labelRow}>
                  <label style={styles.label}>Max tokens</label>
                  <span style={styles.paramValue}>{maxTokens}</span>
                </div>
                <input
                  type="range" min="1" max="8192" step="1"
                  value={maxTokens}
                  onChange={e => setMaxTokens(parseInt(e.target.value, 10))}
                  style={styles.range}
                  disabled={streaming}
                />
              </div>

              {/* Top-p */}
              <div style={styles.fieldGroup}>
                <div style={styles.labelRow}>
                  <label style={styles.label}>Top-p</label>
                  <span style={styles.paramValue}>{topP.toFixed(2)}</span>
                </div>
                <input
                  type="range" min="0" max="1" step="0.01"
                  value={topP}
                  onChange={e => setTopP(parseFloat(e.target.value))}
                  style={styles.range}
                  disabled={streaming}
                />
              </div>

              {/* Stop sequences */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Stop sequences</label>
                <input
                  type="text"
                  style={styles.input}
                  placeholder="e.g. ###, END, \n\n"
                  value={stopSequences}
                  onChange={e => setStopSequences(e.target.value)}
                  disabled={streaming}
                />
                <div style={styles.hint}>Comma-separated</div>
              </div>

              {/* Reset params */}
              <button
                style={styles.resetBtn}
                onClick={() => {
                  setTemperature(DEFAULT_TEMPERATURE);
                  setMaxTokens(DEFAULT_MAX_TOKENS);
                  setTopP(DEFAULT_TOP_P);
                  setStopSequences('');
                  setSystemPrompt('');
                }}
                disabled={streaming}
              >
                Reset parameters
              </button>
            </div>
          </aside>

          {/* ── Chat Area ───────────────────────────────── */}
          <div style={styles.chat}>
            {/* Toolbar */}
            <div style={styles.toolbar}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  style={styles.toolbarBtn}
                  onClick={clearConversation}
                  disabled={streaming && !abortRef.current}
                  title="Clear conversation"
                >
                  <IconTrash /> Clear
                </button>
                <button
                  style={{ ...styles.toolbarBtn, ...(messages.length === 0 ? styles.toolbarBtnDisabled : {}) }}
                  onClick={() => { if (messages.length || streamingContent) setShowCopyModal(true); }}
                  disabled={messages.length === 0 && !streamingContent}
                  title="Copy as code"
                >
                  <IconCode /> Copy as code
                </button>
              </div>
              {lastUsage && (
                <div style={styles.usagePill}>
                  <span title="Prompt tokens">↑ {lastUsage.promptTokens?.toLocaleString()}</span>
                  <span style={{ color: '#9CA3AF' }}>·</span>
                  <span title="Completion tokens">↓ {lastUsage.completionTokens?.toLocaleString()}</span>
                  <span style={{ color: '#9CA3AF' }}>·</span>
                  <span title="Total tokens" style={{ fontWeight: 600 }}>{lastUsage.totalTokens?.toLocaleString()} tok</span>
                </div>
              )}
            </div>

            {/* Messages */}
            <div style={styles.messages}>
              {allDisplayMessages.length === 0 ? (
                <EmptyState modelName={models.find(m => m.model_id === selectedModel)?.display_name || selectedModel} />
              ) : (
                allDisplayMessages.map((msg, i) => (
                  <MessageBubble key={i} role={msg.role} content={msg.content} isStreaming={msg.isStreaming} />
                ))
              )}
              {streamError && (
                <div style={styles.streamError}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                    <circle cx="7" cy="7" r="6" stroke="#DC2626" strokeWidth="1.4"/>
                    <path d="M7 4.5v3M7 9.5h.01" stroke="#DC2626" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                  {streamError}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input bar */}
            <div style={styles.inputBar}>
              <textarea
                ref={inputRef}
                style={styles.chatInput}
                placeholder={streaming ? 'Waiting for response…' : 'Type a message — Shift+Enter for newline, Enter to send'}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={streaming}
                rows={1}
              />
              {streaming ? (
                <button style={{ ...styles.sendBtn, background: '#DC2626' }} onClick={stopStream}>
                  <IconStop />
                </button>
              ) : (
                <button
                  style={{ ...styles.sendBtn, ...((!input.trim() || !selectedModel) ? styles.sendBtnDisabled : {}) }}
                  onClick={sendMessage}
                  disabled={!input.trim() || !selectedModel}
                >
                  <IconSend />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Copy-as-code modal */}
        {showCopyModal && (
          <div style={styles.modalOverlay} onClick={() => setShowCopyModal(false)}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>Copy as code</span>
                <button style={styles.modalClose} onClick={() => setShowCopyModal(false)}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>

              <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                {['curl', 'python', 'node'].map(lang => (
                  <button
                    key={lang}
                    style={{ ...styles.langTab, ...(copyLang === lang ? styles.langTabActive : {}) }}
                    onClick={() => { setCopyLang(lang); setCopied(false); }}
                  >
                    {lang === 'curl' ? 'curl' : lang === 'python' ? 'Python' : 'Node.js'}
                  </button>
                ))}
              </div>

              <pre style={styles.codeBlock}><code>{buildCodeSnippet(copyLang)}</code></pre>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
                <button style={{ ...styles.sendBtn, width: 'auto', padding: '0 20px', height: 38 }} onClick={copyCode}>
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </>
  );
}

function MessageBubble({ role, content, isStreaming }) {
  return (
    <div style={{ ...styles.bubble, ...(role === 'user' ? styles.bubbleUser : styles.bubbleAssistant) }}>
      <div style={styles.bubbleRole}>
        {role === 'user' ? 'You' : 'Assistant'}
      </div>
      <div style={styles.bubbleContent}>
        {content}
        {isStreaming && <span style={styles.cursor} />}
      </div>
    </div>
  );
}

function EmptyState({ modelName }) {
  return (
    <div style={styles.emptyState}>
      <div style={styles.emptyIcon}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <rect x="2" y="6" width="28" height="20" rx="4" stroke="#D1D5DB" strokeWidth="1.8"/>
          <path d="M8 13h16M8 19h10" stroke="#D1D5DB" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </div>
      <div style={{ fontWeight: 600, fontSize: 14, color: '#374151', marginBottom: 6 }}>
        {modelName ? `Ready to chat with ${modelName}` : 'Select a model to begin'}
      </div>
      <div style={{ fontSize: 13, color: '#9CA3AF', maxWidth: 320, textAlign: 'center', lineHeight: 1.5 }}>
        Type a message below to start a conversation. Adjust parameters in the panel on the left.
      </div>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────
function IconTrash() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M1.5 3.5h10M5 3.5V2.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1M10.5 3.5l-.5 7a1 1 0 01-1 1H4a1 1 0 01-1-1l-.5-7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconCode() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M4 9L1 6.5 4 4M9 4l3 2.5L9 9M7.5 2.5l-2 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconSend() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M14 8L2 2l3 6-3 6 12-6z" fill="white"/>
    </svg>
  );
}

function IconStop() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="3" y="3" width="8" height="8" rx="1.5" fill="white"/>
    </svg>
  );
}

// ── Styles ────────────────────────────────────────────────────
const styles = {
  shell: {
    display: 'flex',
    gap: 16,
    alignItems: 'flex-start',
    minHeight: 'calc(100vh - 180px)',
  },
  panel: {
    width: 260,
    flexShrink: 0,
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
    '@media (max-width: 768px)': { width: '100%' },
  },
  panelToggle: {
    display: 'none',
    width: '100%',
    padding: '12px 16px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: '#374151',
    '@media (max-width: 768px)': { display: 'flex' },
  },
  panelBody: {
    padding: '16px',
    display: 'block',
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: '#6B7280',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  paramValue: {
    fontSize: 12,
    fontWeight: 600,
    color: 'rgba(255,255,255,0.75)',
    fontVariantNumeric: 'tabular-nums',
  },
  select: {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid #D1D5DB',
    borderRadius: 8,
    fontSize: 13,
    color: '#0D0F1A',
    background: '#F9FAFB',
    appearance: 'none',
    cursor: 'pointer',
    outline: 'none',
  },
  textarea: {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid #D1D5DB',
    borderRadius: 8,
    fontSize: 13,
    color: '#0D0F1A',
    background: '#F9FAFB',
    resize: 'vertical',
    outline: 'none',
    fontFamily: 'inherit',
    lineHeight: 1.5,
  },
  input: {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid #D1D5DB',
    borderRadius: 8,
    fontSize: 13,
    color: '#0D0F1A',
    background: '#F9FAFB',
    outline: 'none',
  },
  range: {
    width: '100%',
    accentColor: '#ffffff',
    cursor: 'pointer',
  },
  rangeHints: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 3,
  },
  hint: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  modelWarning: {
    fontSize: 11,
    color: '#92400E',
    background: '#FEF3C7',
    borderRadius: 6,
    padding: '5px 8px',
    marginTop: 6,
  },
  resetBtn: {
    width: '100%',
    padding: '8px',
    background: 'transparent',
    border: '1px solid #E5E7EB',
    borderRadius: 8,
    fontSize: 12,
    color: '#6B7280',
    cursor: 'pointer',
    transition: 'background 0.12s',
  },
  chat: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
    minWidth: 0,
    minHeight: 'calc(100vh - 180px)',
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 16px',
    borderBottom: '1px solid #F3F4F6',
    flexShrink: 0,
    flexWrap: 'wrap',
    gap: 8,
  },
  toolbarBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    padding: '5px 10px',
    background: 'transparent',
    border: '1px solid #E5E7EB',
    borderRadius: 7,
    fontSize: 12.5,
    color: '#374151',
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'background 0.12s',
  },
  toolbarBtnDisabled: {
    opacity: 0.4,
    cursor: 'default',
  },
  usagePill: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: '#F3F4F6',
    borderRadius: 20,
    padding: '4px 12px',
    fontSize: 12,
    color: '#6B7280',
    fontVariantNumeric: 'tabular-nums',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  bubble: {
    maxWidth: '80%',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  bubbleAssistant: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubbleRole: {
    fontSize: 11,
    fontWeight: 600,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  bubbleContent: {
    padding: '10px 14px',
    borderRadius: 12,
    fontSize: 14,
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    background: '#F3F4F6',
    color: '#0D0F1A',
  },
  cursor: {
    display: 'inline-block',
    width: 2,
    height: '1em',
    background: 'rgba(255,255,255,0.80)',
    borderRadius: 1,
    marginLeft: 2,
    verticalAlign: 'text-bottom',
    animation: 'pg-blink 0.9s step-end infinite',
  },
  streamError: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    background: '#FEF2F2',
    border: '1px solid #FECACA',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 13,
    color: '#991B1B',
  },
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    margin: 'auto',
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.6,
  },
  inputBar: {
    display: 'flex',
    gap: 10,
    padding: '12px 16px',
    borderTop: '1px solid #F3F4F6',
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  chatInput: {
    flex: 1,
    padding: '10px 14px',
    border: '1px solid #D1D5DB',
    borderRadius: 10,
    fontSize: 14,
    color: '#0D0F1A',
    background: '#F9FAFB',
    resize: 'none',
    outline: 'none',
    fontFamily: 'inherit',
    lineHeight: 1.5,
    maxHeight: 160,
    overflowY: 'auto',
    transition: 'border-color 0.12s',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: '#ffffff',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'background 0.12s',
  },
  sendBtnDisabled: {
    background: 'rgba(255,255,255,0.25)',
    cursor: 'default',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 16,
  },
  modal: {
    background: '#fff',
    borderRadius: 14,
    padding: 24,
    width: '100%',
    maxWidth: 680,
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalClose: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#6B7280',
    padding: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  langTab: {
    padding: '5px 14px',
    border: '1px solid #E5E7EB',
    borderRadius: 20,
    background: 'transparent',
    fontSize: 13,
    color: '#6B7280',
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'all 0.1s',
  },
  langTabActive: {
    background: 'rgba(255,255,255,0.10)',
    border: '1px solid rgba(255,255,255,0.22)',
    color: 'rgba(255,255,255,0.90)',
    fontWeight: 600,
  },
  codeBlock: {
    background: '#0D0F1A',
    color: '#E2E8F0',
    borderRadius: 10,
    padding: '16px 18px',
    fontSize: 12.5,
    fontFamily: '"SFMono-Regular", "Menlo", "Monaco", "Consolas", monospace',
    overflowX: 'auto',
    lineHeight: 1.6,
    whiteSpace: 'pre',
    maxHeight: 340,
    overflowY: 'auto',
  },
};

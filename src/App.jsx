import { useState, useEffect } from 'react';

const STORAGE_KEY = 'content-developer-state';

const DEFAULT_PILLARS = [
  'Education',
  'Behind the scenes',
  'Story',
  'Promotion',
  'Community'
];

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function App() {
  const saved = loadState();

  const [braindump, setBraindump] = useState(saved?.braindump ?? '');
  const [slides, setSlides] = useState(saved?.slides ?? []);
  const [newSlideText, setNewSlideText] = useState('');
  const [pillars] = useState(saved?.pillars ?? DEFAULT_PILLARS);

  // Persist to localStorage whenever content changes
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ braindump, slides, pillars })
      );
    } catch {
      /* storage unavailable — ignore */
    }
  }, [braindump, slides, pillars]);

  function addSlide(text) {
    const value = (typeof text === 'string' ? text : newSlideText).trim();
    if (!value) return;
    const slide = {
      id: (crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`),
      text: value,
      pillar: '',
      issue: ''
    };
    setSlides((prev) => [...prev, slide]);
    setNewSlideText('');
  }

  function deleteSlide(id) {
    setSlides((prev) => prev.filter((s) => s.id !== id));
  }

  function updateSlide(id, field, value) {
    setSlides((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  }

  function exportData() {
    const data = { braindump, slides, pillars, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-developer-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importData(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (typeof data.braindump === 'string') setBraindump(data.braindump);
        if (Array.isArray(data.slides)) setSlides(data.slides);
      } catch {
        alert('Could not import file — invalid JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '24px',
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto',
      height: '100vh',
      boxSizing: 'border-box'
    }}>
      {/* Left: Braindump */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div>
          <h1 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: 'var(--text-primary)',
            margin: '0 0 4px'
          }}>
            Braindump
          </h1>
          <p style={{
            fontSize: '13px',
            color: 'var(--text-muted)',
            margin: 0
          }}>
            Capture everything first. Shape it into slides after.
          </p>
        </div>

        <div>
          <textarea
            value={braindump}
            onChange={(e) => setBraindump(e.target.value)}
            placeholder="Write freely. Voice memos, thoughts, raw ideas. Organize later."
            style={{
              width: '100%',
              minHeight: '360px',
              padding: '12px',
              fontSize: '14px',
              lineHeight: '1.6',
              border: '0.5px solid var(--border)',
              borderRadius: 'var(--radius)',
              backgroundColor: 'var(--surface-2)',
              color: 'var(--text-primary)',
              fontFamily: 'inherit',
              resize: 'vertical',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Quick add from braindump */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={newSlideText}
            onChange={(e) => setNewSlideText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addSlide()}
            placeholder="Paste or type a sentence to add as slide…"
            style={{
              flex: 1,
              padding: '8px 12px',
              fontSize: '14px',
              border: '0.5px solid var(--border)',
              borderRadius: 'var(--radius)',
              backgroundColor: 'var(--surface-2)',
              color: 'var(--text-primary)'
            }}
          />
          <button
            onClick={() => addSlide()}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '500',
              backgroundColor: 'transparent',
              border: '0.5px solid var(--border-strong)',
              borderRadius: 'var(--radius)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'background-color 0.15s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--surface-1)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            + Add
          </button>
        </div>

        {/* Export / Import */}
        <div style={{ display: 'flex', gap: '8px', paddingTop: '8px' }}>
          <button
            onClick={exportData}
            style={{
              flex: 1,
              padding: '8px',
              fontSize: '13px',
              backgroundColor: 'transparent',
              border: '0.5px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'background-color 0.15s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--surface-1)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <i className="ti ti-download" style={{ marginRight: '4px' }} aria-hidden="true" />
            Export
          </button>
          <label style={{
            flex: 1,
            padding: '8px',
            fontSize: '13px',
            backgroundColor: 'transparent',
            border: '0.5px solid var(--border)',
            borderRadius: 'var(--radius)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            transition: 'background-color 0.15s'
          }}
            onMouseEnter={(e) => e.parentElement.style.backgroundColor = 'var(--surface-1)'}
            onMouseLeave={(e) => e.parentElement.style.backgroundColor = 'transparent'}
          >
            <i className="ti ti-upload" aria-hidden="true" />
            Import
            <input
              type="file"
              accept=".json"
              onChange={importData}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      {/* Right: Slides */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        overflowY: 'auto',
        maxHeight: '100vh',
        paddingRight: '8px'
      }}>
        <div style={{
          fontSize: '14px',
          fontWeight: '500',
          color: 'var(--text-secondary)',
          paddingBottom: '8px',
          borderBottom: '0.5px solid var(--border)'
        }}>
          Slides ({slides.length})
        </div>

        {slides.length === 0 ? (
          <div style={{
            padding: '32px 16px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '13px'
          }}>
            Add your first slide to organize content
          </div>
        ) : (
          slides.map((slide, index) => (
            <div
              key={slide.id}
              style={{
                backgroundColor: 'var(--surface-2)',
                border: '0.5px solid var(--border)',
                borderRadius: '12px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              {/* Slide number and delete */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: 'var(--text-muted)'
                }}>
                  Slide {index + 1}
                </span>
                <button
                  onClick={() => deleteSlide(slide.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '4px',
                    fontSize: '16px'
                  }}
                  aria-label="Delete slide"
                >
                  <i className="ti ti-trash" />
                </button>
              </div>

              {/* Text preview */}
              <textarea
                value={slide.text}
                onChange={(e) => updateSlide(slide.id, 'text', e.target.value)}
                style={{
                  width: '100%',
                  minHeight: '80px',
                  padding: '8px',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  border: '0.5px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  backgroundColor: 'var(--surface-1)',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />

              {/* Pillar select */}
              <div>
                <label style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: 'var(--text-secondary)',
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  Pillar
                </label>
                <select
                  value={slide.pillar}
                  onChange={(e) => updateSlide(slide.id, 'pillar', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    fontSize: '13px',
                    border: '0.5px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    backgroundColor: 'var(--surface-1)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">— Select pillar —</option>
                  {pillars.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* Issue number */}
              <div>
                <label style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: 'var(--text-secondary)',
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  Issue #
                </label>
                <input
                  type="text"
                  value={slide.issue}
                  onChange={(e) => updateSlide(slide.id, 'issue', e.target.value)}
                  placeholder="e.g., 01, chapter-02"
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    fontSize: '13px',
                    border: '0.5px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    backgroundColor: 'var(--surface-1)',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Metadata summary */}
              {(slide.pillar || slide.issue) && (
                <div style={{
                  padding: '8px',
                  backgroundColor: 'var(--surface-1)',
                  borderRadius: 'var(--radius)',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  borderLeft: '2px solid var(--text-muted)'
                }}>
                  {slide.pillar && <span>{slide.pillar}</span>}
                  {slide.pillar && slide.issue && <span> • </span>}
                  {slide.issue && <span>Issue {slide.issue}</span>}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

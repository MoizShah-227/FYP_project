import React, { useEffect, useRef, useState } from 'react';
import EmojiConvertor from 'emoji-js';
import api from '../../config/axiosConfig.js';

const conv = new EmojiConvertor();
conv.replace_mode = 'unified';

/** `:cake:` (or already a glyph) → "🎂". Returns original string if not resolvable. */
export function shortcodeToGlyph(shortcode) {
  let s = String(shortcode ?? '').trim();
  if (!s) return '';
  if (!s.startsWith(':')) s = `:${s.replace(/^:+|:+$/g, '')}:`;
  const out = conv.replace_colons(s);
  return out && out !== s ? out : s;
}

/**
 * Calls POST /emoji/recommend with `text` and renders 5 emoji buttons.
 *
 * Props:
 *  - text:        the source text (post message, event name, "happy birthday X", ...)
 *  - selected:    Set of "selected keys" (use rowKey(row) to compute) — multi-select highlight
 *  - selectedId:  for single-select highlight (number E_id)
 *  - mode:        'multi' (default) or 'single'
 *  - onPick:      (row, glyph) => void  — fires on every click
 *  - submitting:  disable all buttons while sending
 *  - emptyText:   shown when API has not returned anything yet
 *  - showLabel:   small caption above buttons (default true)
 */
export default function RecommendedEmojiPicker({
  text,
  selected,
  selectedId,
  mode = 'multi',
  onPick,
  submitting = false,
  emptyText = 'Suggested emojis based on your text',
  showLabel = true,
  fallback: fallbackProp,
}) {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [serverFallback, setServerFallback] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const t = String(text ?? '').trim();
    if (!t) {
      setRows([]);
      setServerFallback(false);
      return;
    }
    setLoading(true);
    timerRef.current = window.setTimeout(async () => {
      try {
        const res = await api.post('/emoji/recommend', { text: t });
        const list = Array.isArray(res.data?.emojis) ? res.data.emojis : [];
        setRows(list);
        setServerFallback(!!res.data?.fallback);
      } catch (e) {
        console.warn('emoji/recommend failed:', e.response?.data || e.message);
        setRows([]);
        setServerFallback(false);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [text]);

  const isHighlighted = (row, glyph) => {
    if (mode === 'single') return Number(selectedId) === Number(row.id);
    if (!(selected instanceof Set)) return false;
    return selected.has(glyph) || selected.has(String(row.emoji)) || selected.has(Number(row.id));
  };

  if (loading && rows.length === 0) {
    return (
      <p className="small text-muted mb-2" style={{ lineHeight: 1.35 }}>
        Finding suggested emojis…
      </p>
    );
  }

  if (rows.length === 0) {
    if (fallbackProp) return fallbackProp;
    return null;
  }

  return (
    <div className="mb-2">
      {showLabel ? (
        <p className="small text-muted mb-2" style={{ lineHeight: 1.35 }}>
          {serverFallback
            ? 'No exact match — showing common reactions:'
            : emptyText}
        </p>
      ) : null}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(rows.length, 5)}, 1fr)`,
          gap: 8,
        }}
      >
        {rows.map((row) => {
          const glyph = shortcodeToGlyph(row.emoji);
          const highlighted = isHighlighted(row, glyph);
          return (
            <button
              key={row.id}
              type="button"
              disabled={submitting}
              title={row.emoji}
              onClick={() => onPick?.(row, glyph)}
              style={{
                background: highlighted ? '#d9eff4' : '#f4f4f4',
                border: highlighted ? '2px solid #07333d' : '2px solid transparent',
                borderRadius: 10,
                fontSize: '1.5rem',
                padding: '8px 4px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                textAlign: 'center',
                fontFamily: 'inherit',
              }}
            >
              {glyph || '·'}
            </button>
          );
        })}
      </div>
    </div>
  );
}

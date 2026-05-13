import React, { useState, useEffect } from 'react';
import EmojiConvertor from 'emoji-js';
import api from '../../config/axiosConfig.js';

/** Persist emoji the same way as the rest of the app: `:shortcode:` in DB */
const emojiStore = new EmojiConvertor();
emojiStore.colons_mode = true;

function unifiedToColonShortcodes(str) {
  if (typeof str !== 'string' || !str) return '';
  return emojiStore.replace_unified(str);
}

const EMOJIS = ['❤️', '🍓', '🧁', '🎂', '🍪', '🎁', '🎊', '🎈', '🎆', '✨'];

const WishModal = ({ name, onClose, onSend }) => {
  const [selectedEmojis, setSelectedEmojis] = useState(new Set());
  const [submitting, setSubmitting] = useState(false);

  const toggleEmoji = (em) => {
    setSelectedEmojis((prev) => {
      const next = new Set(prev);
      next.has(em) ? next.delete(em) : next.add(em);
      return next;
    });
  };

  const handleSend = async () => {
    const emojis = [...selectedEmojis];
    if (emojis.length === 0) {
      alert('Pick at least one emoji.');
      return;
    }
    setSubmitting(true);
    try {
      await onSend({ emojis });
    } catch (e) {
      console.error(e.response?.data || e.message);
      alert(e.response?.data?.message || 'Could not send wish. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ zIndex: 3000, backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-4 shadow-lg position-relative"
        style={{ maxWidth: '360px', width: '92%', padding: '24px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="d-flex justify-content-between align-items-start mb-1">
          <div>
            <h5 className="fw-bold mb-0" style={{ color: '#07333d' }}>Wish {name}</h5>
            <small className="text-muted">Select Emojis:</small>
          </div>
          <button
            type="button"
            className="btn p-0 border-0"
            style={{ color: '#aaa', fontSize: '1.1rem', lineHeight: 1 }}
            onClick={onClose}
            disabled={submitting}
          >
            ✕
          </button>
        </div>

        <div
          className="mt-3"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '8px',
            marginBottom: '20px',
          }}
        >
          {EMOJIS.map((em) => (
            <button
              type="button"
              key={em}
              disabled={submitting}
              onClick={() => toggleEmoji(em)}
              style={{
                background: selectedEmojis.has(em) ? '#d9eff4' : '#f4f4f4',
                border: selectedEmojis.has(em) ? '2px solid #07333d' : '2px solid transparent',
                borderRadius: '10px',
                fontSize: '1.5rem',
                padding: '8px 4px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s',
              }}
            >
              {em}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="w-100 border-0 rounded-3 fw-bold"
          style={{
            background: '#07333d',
            color: 'white',
            padding: '14px',
            fontSize: '1rem',
            cursor: submitting ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            opacity: submitting ? 0.75 : 1,
          }}
          disabled={submitting}
          onClick={handleSend}
        >
          {submitting ? 'Sending…' : 'Send Wish'}
        </button>
      </div>
    </div>
  );
};

/**
 * @param {string} name - display name
 * @param {number} receiverId - favourite's u_id (birthday person)
 */
const BirthdayNotification = ({ name, receiverId, onClose, onWishCompleted }) => {
  const [step, setStep] = useState('prompt'); // 'prompt' | 'wish' | 'wished'
  const [eligibility, setEligibility] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = localStorage.getItem('user');
        const user = raw ? JSON.parse(raw) : null;
        const sender_id = user?.id ?? user?.u_id;
        if (sender_id == null || receiverId == null) {
          if (!cancelled) setEligibility({ canWish: false, alreadyWishedThisYear: false });
          return;
        }
        const res = await api.get('/message/birthday-wish-eligibility', {
          params: { sender_id, receiver_id: receiverId },
        });
        if (!cancelled) {
          setEligibility({
            canWish: res.data?.canWish !== false,
            alreadyWishedThisYear: !!res.data?.alreadyWishedThisYear,
            reason: res.data?.reason || null,
          });
        }
      } catch (e) {
        console.error(e.response?.data || e.message);
        if (!cancelled) setEligibility({ canWish: true, alreadyWishedThisYear: false });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [receiverId]);

  const persistWishToMessages = async ({ emojis }) => {
    const raw = localStorage.getItem('user');
    const user = raw ? JSON.parse(raw) : null;
    const senderId = user?.id ?? user?.u_id;
    const sender_id = Number(senderId);
    const receiver_id = Number(receiverId);

    if (!Number.isFinite(sender_id) || !Number.isFinite(receiver_id)) {
      throw new Error('Missing user id');
    }
    if (sender_id === receiver_id) {
      alert('You cannot send a wish to yourself.');
      throw new Error('sender equals receiver');
    }

    const emojiJoined = (emojis || []).join('');
    const emojiColons = unifiedToColonShortcodes(emojiJoined).trim();
    const emojiPayload = emojiColons
      ? (emojiColons.length > 100 ? emojiColons.slice(0, 100) : emojiColons)
      : null;

    if (!emojiPayload) {
      alert('Pick at least one emoji.');
      throw new Error('no emoji');
    }

    const bodyMessage = 'Happy Birthday!';

    try {
      await api.post('/message/send-message', {
        sender_id,
        receiver_id,
        message: bodyMessage,
        emoji: emojiPayload,
        birthday_wish: true,
      });
    } catch (err) {
      if (err.response?.status === 409) {
        setEligibility({ canWish: false, alreadyWishedThisYear: true });
        setStep('wished');
        onWishCompleted?.();
        return;
      }
      if (err.response?.status === 403) {
        alert(err.response?.data?.message || 'Cannot send birthday wish.');
        setEligibility({
          canWish: false,
          alreadyWishedThisYear: false,
          reason:
            String(err.response?.data?.message || '').includes('people on their list')
              ? 'receiver_not_in_birthday_allowlist'
              : 'receiver_private_account',
        });
        return;
      }
      throw err;
    }

    setEligibility({ canWish: false, alreadyWishedThisYear: true });
    setStep('wished');
    onWishCompleted?.();
  };

  const showWishedCard =
    step === 'wished' || (eligibility && !eligibility.canWish && eligibility.alreadyWishedThisYear);

  if (eligibility === null) {
    return (
      <div
        className="bg-white rounded-4 shadow"
        style={{ maxWidth: 340, width: '100%', padding: '14px 18px' }}
      >
        <p className="m-0 small text-muted">Checking wish status…</p>
      </div>
    );
  }

  if (showWishedCard) {
    return (
      <div
        className="bg-white rounded-4 shadow d-flex align-items-start gap-3"
        style={{ maxWidth: 340, padding: '14px 18px' }}
      >
        <span style={{ fontSize: '2rem', lineHeight: 1 }}>🎂</span>
        <div>
          <div className="fw-bold" style={{ color: '#07333d', fontSize: '0.98rem' }}>
            Today is {name}&apos;s birthday!
          </div>
          <div style={{ fontSize: '0.72rem', color: '#aaa' }}>Just now</div>
          <div
            className="fw-bold mt-1 d-flex align-items-center gap-1"
            style={{ fontSize: '0.82rem', color: '#07333d' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {step === 'wished' ? 'Wished' : 'Already wished this year'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="bg-white rounded-4 shadow"
        style={{ maxWidth: 340, width: '100%', padding: '14px 18px' }}
      >
        <div className="d-flex align-items-start gap-3">
          <span style={{ fontSize: '2rem', lineHeight: 1 }}>🎂</span>
          <div>
            <div className="fw-bold" style={{ color: '#07333d', fontSize: '0.98rem' }}>
              Today is {name}&apos;s birthday!
            </div>
            <div style={{ fontSize: '0.72rem', color: '#aaa' }}>Just now</div>
          </div>
        </div>

        <div style={{ fontSize: '0.85rem', color: '#555', margin: '12px 0 14px' }}>
          {eligibility?.reason === 'receiver_private_account'
            ? `${name} has private account settings — birthday wishes are not shown.`
            : eligibility?.reason === 'receiver_not_in_birthday_allowlist'
              ? `${name} only accepts birthday wishes from people on their list.`
              : `Would you like to wish ${name}?`}
        </div>

        <div className="d-flex gap-2">
          <button
            type="button"
            className="border-0 fw-bold"
            style={{
              background: '#f5a623',
              color: 'white',
              borderRadius: '30px',
              padding: '8px 28px',
              fontSize: '0.9rem',
              cursor: eligibility?.canWish ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit',
              opacity: eligibility?.canWish ? 1 : 0.55,
            }}
            disabled={!eligibility?.canWish}
            onClick={() => eligibility?.canWish && setStep('wish')}
          >
            Yes
          </button>
          <button
            type="button"
            className="border-0 fw-bold"
            style={{
              background: '#07333d',
              color: 'white',
              borderRadius: '30px',
              padding: '8px 28px',
              fontSize: '0.9rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
            onClick={onClose}
          >
            No
          </button>
        </div>
      </div>

      {eligibility?.canWish && step === 'wish' && (
        <WishModal
          name={name}
          onClose={() => setStep('prompt')}
          onSend={persistWishToMessages}
        />
      )}
    </>
  );
};

export default BirthdayNotification;

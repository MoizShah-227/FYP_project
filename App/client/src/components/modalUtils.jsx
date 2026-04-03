import { Check } from 'lucide-react';

export const Checkbox = ({ checked }) => (
  <div
    style={{
      width: 20,
      height: 20,
      borderRadius: 4,
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: checked ? '#2ecc71' : 'transparent',
      border: checked ? 'none' : '1.5px solid #ccc',
      transition: 'background 0.15s',
    }}
  >
    {checked && <Check size={13} color="#fff" strokeWidth={3} />}
  </div>
);

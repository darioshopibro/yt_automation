import React, { useState, useRef, useEffect } from 'react';

interface InlineEditProps {
  value: string;
  onSave: (value: string) => void;
  style?: React.CSSProperties;
  className?: string;
  placeholder?: string;
}

const InlineEdit: React.FC<InlineEditProps> = ({ value, onSave, style, placeholder }) => {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setText(value);
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    const trimmed = text.trim();
    if (trimmed && trimmed !== value) {
      onSave(trimmed);
    } else {
      setText(value);
    }
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={text}
        onChange={e => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') { setText(value); setEditing(false); }
        }}
        style={{
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 4,
          color: 'inherit',
          font: 'inherit',
          padding: '2px 6px',
          outline: 'none',
          width: '100%',
          ...style,
        }}
        placeholder={placeholder}
      />
    );
  }

  return (
    <span
      onClick={() => setEditing(true)}
      style={{
        cursor: 'text',
        padding: '2px 6px',
        borderRadius: 4,
        transition: 'background 0.15s',
        ...style,
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      title="Click to edit"
    >
      {value || placeholder || '(empty)'}
    </span>
  );
};

export default InlineEdit;

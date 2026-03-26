import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DynamicConfig } from './types';

interface WordTimestamp {
  word: string;
  start: number;
  end: number;
  startFrame?: number;
  endFrame?: number;
}

interface Voice {
  voice_id: string;
  name: string;
  category: string;
  labels?: { gender?: string; accent?: string; age?: string; [key: string]: string | undefined };
}

interface BottomPanelProps {
  project: string;
  config: DynamicConfig;
  audioVersion: number;
  onActiveSection: (stickyIdx: number, sectionIdx: number) => void;
  onRegenerated: () => void;
}

const BottomPanel: React.FC<BottomPanelProps> = ({
  project,
  config,
  audioVersion,
  onActiveSection,
  onRegenerated,
}) => {
  // Drawer state
  const [expanded, setExpanded] = useState(false);

  // Audio state
  const audioRef = useRef<HTMLAudioElement>(null);
  const [words, setWords] = useState<WordTimestamp[]>([]);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const animFrame = useRef<number>(0);

  // Voice state
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [modelId, setModelId] = useState('eleven_turbo_v2_5');
  const [stability, setStability] = useState(0.5);
  const [similarityBoost, setSimilarityBoost] = useState(0.75);
  const [speed, setSpeed] = useState(1.0);
  const [loadingVoices, setLoadingVoices] = useState(false);

  // Transcript state
  const [transcript, setTranscript] = useState('');
  const [originalTranscript, setOriginalTranscript] = useState('');
  const [loadingTranscript, setLoadingTranscript] = useState(false);

  // Regeneration state
  const [regenerating, setRegenerating] = useState(false);
  const [regenMessage, setRegenMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Voice pills scroll ref
  const voiceScrollRef = useRef<HTMLDivElement>(null);

  // Load timestamps
  useEffect(() => {
    fetch(`/api/timestamps?project=${encodeURIComponent(project)}`)
      .then(r => r.json())
      .then(data => setWords(data.words || []))
      .catch(() => setWords([]));
  }, [project, audioVersion]);

  // Load voices
  useEffect(() => {
    setLoadingVoices(true);
    fetch('/api/voices')
      .then(r => r.json())
      .then(data => {
        const v = data.voices || [];
        setVoices(v);
        if (v.length > 0 && !selectedVoice) {
          const charlie = v.find((voice: Voice) => voice.name.toLowerCase().includes('charlie'));
          setSelectedVoice(charlie ? charlie.voice_id : v[0].voice_id);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingVoices(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load transcript
  const loadTranscript = useCallback(() => {
    setLoadingTranscript(true);
    fetch(`/api/transcript?project=${encodeURIComponent(project)}`)
      .then(r => r.json())
      .then(data => {
        const text = data.text || '';
        setTranscript(text);
        setOriginalTranscript(text);
      })
      .catch(() => {})
      .finally(() => setLoadingTranscript(false));
  }, [project]);

  useEffect(() => {
    loadTranscript();
  }, [loadTranscript]);

  // Animation loop
  const tick = useCallback(() => {
    if (!audioRef.current) return;
    const t = audioRef.current.currentTime;
    setCurrentTime(t);

    // Find active section
    const currentFrame = Math.round(t * config.fps);
    let activeStickyIdx = 0;
    let activeSectionIdx = 0;
    for (let si = 0; si < config.stickies.length; si++) {
      for (let sec = 0; sec < config.stickies[si].sections.length; sec++) {
        const sf = config.stickies[si].sections[sec].startFrame;
        if (currentFrame >= sf) {
          activeStickyIdx = si;
          activeSectionIdx = sec;
        }
      }
    }
    onActiveSection(activeStickyIdx, activeSectionIdx);

    if (playing) {
      animFrame.current = requestAnimationFrame(tick);
    }
  }, [playing, config, onActiveSection]);

  useEffect(() => {
    if (playing) {
      animFrame.current = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(animFrame.current);
  }, [playing, tick]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = ratio * duration;
    setCurrentTime(ratio * duration);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const getActiveSectionName = () => {
    const currentFrame = Math.round(currentTime * config.fps);
    let name = '';
    for (const sticky of config.stickies) {
      for (const sec of sticky.sections) {
        if (currentFrame >= sec.startFrame) {
          name = `${sticky.title} \u2192 ${sec.title}`;
        }
      }
    }
    return name;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Regenerate handler
  const handleRegenerate = async () => {
    if (!transcript.trim() || !selectedVoice) return;
    setRegenerating(true);
    setRegenMessage(null);

    try {
      const resp = await fetch(`/api/regenerate?project=${encodeURIComponent(project)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: transcript.trim(),
          voiceId: selectedVoice,
          modelId,
          settings: { stability, similarity_boost: similarityBoost, speed },
        }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Regeneration failed');
      setRegenMessage({ text: `Generated! ${data.wordCount} words, ${data.duration.toFixed(1)}s`, type: 'success' });
      setOriginalTranscript(transcript);
      onRegenerated();
    } catch (err: any) {
      setRegenMessage({ text: err.message, type: 'error' });
    } finally {
      setRegenerating(false);
    }
  };

  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;

  const getVoiceInitials = (name: string) => {
    const parts = name.split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getGenderColor = (voice: Voice) => {
    const gender = voice.labels?.gender?.toLowerCase();
    if (gender === 'female') return '#ec4899';
    if (gender === 'male') return '#3b82f6';
    return '#6b7280';
  };

  return (
    <div style={{
      background: '#08080f',
      borderTop: '1px solid #1a1a2e',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      transition: 'max-height 0.3s ease',
      maxHeight: expanded ? 420 : 52,
      overflow: 'hidden',
      zIndex: 60,
    }}>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={`/api/audio?project=${encodeURIComponent(project)}&v=${audioVersion}`}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => setPlaying(false)}
        preload="auto"
      />

      {/* Always-visible bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 16px',
        minHeight: 36,
        flexShrink: 0,
      }}>
        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            background: playing ? '#ef4444' : '#22c55e',
            border: 'none',
            color: '#fff',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: playing
              ? '0 0 10px rgba(239,68,68,0.4)'
              : '0 0 10px rgba(34,197,94,0.4)',
            transition: 'all 0.15s',
          }}
          title={playing ? 'Pause' : 'Play'}
        >
          {playing ? '\u23F8' : '\u25B6'}
        </button>

        {/* Progress bar */}
        <div
          onClick={seek}
          style={{
            flex: 1,
            height: 6,
            background: '#1a1a2e',
            borderRadius: 3,
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
            minWidth: 100,
          }}
        >
          {/* Section markers */}
          {config.stickies.map((sticky, si) =>
            sticky.sections.map((sec, sci) => {
              const pos = duration > 0 ? (sec.startFrame / config.fps / duration) * 100 : 0;
              return (
                <div
                  key={`m-${si}-${sci}`}
                  style={{
                    position: 'absolute',
                    left: `${pos}%`,
                    top: 0,
                    width: 2,
                    height: '100%',
                    background: sticky.color,
                    opacity: 0.6,
                  }}
                  title={`${sticky.title} \u2192 ${sec.title}`}
                />
              );
            })
          )}
          {/* Fill */}
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #818cf8, #6366f1)',
            borderRadius: 3,
            transition: playing ? 'none' : 'width 0.1s',
          }} />
          {/* Playhead */}
          <div style={{
            position: 'absolute',
            left: `${progress}%`,
            top: -3,
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: '#f8fafc',
            transform: 'translateX(-50%)',
            boxShadow: '0 0 6px rgba(255,255,255,0.4)',
          }} />
        </div>

        {/* Time */}
        <span style={{
          fontSize: 11,
          color: '#64748b',
          fontFamily: "'SF Mono', monospace",
          flexShrink: 0,
          minWidth: 80,
        }}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        {/* Divider */}
        <div style={{ width: 1, height: 16, background: '#1a1a2e', flexShrink: 0 }} />

        {/* Active section */}
        <span style={{
          fontSize: 10,
          color: '#818cf8',
          fontFamily: "'SF Mono', monospace",
          flexShrink: 0,
          background: '#818cf820',
          padding: '2px 8px',
          borderRadius: 4,
          maxWidth: 200,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {getActiveSectionName() || '\u2014'}
        </span>

        {/* Spacer */}
        <div style={{ flex: '0 0 auto' }} />

        {/* Expand/collapse toggle */}
        <button
          onClick={() => setExpanded(prev => !prev)}
          style={{
            background: expanded ? '#818cf820' : 'transparent',
            border: `1px solid ${expanded ? '#818cf860' : '#2a2a3e'}`,
            borderRadius: 6,
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: expanded ? '#818cf8' : '#64748b',
            fontSize: 14,
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.2s',
          }}
          title={expanded ? 'Collapse panel' : 'Expand panel'}
        >
          {expanded ? '\u2304' : '\u2303'}
        </button>
      </div>

      {/* Expanded drawer */}
      <div style={{
        borderTop: '1px solid #1a1a2e',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        overflow: 'auto',
        opacity: expanded ? 1 : 0,
        transition: 'opacity 0.2s ease',
      }}>
        {/* TRANSCRIPT section */}
        <div style={{
          padding: '10px 16px',
          borderBottom: '1px solid #1a1a2e',
        }}>
          <div style={{
            fontSize: 10,
            fontWeight: 700,
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 6,
          }}>
            Transcript
          </div>
          {loadingTranscript ? (
            <div style={{ color: '#475569', fontSize: 12, padding: 4 }}>Loading...</div>
          ) : (
            <>
              <textarea
                value={transcript}
                onChange={e => setTranscript(e.target.value)}
                placeholder="Voiceover transcript text..."
                style={{
                  width: '100%',
                  minHeight: 80,
                  maxHeight: 120,
                  background: '#0c0c18',
                  border: '1px solid #1a1a2e',
                  borderRadius: 8,
                  padding: 10,
                  color: '#e2e8f0',
                  fontSize: 12,
                  lineHeight: 1.6,
                  fontFamily: "'Inter', system-ui, sans-serif",
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = '#818cf860'; }}
                onBlur={e => { e.currentTarget.style.borderColor = '#1a1a2e'; }}
              />
              <div style={{
                fontSize: 10,
                color: '#475569',
                fontFamily: "'SF Mono', monospace",
                marginTop: 4,
              }}>
                {wordCount} words
              </div>
            </>
          )}
        </div>

        {/* VOICE section */}
        <div style={{
          padding: '10px 16px',
        }}>
          <div style={{
            fontSize: 10,
            fontWeight: 700,
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <span style={{ fontSize: 13 }}>&#x1F50A;</span> Voice
            {loadingVoices && <span style={{ fontWeight: 400, fontSize: 9, color: '#475569' }}>loading...</span>}
          </div>

          {/* Voice pills */}
          <div
            ref={voiceScrollRef}
            style={{
              display: 'flex',
              gap: 8,
              overflowX: 'auto',
              paddingBottom: 8,
              marginBottom: 10,
              scrollbarWidth: 'thin',
            }}
          >
            {voices.map(v => {
              const isSelected = v.voice_id === selectedVoice;
              const genderColor = getGenderColor(v);
              return (
                <div
                  key={v.voice_id}
                  onClick={() => setSelectedVoice(v.voice_id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    cursor: 'pointer',
                    flexShrink: 0,
                    padding: '4px 6px',
                    borderRadius: 8,
                    background: isSelected ? `${genderColor}15` : 'transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${genderColor}30, ${genderColor}10)`,
                    border: isSelected
                      ? `2px solid ${genderColor}`
                      : '2px solid transparent',
                    boxShadow: isSelected
                      ? `0 0 12px ${genderColor}40, 0 0 4px rgba(255,255,255,0.15)`
                      : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 700,
                    color: isSelected ? '#f8fafc' : '#94a3b8',
                    fontFamily: "'SF Mono', monospace",
                    transition: 'all 0.15s',
                  }}>
                    {getVoiceInitials(v.name)}
                  </div>
                  <span style={{
                    fontSize: 9,
                    color: isSelected ? '#f8fafc' : '#64748b',
                    fontWeight: isSelected ? 600 : 400,
                    maxWidth: 48,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    textAlign: 'center',
                  }}>
                    {v.name}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Voice settings row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}>
            {/* Model toggle */}
            <div style={{
              display: 'flex',
              borderRadius: 6,
              overflow: 'hidden',
              border: '1px solid #1a1a2e',
              flexShrink: 0,
            }}>
              <button
                onClick={() => setModelId('eleven_turbo_v2_5')}
                style={{
                  padding: '4px 10px',
                  fontSize: 10,
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: modelId === 'eleven_turbo_v2_5' ? '#818cf8' : '#0c0c18',
                  color: modelId === 'eleven_turbo_v2_5' ? '#fff' : '#64748b',
                  transition: 'all 0.15s',
                }}
              >
                Turbo
              </button>
              <button
                onClick={() => setModelId('eleven_multilingual_v2')}
                style={{
                  padding: '4px 10px',
                  fontSize: 10,
                  fontWeight: 600,
                  border: 'none',
                  borderLeft: '1px solid #1a1a2e',
                  cursor: 'pointer',
                  background: modelId === 'eleven_multilingual_v2' ? '#818cf8' : '#0c0c18',
                  color: modelId === 'eleven_multilingual_v2' ? '#fff' : '#64748b',
                  transition: 'all 0.15s',
                }}
              >
                Quality
              </button>
            </div>

            {/* Stability slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              <span style={{ fontSize: 9, color: '#64748b' }}>Stab</span>
              <input
                type="range"
                min={0} max={1} step={0.01}
                value={stability}
                onChange={e => setStability(parseFloat(e.target.value))}
                style={{
                  width: 60,
                  height: 3,
                  appearance: 'none',
                  background: '#1a1a2e',
                  borderRadius: 2,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              />
              <span style={{
                fontSize: 9,
                color: '#818cf8',
                fontFamily: "'SF Mono', monospace",
                minWidth: 28,
              }}>
                {stability.toFixed(2)}
              </span>
            </div>

            {/* Similarity slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              <span style={{ fontSize: 9, color: '#64748b' }}>Sim</span>
              <input
                type="range"
                min={0} max={1} step={0.01}
                value={similarityBoost}
                onChange={e => setSimilarityBoost(parseFloat(e.target.value))}
                style={{
                  width: 60,
                  height: 3,
                  appearance: 'none',
                  background: '#1a1a2e',
                  borderRadius: 2,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              />
              <span style={{
                fontSize: 9,
                color: '#818cf8',
                fontFamily: "'SF Mono', monospace",
                minWidth: 28,
              }}>
                {similarityBoost.toFixed(2)}
              </span>
            </div>

            {/* Speed slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              <span style={{ fontSize: 9, color: '#64748b' }}>Spd</span>
              <input
                type="range"
                min={0.5} max={2.0} step={0.05}
                value={speed}
                onChange={e => setSpeed(parseFloat(e.target.value))}
                style={{
                  width: 60,
                  height: 3,
                  appearance: 'none',
                  background: '#1a1a2e',
                  borderRadius: 2,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              />
              <span style={{
                fontSize: 9,
                color: '#818cf8',
                fontFamily: "'SF Mono', monospace",
                minWidth: 28,
              }}>
                {speed.toFixed(1)}x
              </span>
            </div>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Regenerate button */}
            <button
              onClick={handleRegenerate}
              disabled={regenerating || !transcript.trim() || !selectedVoice}
              style={{
                background: regenerating ? '#1a1a2e' : '#818cf8',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '6px 14px',
                fontSize: 11,
                fontWeight: 700,
                cursor: regenerating ? 'default' : 'pointer',
                opacity: regenerating ? 0.7 : 1,
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                flexShrink: 0,
              }}
            >
              {regenerating ? (
                <>
                  <span style={{
                    display: 'inline-block',
                    width: 12,
                    height: 12,
                    border: '2px solid #ffffff40',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'bp-spin 0.8s linear infinite',
                  }} />
                  Generating...
                </>
              ) : (
                <>&#x1F50A; Regenerate</>
              )}
            </button>
          </div>

          {/* Regen message */}
          {regenMessage && (
            <div style={{
              marginTop: 6,
              padding: '4px 8px',
              borderRadius: 6,
              fontSize: 10,
              color: regenMessage.type === 'success' ? '#86efac' : '#fca5a5',
              background: regenMessage.type === 'success' ? '#22c55e15' : '#ef444415',
              border: `1px solid ${regenMessage.type === 'success' ? '#22c55e30' : '#ef444430'}`,
            }}>
              {regenMessage.text}
            </div>
          )}
        </div>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes bp-spin {
          to { transform: rotate(360deg); }
        }
        .bp-drawer input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #818cf8;
          cursor: pointer;
          border: 1.5px solid #08080f;
        }
      `}</style>
    </div>
  );
};

export default BottomPanel;

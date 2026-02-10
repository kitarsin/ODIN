import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

const TILE_SIZE = 16;
const MOVE_DELAY_MS = 120;
const INTERACT_DELAY_MS = 220;

const GRID_COLS = 28;
const GRID_ROWS = 16;
const QUESTION_ID = 'array-level-1';

const COLORS = {
  background: '#0b0f14',
  floor: '#1c2533',
  floorAlt: '#233142',
  player: '#ffe66d',
  playerShadow: '#ffb703',
  terminal: '#4ecdc4',
  terminalGlow: '#88fff4',
};

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function BasicExplorerGame() {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const keysRef = useRef<Record<string, boolean>>({});
  const playerRef = useRef({ x: 3, y: 3 });
  const lastMoveRef = useRef(0);
  const lastInteractRef = useRef(0);
  const promptVisibleRef = useRef(false);
  const levelRef = useRef<1 | 2>(1);
  const interactRequestedRef = useRef(false);

  const [level, setLevel] = useState<1 | 2>(1);
  const [promptVisible, setPromptVisible] = useState(false);
  const [code, setCode] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [loadError, setLoadError] = useState<string | null>(null);

  const width = GRID_COLS * TILE_SIZE;
  const height = GRID_ROWS * TILE_SIZE;
  const terminalPosition = { x: 20, y: 8 };

  useEffect(() => {
    levelRef.current = level;
    if (level === 2) {
      keysRef.current = {};
      interactRequestedRef.current = false;
    }
  }, [level]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const activeElement = document.activeElement;
      const isTyping =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        (activeElement instanceof HTMLElement && activeElement.isContentEditable);
      if (levelRef.current === 2 || isTyping) return;
      if (
        key === 'w' ||
        key === 'a' ||
        key === 's' ||
        key === 'd' ||
        key === 'e' ||
        key === 'arrowup' ||
        key === 'arrowdown' ||
        key === 'arrowleft' ||
        key === 'arrowright'
      ) {
        keysRef.current[key] = true;
        if (key === 'e') {
          interactRequestedRef.current = true;
        }
        event.preventDefault();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (keysRef.current[key]) {
        keysRef.current[key] = false;
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (!user || level !== 2) return;

    const loadLatestSubmission = async () => {
      setLoadError(null);
      const { data, error } = await supabase
        .from('submissions')
        .select('code_snippet')
        .eq('user_id', user.id)
        .eq('question_id', QUESTION_ID)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        setLoadError('Unable to load your last submission.');
        return;
      }

      if (data && data.length > 0) {
        setCode(data[0].code_snippet || '');
      }
    };

    loadLatestSubmission();
  }, [level, user]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const canMoveTo = (x: number, y: number) =>
      x >= 0 && y >= 0 && x < GRID_COLS && y < GRID_ROWS;

    const drawMap = () => {
      context.fillStyle = COLORS.background;
      context.fillRect(0, 0, width, height);

      for (let row = 0; row < GRID_ROWS; row += 1) {
        for (let col = 0; col < GRID_COLS; col += 1) {
          const useAlt = (row + col) % 2 === 0;
          context.fillStyle = useAlt ? COLORS.floorAlt : COLORS.floor;
          context.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }
    };

    const drawTerminal = () => {
      const pixelX = terminalPosition.x * TILE_SIZE;
      const pixelY = terminalPosition.y * TILE_SIZE;
      context.fillStyle = COLORS.terminalGlow;
      context.fillRect(pixelX - 1, pixelY - 1, TILE_SIZE + 2, TILE_SIZE + 2);
      context.fillStyle = COLORS.terminal;
      context.fillRect(pixelX, pixelY, TILE_SIZE, TILE_SIZE);
      context.fillStyle = COLORS.background;
      context.fillRect(pixelX + 4, pixelY + 5, TILE_SIZE - 8, TILE_SIZE - 8);
    };

    const drawPlayer = () => {
      const { x, y } = playerRef.current;
      const pixelX = x * TILE_SIZE;
      const pixelY = y * TILE_SIZE;
      context.fillStyle = COLORS.playerShadow;
      context.fillRect(pixelX + 2, pixelY + 2, TILE_SIZE - 4, TILE_SIZE - 4);
      context.fillStyle = COLORS.player;
      context.fillRect(pixelX + 1, pixelY + 1, TILE_SIZE - 4, TILE_SIZE - 4);
    };

    const render = () => {
      drawMap();
      drawTerminal();
      drawPlayer();
    };

    const step = (timestamp: number) => {
      if (level === 1) {
        const lastMove = lastMoveRef.current;
        if (timestamp - lastMove >= MOVE_DELAY_MS) {
          let dx = 0;
          let dy = 0;
          const keys = keysRef.current;

          if (keys.w || keys.arrowup) dy = -1;
          else if (keys.s || keys.arrowdown) dy = 1;
          else if (keys.a || keys.arrowleft) dx = -1;
          else if (keys.d || keys.arrowright) dx = 1;

          if (dx !== 0 || dy !== 0) {
            const nextX = playerRef.current.x + dx;
            const nextY = playerRef.current.y + dy;
            if (canMoveTo(nextX, nextY)) {
              playerRef.current = { x: nextX, y: nextY };
            }
            lastMoveRef.current = timestamp;
          }
        }

        const inRange =
          Math.abs(playerRef.current.x - terminalPosition.x) +
            Math.abs(playerRef.current.y - terminalPosition.y) <=
          1;

        if (inRange !== promptVisibleRef.current) {
          promptVisibleRef.current = inRange;
          setPromptVisible(inRange);
        }

        if (
          inRange &&
          interactRequestedRef.current &&
          timestamp - lastInteractRef.current >= INTERACT_DELAY_MS
        ) {
          interactRequestedRef.current = false;
          lastInteractRef.current = timestamp;
          setLevel(2);
        }
      }

      render();
      requestAnimationFrame(step);
    };

    render();
    const animationId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationId);
  }, [height, level, width]);

  const handleSave = async () => {
    if (!user) {
      setSaveStatus('error');
      return;
    }

    setSaveStatus('saving');
    const { error } = await supabase.from('submissions').insert({
      user_id: user.id,
      question_id: QUESTION_ID,
      code_snippet: code,
      is_correct: false,
    });

    if (error) {
      setSaveStatus('error');
      return;
    }

    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 1600);
  };

  const handleExitTerminal = () => {
    keysRef.current = {};
    interactRequestedRef.current = false;
    lastInteractRef.current = performance.now();
    setLevel(1);
  };

  return (
    <div className="h-full w-full">
      <div className="relative h-full w-full rounded-lg border-4 border-primary bg-card/60 p-3">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="h-full w-full"
          style={{ imageRendering: 'pixelated' }}
        />

        {promptVisible && level === 1 && (
          <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full border border-primary/40 bg-background/90 px-4 py-1 text-xs text-primary" style={{ fontFamily: 'var(--font-mono)' }}>
            Press E to interact with the terminal
          </div>
        )}


        {level === 2 && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 p-4">
            <div className="w-full max-w-3xl rounded-xl border border-border bg-card p-6 shadow-xl">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                    Level 2: Arrays
                  </p>
                  <h3 className="text-lg font-semibold">C# Array Practice</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExitTerminal}
                    className="rounded-md border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                  >
                    Exit Terminal
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
                  >
                    {saveStatus === 'saving' ? 'Submitting...' : 'Submit Code'}
                  </button>
                </div>
              </div>

              <textarea
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="// Write a C# array example here"
                className="h-56 w-full resize-none rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none"
                style={{ fontFamily: 'var(--font-mono)' }}
              />

              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                <span>Focus: array declarations and 2D arrays.</span>
                <span>
                  {saveStatus === 'saved' && 'Saved.'}
                  {saveStatus === 'error' && 'Save failed.'}
                  {saveStatus === 'idle' && 'Unsaved.'}
                </span>
              </div>

              {loadError && (
                <div className="mt-2 rounded border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {loadError}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 text-center text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
        WASD to move. Press E to interact.
      </div>
    </div>
  );
}

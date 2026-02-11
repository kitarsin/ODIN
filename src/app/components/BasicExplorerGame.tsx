import { useEffect, useRef, useState } from 'react';

const TILE_SIZE = 16;
const MOVE_DELAY_MS = 120;
const INTERACT_DELAY_MS = 220;

const GRID_COLS = 20;
const GRID_ROWS = 20;
const COLORS = {
  background: '#0b0f14',
  floor: '#1c2533',
  floorAlt: '#233142',
  player: '#ffe66d',
  playerShadow: '#ffb703',
  terminal: '#4ecdc4',
  terminalGlow: '#88fff4',
};

type BasicExplorerGameProps = {
  battleActive?: boolean;
  onTerminalInteract?: () => void;
  onExitBattle?: () => void;
};

export function BasicExplorerGame({
  battleActive = false,
  onTerminalInteract,
  onExitBattle
}: BasicExplorerGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const keysRef = useRef<Record<string, boolean>>({});
  const playerRef = useRef({ x: 3, y: 3 });
  const lastMoveRef = useRef(0);
  const lastInteractRef = useRef(0);
  const promptVisibleRef = useRef(false);
  const interactRequestedRef = useRef(false);
  const terminalTimeoutRef = useRef<number | null>(null);

  const [promptVisible, setPromptVisible] = useState(false);
  const [terminalActive, setTerminalActive] = useState(false);
  const [isFocused, setIsFocused] = useState(true);

  const width = GRID_COLS * TILE_SIZE;
  const height = GRID_ROWS * TILE_SIZE;
  const terminalPosition = { x: 14, y: 10 };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const activeElement = document.activeElement;
      const isCanvasFocused = activeElement === canvas || activeElement === canvas.parentElement;
      
      const isTyping =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        (activeElement instanceof HTMLElement && activeElement.isContentEditable);
      
      if (isTyping && !isCanvasFocused) return;
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

    const canvas = canvasRef.current;
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp, { passive: false });

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);
    
    if (canvas) {
      canvas.addEventListener('focus', handleFocus);
      canvas.addEventListener('blur', handleBlur);
      canvas.tabIndex = 0;
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (canvas) {
        canvas.removeEventListener('focus', handleFocus);
        canvas.removeEventListener('blur', handleBlur);
      }
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const canMoveTo = (x: number, y: number) => {
      const inBounds = x >= 0 && y >= 0 && x < GRID_COLS && y < GRID_ROWS;
      const isTerminal = x === terminalPosition.x && y === terminalPosition.y;
      return inBounds && !isTerminal;
    };

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
      if (battleActive) {
        render();
        requestAnimationFrame(step);
        return;
      }

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
        setTerminalActive(true);
        if (onTerminalInteract) {
          onTerminalInteract();
        }
        if (terminalTimeoutRef.current) {
          window.clearTimeout(terminalTimeoutRef.current);
        }
        terminalTimeoutRef.current = window.setTimeout(() => {
          setTerminalActive(false);
        }, 1500);
      }

      render();
      requestAnimationFrame(step);
    };

    render();
    const animationId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationId);
      if (terminalTimeoutRef.current) {
        window.clearTimeout(terminalTimeoutRef.current);
      }
    };
  }, [height, width, battleActive, onTerminalInteract]);

  return (
    <div className="grid h-full min-h-0 w-full grid-rows-[minmax(0,1fr)_auto] gap-2">
      <div className="min-h-0 rounded-2xl border-4 border-border bg-muted/60 p-3 shadow-inner">
        <div className="grid h-full grid-rows-[minmax(0,1fr)_auto] gap-3">
          <div 
            className={`relative rounded-xl border-4 border-border bg-card p-3 transition-all cursor-pointer ${
              isFocused ? 'ring-2 ring-primary/50' : 'hover:ring-2 hover:ring-primary/30'
            }`}
            onClick={() => canvasRef.current?.focus()}
            title="Click to focus for WASD controls"
          >
            <div
              className="absolute left-3 top-3 rounded-md border border-border bg-background/80 px-2 py-1 text-[10px] text-muted-foreground"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {battleActive ? 'BATTLE // ACTIVE' : 'ARENA // VISUAL'}
            </div>
            {battleActive && (
              <button
                type="button"
                onClick={onExitBattle}
                className="absolute right-3 top-3 rounded-md border border-border bg-background/90 px-2 py-1 text-[10px] font-semibold text-foreground hover:bg-muted"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                Exit Battle
              </button>
            )}
            <div className="flex h-full w-full items-center justify-center">
              <div className="aspect-square h-full max-h-full w-full max-w-full">
                {battleActive ? (
                  <div className="h-full w-full rounded-lg bg-muted/40 p-4">
                    <div className="grid h-full grid-rows-[minmax(0,1fr)_auto] gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col items-start gap-2">
                          <div className="rounded-md border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                            HERO // HP 100%
                          </div>
                          <div className="flex h-full w-full items-end">
                            <div className="h-28 w-28 rounded-full border-4 border-border bg-gradient-to-b from-primary/30 to-primary/10" />
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="rounded-md border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                            GLITCHED MAN // HP 100%
                          </div>
                          <div className="flex h-full w-full items-start justify-end">
                            <div className="h-24 w-24 rounded-full border-4 border-border bg-gradient-to-b from-amber-500/40 to-amber-500/10" />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-center">
                        <div className="h-3 w-full max-w-md rounded-full border border-border bg-background">
                          <div className="h-full w-3/5 rounded-full bg-primary" />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <canvas
                    ref={canvasRef}
                    width={width}
                    height={height}
                    className="h-full w-full rounded-lg"
                    style={{ imageRendering: 'pixelated' }}
                  />
                )}
              </div>
            </div>

            {!battleActive && promptVisible && (
              <div
                className="absolute right-3 top-3 rounded-full border border-primary/40 bg-background/90 px-3 py-1 text-[10px] text-primary"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                Press E to interact
              </div>
            )}

            {!battleActive && terminalActive && (
              <div
                className="absolute left-1/2 bottom-3 -translate-x-1/2 rounded-full border border-border bg-background/90 px-3 py-1 text-[10px] text-muted-foreground"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                Terminal linked
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <div className="rounded-md border-2 border-border bg-card px-3 py-2 text-sm font-semibold text-foreground">
              {battleActive ? 'Battle Log' : 'Demo Game'}
            </div>
            <div className="rounded-md border-2 border-border bg-card px-3 py-3 text-xs text-muted-foreground">
              {battleActive
                ? 'Glitched Man challenges you! Cast your code to stabilize the signal.'
                : 'Interact with the terminal and cast your code!'}
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
        {battleActive ? 'Battle engaged. Use the editor to cast code.' : 'WASD to move. Press E to interact.'}
      </div>
    </div>
  );
}

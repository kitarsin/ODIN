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

export function BasicExplorerGame() {
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

  const width = GRID_COLS * TILE_SIZE;
  const height = GRID_ROWS * TILE_SIZE;
  const terminalPosition = { x: 14, y: 10 };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const activeElement = document.activeElement;
      const isTyping =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        (activeElement instanceof HTMLElement && activeElement.isContentEditable);
      if (isTyping) return;
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
  }, [height, width]);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex-1 rounded-2xl border-4 border-border bg-muted/60 p-4 shadow-inner">
        <div className="grid h-full grid-rows-[minmax(0,1fr)_auto] gap-4">
          <div className="relative rounded-xl border-4 border-border bg-card p-3">
            <div
              className="absolute left-3 top-3 rounded-md border border-border bg-background/80 px-2 py-1 text-[10px] text-muted-foreground"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              ARENA // VISUAL
            </div>
            <canvas
              ref={canvasRef}
              width={width}
              height={height}
              className="h-full w-full rounded-lg"
              style={{ imageRendering: 'pixelated' }}
            />

            {promptVisible && (
              <div
                className="absolute right-3 top-3 rounded-full border border-primary/40 bg-background/90 px-3 py-1 text-[10px] text-primary"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                Press E to interact
              </div>
            )}

            {terminalActive && (
              <div
                className="absolute left-1/2 bottom-3 -translate-x-1/2 rounded-full border border-border bg-background/90 px-3 py-1 text-[10px] text-muted-foreground"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                Terminal linked
              </div>
            )}
          </div>

          <div className="grid gap-3">
            <div className="rounded-md border-2 border-border bg-card px-3 py-2 text-sm font-semibold text-foreground">
              Glitched Man
            </div>
            <div className="rounded-md border-2 border-border bg-card px-3 py-3 text-xs text-muted-foreground">
              His color array elements have been declared incorrectly! Decrement his G exposure (2nd index).
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 text-center text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
        WASD to move. Press E to interact.
      </div>
    </div>
  );
}

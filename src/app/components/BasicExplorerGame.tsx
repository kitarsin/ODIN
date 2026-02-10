import { useEffect, useRef } from 'react';

const MAP = [
  '############################',
  '#............##............#',
  '#..######....##....######..#',
  '#..#....#..........#....#..#',
  '#..#....####..####.#....#..#',
  '#..............#..........##',
  '###..####..###.#..###..#...#',
  '#....#.....#...#....#..#...#',
  '#..#######.#.#####..#..###.#',
  '#..........#........#......#',
  '############################',
];

const TILE_SIZE = 16;
const MOVE_DELAY_MS = 120;

const COLORS = {
  background: '#0b0f14',
  floor: '#1c2533',
  wall: '#3d546f',
  wallHighlight: '#4f6b8f',
  player: '#ffe66d',
  playerShadow: '#ffb703',
};

export function BasicExplorerGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const keysRef = useRef<Record<string, boolean>>({});
  const playerRef = useRef({ x: 2, y: 2 });
  const lastMoveRef = useRef(0);

  const mapWidth = MAP[0].length;
  const mapHeight = MAP.length;
  const width = mapWidth * TILE_SIZE;
  const height = mapHeight * TILE_SIZE;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (
        key === 'w' ||
        key === 'a' ||
        key === 's' ||
        key === 'd' ||
        key === 'arrowup' ||
        key === 'arrowdown' ||
        key === 'arrowleft' ||
        key === 'arrowright'
      ) {
        keysRef.current[key] = true;
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

    const canMoveTo = (x: number, y: number) => MAP[y]?.[x] && MAP[y][x] !== '#';

    const drawMap = () => {
      context.fillStyle = COLORS.background;
      context.fillRect(0, 0, width, height);

      for (let row = 0; row < mapHeight; row += 1) {
        for (let col = 0; col < mapWidth; col += 1) {
          const tile = MAP[row][col];
          if (tile === '#') {
            context.fillStyle = COLORS.wall;
            context.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            context.fillStyle = COLORS.wallHighlight;
            context.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE / 4);
          } else {
            context.fillStyle = COLORS.floor;
            context.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          }
        }
      }
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

      render();
      requestAnimationFrame(step);
    };

    render();
    const animationId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationId);
  }, [height, mapHeight, mapWidth, width]);

  return (
    <div className="h-full w-full">
      <div className="h-full w-full rounded-lg border-4 border-primary bg-card/60 p-3">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="h-full w-full"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>
      <div className="mt-3 text-center text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
        WASD to move. Arrow keys also supported.
      </div>
    </div>
  );
}

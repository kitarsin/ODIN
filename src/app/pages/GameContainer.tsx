import { useEffect, useRef, useState, useCallback } from 'react';
import { useBlocker } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { GodotGameEmbed } from '../components/GodotGameEmbed';
import { patchSessionEnd } from '../../lib/odinApi';

const API_URL = import.meta.env.VITE_ODIN_API_URL ?? 'http://localhost:5000';

export function GameContainer() {
  const activeSessionId = useRef<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  // Starts true so the blocker is active from mount, regardless of whether
  // the session ID has arrived yet from Godot (fixes race condition).
  const [gameActive, setGameActive] = useState(true);

  // Receive session ID from Godot iframe via postMessage
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.data?.type === 'odin_session_started') {
        activeSessionId.current = e.data.sessionId;
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  // Best-effort end on tab close / browser refresh
  useEffect(() => {
    function onBeforeUnload() {
      if (activeSessionId.current) {
        navigator.sendBeacon(`${API_URL}/api/session/${activeSessionId.current}/end`);
      }
    }
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  // Block in-app navigation while the game page is active
  const blocker = useBlocker(() => gameActive);

  useEffect(() => {
    if (blocker.state === 'blocked') setShowLeaveModal(true);
  }, [blocker.state]);

  const handleConfirmLeave = useCallback(async () => {
    // Tell Godot to flush the player's current position to the server
    // before we end the session, so the spawn point is always up to date.
    iframeRef.current?.contentWindow?.postMessage({ type: 'odin_save_request' }, '*');
    await new Promise(r => setTimeout(r, 500));

    if (activeSessionId.current) {
      await patchSessionEnd(activeSessionId.current).catch(() => {});
      activeSessionId.current = null;
    }
    setGameActive(false);
    setShowLeaveModal(false);
    blocker.proceed?.();
  }, [blocker]);

  const handleCancelLeave = useCallback(() => {
    setShowLeaveModal(false);
    blocker.reset?.();
  }, [blocker]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <Navigation />
      <div className="flex flex-1 overflow-hidden">
        <GodotGameEmbed ref={iframeRef} />
      </div>

      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-card border border-border rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Leave Battle?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Your current session will be saved and ended. You can continue from
              your last checkpoint when you return.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelLeave}
                className="px-4 py-2 text-sm rounded border border-border hover:bg-muted transition-colors"
              >
                Stay
              </button>
              <button
                onClick={handleConfirmLeave}
                className="px-4 py-2 text-sm rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Save & Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

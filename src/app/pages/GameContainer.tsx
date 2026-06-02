import { useEffect, useRef, useState, useCallback } from 'react';
import { useBlocker } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { GodotGameEmbed } from '../components/GodotGameEmbed';
import { WikiSidebar } from '../components/WikiSidebar';
import { patchSessionEnd } from '../../lib/odinApi';
import { useAuth } from '../context/AuthContext';
import { AchievementModal } from '../components/AchievementModal';
import { getAchievementDetail } from '../utils/achievementCatalog';

const API_URL = import.meta.env.VITE_ODIN_API_URL ?? 'http://localhost:5000';

export function GameContainer() {
  const { addAchievement } = useAuth();
  const activeSessionId = useRef<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [achievementQueue, setAchievementQueue] = useState<string[]>([]);
  const [shownAchievement, setShownAchievement] = useState<string | null>(null);
  // Starts true so the blocker is active from mount, regardless of whether
  // the session ID has arrived yet from Godot (fixes race condition).
  const [gameActive] = useState(true);

  // Drain achievement queue one-at-a-time; save each to the profile immediately
  useEffect(() => {
    if (shownAchievement !== null || achievementQueue.length === 0) return;
    const [next, ...rest] = achievementQueue;
    setAchievementQueue(rest);
    setShownAchievement(next);
    const detail = getAchievementDetail(next);
    void addAchievement({ name: detail.name, emoji: detail.emoji, description: detail.description, unlockedAt: new Date().toISOString(), type: 'success' });
  }, [achievementQueue, shownAchievement]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAchievementClose = useCallback(() => setShownAchievement(null), []);

  // Receive messages from Godot iframe
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.data?.type === 'odin_session_started') {
        activeSessionId.current = e.data.sessionId;
      }
      if (e.data?.type === 'odin_achievements_unlocked') {
        const names: string[] = Array.isArray(e.data.achievements) ? e.data.achievements : [];
        if (names.length > 0) setAchievementQueue(q => [...q, ...names]);
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  // Handle browser closure: 1. Show prompt, 2. Cleanup session on actual exit
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      // Prompt if there is an active session OR if the game is simply active.
      // Modern browsers require a user interaction on the page before they will show this prompt.
      if (activeSessionId.current || gameActive) {
        e.preventDefault();
        // Included for legacy support and to satisfy modern browser requirements
        e.returnValue = 'Are you sure you want to leave? Your progress will be saved.';
        return 'Are you sure you want to leave? Your progress will be saved.';
      }
    };

    const onUnload = () => {
      if (activeSessionId.current) {
        navigator.sendBeacon(`${API_URL}/api/session/${activeSessionId.current}/end`);
      }
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    window.addEventListener('unload', onUnload);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      window.removeEventListener('unload', onUnload);
    };
  }, [gameActive]);

  // Block in-app navigation while the game page is active
  const blocker = useBlocker(() => gameActive);

  useEffect(() => {
    if (blocker.state === 'blocked') setShowLeaveModal(true);
  }, [blocker.state]);

  const handleConfirmLeave = useCallback(async () => {
    // Guard: only proceed when the blocker is actually holding a navigation.
    // Without this, rapid clicks call proceed() after the blocker has already
    // transitioned to "unblocked", causing the React Router state error.
    if (blocker.state !== 'blocked') return;

    iframeRef.current?.contentWindow?.postMessage({ type: 'odin_save_request' }, '*');
    await new Promise(r => setTimeout(r, 500));

    if (activeSessionId.current) {
      await patchSessionEnd(activeSessionId.current).catch(() => {});
      activeSessionId.current = null;
    }
    setShowLeaveModal(false);
    // proceed() while the blocker is still in "blocked" state — don't call
    // setGameActive(false) first or React Router flips to "unblocked" before
    // proceed() runs, which triggers the invalid state transition error.
    blocker.proceed();
  }, [blocker]);

  const handleCancelLeave = useCallback(() => {
    setShowLeaveModal(false);
    blocker.reset?.();
  }, [blocker]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <Navigation />
      <div className="flex flex-1 overflow-hidden">
        <WikiSidebar />
        <div className="flex-1 min-w-0 overflow-hidden">
          <GodotGameEmbed ref={iframeRef} />
        </div>
      </div>

      {shownAchievement && (() => {
        const d = getAchievementDetail(shownAchievement);
        return (
          <AchievementModal
            isOpen
            onClose={handleAchievementClose}
            data={{ status: 'success', badgeName: d.name, badgeEmoji: d.emoji, title: 'Achievement Unlocked!', description: d.description, successMessage: 'Added to your profile.' }}
          />
        );
      })()}

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

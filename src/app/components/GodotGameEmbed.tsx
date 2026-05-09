import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';

const GAME_PATH = '/godot/index.html';

export function GodotGameEmbed() {
  const { user } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      (window as any).__ODIN_GAME_CONFIG = {
        apiUrl: import.meta.env.VITE_ODIN_API_URL ?? 'http://localhost:5000',
        userId: user.id,
        token:  session?.access_token ?? '',
      };
      setReady(true);
    });
  }, [user]);

  if (!ready) {
    return (
      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
        Initialising game…
      </div>
    );
  }

  return (
    <iframe
      src={GAME_PATH}
      className="h-full w-full border-none"
      allow="autoplay; gamepad"
      title="ODIN Game"
    />
  );
}

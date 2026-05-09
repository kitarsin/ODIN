import { Navigation } from '../components/Navigation';
import { GodotGameEmbed } from '../components/GodotGameEmbed';

export function GameContainer() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <Navigation />
      <div className="flex flex-1 overflow-hidden">
        <GodotGameEmbed />
      </div>
    </div>
  );
}

import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function LandingPageLink({ confirmLeaving = false, className = '' }: { confirmLeaving?: boolean; className?: string }) {
  return (
    <Link
      to="/"
      onClick={(event) => {
        if (confirmLeaving && !window.confirm('Leave the assessment? Your current progress may be lost.')) event.preventDefault();
      }}
      className={`inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary ${className}`}
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      Back to landing page
    </Link>
  );
}

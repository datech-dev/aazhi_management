import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
        <FileQuestion className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-bold font-heading mb-2">Page Not Found</h1>
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        The page or resource you requested could not be located on Aazhi Designer Studio.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Dashboard
      </Link>
    </div>
  );
}

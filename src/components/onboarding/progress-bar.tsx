import { APP_NAME } from "@/lib/constants";

interface ProgressBarProps {
  progress: number;
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ progress, currentStep, totalSteps }: ProgressBarProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">B</span>
        </div>
        <span className="text-xl font-bold tracking-tight">{APP_NAME}</span>
      </div>
      <div className="space-y-2">
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-center text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </p>
      </div>
    </div>
  );
}

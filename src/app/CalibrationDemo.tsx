import { SystemCalibration } from '@/app/components/SystemCalibration';

// Demo component to showcase the System Calibration module
// This bypasses the auth screen and goes straight to calibration
export default function CalibrationDemo() {
  const handleCalibrationComplete = (result: any) => {
    console.log('Calibration Complete!', result);
    alert(`Calibration Complete!\n\nRank: ${result.rank}\nLevel: ${result.level}\nScore: ${result.totalCorrect}/${result.totalQuestions}\n\nLogic: ${result.scores.logic}%\nSyntax: ${result.scores.syntax}%\nOptimization: ${result.scores.optimization}%`);
  };

  return (
    <div className="w-[1920px] h-[1080px] overflow-hidden">
      <SystemCalibration onComplete={handleCalibrationComplete} />
    </div>
  );
}

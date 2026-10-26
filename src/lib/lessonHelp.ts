/** Fade guidance evenly between the first and last exercise; never fade the target text. */
export function keyboardHelpOpacity(exerciseIndex: number, exerciseCount: number): number {
  if (exerciseCount <= 1) return 1;
  return 1 - Math.max(0, Math.min(exerciseIndex, exerciseCount - 1)) / (exerciseCount - 1);
}

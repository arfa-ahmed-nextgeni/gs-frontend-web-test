export const RadioButtonVisual = ({ isSelected }: { isSelected: boolean }) => {
  return (
    <div className="border-border-primary flex size-5 items-center justify-center rounded-full border-2">
      {isSelected && <span className="bg-bg-brand size-3 rounded-full" />}
    </div>
  );
};

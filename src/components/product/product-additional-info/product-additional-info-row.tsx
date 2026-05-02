export const ProductAdditionalInfoRow = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div className="flex flex-row">
    <p className="text-text-primary w-[40%] text-sm font-bold lg:w-[15%]">
      {label}
    </p>
    <p className="text-text-primary flex-1 text-sm font-normal">{value}</p>
  </div>
);

type Option = {
  label: string;
  value: string;
};

export const groupByAlphabet = (items: Option[]): Record<string, Option[]> => {
  return items.reduce<Record<string, Option[]>>((acc, item) => {
    const firstLetter = item.label.trim().charAt(0);
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(item);
    return acc;
  }, {});
};

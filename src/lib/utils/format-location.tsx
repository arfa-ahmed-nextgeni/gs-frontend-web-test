export function formatLocation(address: any) {
  let formattedAddress = {};
  if (address) {
    formattedAddress = removeEmpty(address);
  }
  return Object.values(formattedAddress).slice(2, 3).reverse().join(", ");
}

function removeEmpty(obj: any): any {
  return (
    Object.entries(obj)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, v]) => v != null)
      .reduce(
        (acc, [k, v]) => ({
          ...acc,
          [k]: v === Object(v) ? removeEmpty(v) : v,
        }),
        {}
      )
  );
}

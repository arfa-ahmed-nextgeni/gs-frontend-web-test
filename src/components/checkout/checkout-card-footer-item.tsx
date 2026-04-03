type FooterItemProps = {
  id: number;
  name: string;
  price: string;
};
export const CheckoutCardFooterItem: React.FC<{ item: FooterItemProps }> = ({
  item,
}) => {
  return (
    <div className="text-brand-dark flex w-full items-center">
      <span className={` ${item.name == "Order total" && "font-bold"}`}>
        {item.name}
      </span>
      <span
        className={`text-brand-dark shrink-0 ltr:ml-auto rtl:mr-auto ${item.name == "Order total" ? "text-2xl font-bold" : "font-medium"}`}
      >
        {item.price}
      </span>
    </div>
  );
};

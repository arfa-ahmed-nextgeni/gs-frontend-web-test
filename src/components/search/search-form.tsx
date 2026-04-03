import React from "react";

import SearchIcon from "@/components/icons/search-icon";
import { cn } from "@/lib/utils";

type SearchBoxProps = {
  inputProps?: React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >;
  onFocus?: (e: React.SyntheticEvent) => void;
  onSubmit: (e: React.SyntheticEvent) => void;
  placeholder?: string;
  searchId?: string;
  value: string;
};

export const SearchForm = ({
  inputProps,
  onFocus,
  onSubmit,
  placeholder,
  searchId = "search",
  value,
}: SearchBoxProps) => {
  const { className, ...restInputProps } = inputProps || {};

  const handleClear = () => {
    if (restInputProps.onChange) {
      const syntheticEvent = {
        currentTarget: { value: "" },
        target: { value: "" },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      restInputProps.onChange(syntheticEvent);
    }
  };

  return (
    <form
      className="relative flex w-full"
      noValidate
      onSubmit={onSubmit}
      role="search"
    >
      <span className="ltr:lg:left-7.5 rtl:lg:right-7.5 absolute top-0 flex h-full shrink-0 items-center justify-center focus:outline-none ltr:left-5 rtl:right-5">
        <SearchIcon />
      </span>
      <label className="flex flex-1 items-center py-0.5" htmlFor={searchId}>
        <input
          aria-label={searchId}
          autoComplete="off"
          className={cn(
            "rounded-4xl text-text-primary lg:ltr:pl-17.5 lg:rtl:pr-17.5 ltr:pl-12.5 rtl:pr-12.5 placeholder:text-text-placeholder bg-bg-surface focus:bg-bg-default w-full border-none py-[10px] text-base font-normal outline-none focus:border-transparent focus:ring-0 lg:text-sm ltr:pr-5 lg:ltr:pr-12 rtl:pl-5 lg:rtl:pl-12",
            className
          )}
          id={searchId}
          onFocus={onFocus}
          placeholder={placeholder}
          value={value}
          {...restInputProps}
        />
      </label>
      {value && (
        <button
          aria-label="Clear search"
          className="ltr:lg:right-7.5 rtl:lg:left-7.5 absolute top-0 flex h-full shrink-0 items-center justify-center focus:outline-none ltr:right-5 rtl:left-5"
          onClick={handleClear}
          type="button"
        >
          <svg
            className="text-gray-500 hover:text-gray-700"
            fill="none"
            height="15"
            viewBox="0 0 15 15"
            width="15"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12.8054 2.20088C11.3986 0.794069 9.49154 0 7.50324 0C6.0214 0 4.57082 0.437676 3.33282 1.26301C2.10108 2.08834 1.13819 3.26381 0.569211 4.63311C0.000232402 6.00241 -0.143575 7.50926 0.14404 8.9661C0.431655 10.4229 1.15069 11.761 2.19486 12.8051C3.23903 13.8493 4.58332 14.5683 6.0339 14.856C7.48448 15.1436 8.99759 14.9998 10.3669 14.4308C11.7362 13.8618 12.9117 12.8989 13.737 11.6672C14.5623 10.4354 15 8.98485 15 7.49676C15 5.50846 14.2059 3.60144 12.7991 2.19463L12.8054 2.20088ZM10.0042 9.12241C10.1168 9.24121 10.1793 9.39752 10.1793 9.56009C10.1793 9.72265 10.1105 9.87896 9.99799 9.99776C9.8792 10.1166 9.72288 10.1791 9.56032 10.1791C9.39775 10.1791 9.24144 10.1166 9.12264 10.004L7.50324 8.38461L5.88384 10.004C5.76505 10.1166 5.60873 10.1791 5.44617 10.1791C5.2836 10.1791 5.12729 10.1103 5.00849 9.99776C4.88969 9.88521 4.82717 9.72265 4.82717 9.56009C4.82717 9.39752 4.88969 9.24121 5.00224 9.12241L6.62164 7.50301L5.00224 5.88361C4.88969 5.76481 4.82717 5.6085 4.82717 5.44593C4.82717 5.28337 4.89595 5.12706 5.00849 5.00826C5.12104 4.88946 5.2836 4.82694 5.44617 4.82694C5.60873 4.82694 5.76505 4.88946 5.88384 5.00201L7.50324 6.62141L9.12264 5.00201C9.24144 4.88321 9.39775 4.82068 9.56657 4.82068C9.73539 4.82068 9.8917 4.88946 10.0105 5.00201C10.1293 5.11455 10.1918 5.27712 10.1918 5.44593C10.1918 5.61475 10.123 5.77107 10.0105 5.88986L8.3911 7.50926L10.0105 9.12866L10.0042 9.12241Z"
              fill="#BDC2C5"
            />
          </svg>
        </button>
      )}
    </form>
  );
};

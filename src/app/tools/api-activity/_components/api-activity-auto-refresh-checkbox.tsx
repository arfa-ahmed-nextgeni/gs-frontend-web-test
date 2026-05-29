"use client";

export function ApiActivityAutoRefreshCheckbox({
  defaultChecked,
}: {
  defaultChecked: boolean;
}) {
  return (
    <label className="text-text-secondary flex items-center gap-2 text-sm">
      <input
        className="accent-[--color-bg-primary]"
        defaultChecked={defaultChecked}
        name="autoRefresh"
        onChange={(event) => {
          event.currentTarget.form?.requestSubmit();
        }}
        type="checkbox"
        value="1"
      />
      Enable auto refresh every 5 seconds
    </label>
  );
}

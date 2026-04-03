export default function CustomerProfileLoading() {
  return (
    <div className="lg:mt-12.5 px-2.5 lg:px-0">
      <div className="gap-y-7.5 mt-7.5 grid animate-pulse grid-cols-2 gap-x-2.5">
        <div className="col-span-2 grid grid-cols-2 gap-x-2.5 gap-y-5">
          <span className="w-25 col-span-2 h-5 rounded bg-gray-200 lg:hidden" />
          <span className="h-12.5 rounded-xl bg-gray-200" />
          <span className="h-12.5 rounded-xl bg-gray-200" />
        </div>
        <div className="col-span-2 flex flex-col gap-5">
          <span className="w-25 col-span-2 h-5 rounded bg-gray-200" />
          <div className="flex flex-row gap-2.5">
            <span className="h-12.5 w-30 rounded-xl bg-gray-200" />
            <span className="h-12.5 flex-1 rounded-xl bg-gray-200" />
          </div>
        </div>
        <span className="h-12.5 col-span-2 rounded-xl bg-gray-200" />
        <div className="col-span-2 flex flex-col gap-5">
          <span className="w-25 col-span-2 h-5 rounded bg-gray-200" />
          <span className="h-12.5 col-span-2 rounded-xl bg-gray-200" />
        </div>
        <div className="col-span-2 flex flex-col gap-5">
          <span className="w-25 col-span-2 h-5 rounded bg-gray-200" />
          <div className="gap-30 flex flex-row">
            <div className="flex items-center gap-5">
              <span className="size-5 rounded-full bg-gray-200" />
              <span className="w-17 col-span-2 h-6 rounded bg-gray-200" />
            </div>
            <div className="flex items-center gap-5">
              <span className="size-5 rounded-full bg-gray-200" />
              <span className="w-17 col-span-2 h-6 rounded bg-gray-200" />
            </div>
          </div>
        </div>
        <div className="h-12.5 bg-btn-bg-primary col-span-2 mt-20 flex w-full items-center justify-center rounded-xl lg:col-span-1 lg:col-start-2">
          <span className="w-34 col-span-2 h-6 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

/* eslint-disable @next/next/no-html-link-for-pages */
import { NotFoundPage } from "@/components/shared/not-found-page";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <NotFoundPage
      action={
        <Button
          asChild
          className="bg-btn-bg-primary text-text-inverse hover:bg-btn-bg-primary/90 h-12.5 min-w-67.5 rounded-xl px-5 text-xl font-medium"
        >
          <a href="/">Continue Shopping</a>
        </Button>
      }
      className="min-h-dvh justify-center"
      description="Use the search bar or visit our homepage to continue shopping."
      title="Sorry! The page you're looking for cannot be found."
    />
  );
}

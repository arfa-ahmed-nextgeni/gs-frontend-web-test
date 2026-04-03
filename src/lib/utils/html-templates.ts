const SPINNER_SVG = `<svg class="spinner" width="40" height="40" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path opacity="0.2" d="M20 10C20 15.5228 15.5228 20 10 20C4.47715 20 0 15.5228 0 10C0 4.47715 4.47715 0 10 0C15.5228 0 20 4.47715 20 10ZM2.5 10C2.5 14.1421 5.85786 17.5 10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10Z" fill="#374957"/>
  <path d="M1.25 10C0.559644 10 -0.00805893 9.43816 0.0780092 8.75319C0.320399 6.82414 1.12155 4.99763 2.39594 3.50552C3.9423 1.69497 6.08394 0.495592 8.43566 0.123116C10.7874 -0.249359 13.1948 0.229513 15.225 1.4736C16.8981 2.49888 18.2245 3.98842 19.0511 5.74815C19.3446 6.373 18.9783 7.08277 18.3217 7.2961C17.6652 7.50943 16.9689 7.14319 16.6496 6.53112C16.0247 5.3333 15.0838 4.31916 13.9187 3.6052C12.3961 2.67213 10.5905 2.31298 8.82674 2.59234C7.06295 2.87169 5.45672 3.77123 4.29696 5.12914C3.40952 6.16819 2.82806 7.42345 2.60392 8.75573C2.48938 9.43652 1.94036 10 1.25 10Z" fill="#374957"/>
</svg>`;

const STYLES = `<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    background-color: #f9f9f9;
    color: #374957;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 1rem;
  }
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    text-align: center;
  }
  .spinner {
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .text {
    font-size: 1rem;
    line-height: 1.5;
    color: #374957;
  }
  .link {
    color: #6543f5;
    text-decoration: underline;
  }
  .link:hover {
    text-decoration: none;
  }
  .secondary-text {
    font-size: 0.875rem;
    color: #85878a;
  }
</style>`;

interface RedirectHtmlOptions {
  primaryText?: string;
  redirectUrl: string;
  secondaryText?: string;
  showSpinner?: boolean;
  title?: string;
}

export function createErrorHtml({
  heading = "Bad Request",
  message = "An error occurred.",
  title = "Error",
}: {
  heading?: string;
  message?: string;
  title?: string;
} = {}): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        ${STYLES}
      </head>
      <body>
        <div class="container">
          <h1 class="text">${heading}</h1>
          <p class="secondary-text">${message}</p>
        </div>
      </body>
    </html>
  `.trim();
}

export function createRedirectHtml({
  primaryText = "Redirecting...",
  redirectUrl,
  secondaryText,
  showSpinner = true,
  title = "Redirecting...",
}: RedirectHtmlOptions): string {
  const secondaryContent = secondaryText
    ? `<p class="secondary-text">
        ${secondaryText}
        <a href="${redirectUrl}" class="link">click here</a>.
      </p>`
    : "";

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
        <meta http-equiv="refresh" content="0; url=${redirectUrl}" />
        <link rel="canonical" href="${redirectUrl}" />
        ${STYLES}
      </head>
      <body>
        <div class="container">
          ${showSpinner ? SPINNER_SVG : ""}
          <p class="text">${primaryText}</p>
          ${secondaryContent}
        </div>
        <script>
          window.location.replace("${redirectUrl}");
        </script>
      </body>
    </html>
  `.trim();
}

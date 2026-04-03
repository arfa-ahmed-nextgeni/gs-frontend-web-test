# Apple Pay Domain Association Files

This directory contains Apple Pay domain association files organized by domain name.

## File Structure

Store files in domain-specific folders:

```
public/.well-known/
  ├── dev.web.goldenscent.com/
  │   └── apple-developer-merchantid-domain-association      (Dev SA)
  ├── goldenscent.com/
  │   └── apple-developer-merchantid-domain-association      (Prod SA)
  ├── dev-ae.web.goldenscent.com/
  │   └── apple-developer-merchantid-domain-association      (Dev UAE)
  ├── ae.goldenscent.com/
  │   └── apple-developer-merchantid-domain-association     (Prod UAE)
  ├── dev-kw.web.goldenscent.com/
  │   └── apple-developer-merchantid-domain-association      (Dev Kuwait)
  ├── kw.goldenscent.com/
  │   └── apple-developer-merchantid-domain-association      (Prod Kuwait)
  └── ... (same pattern for other countries)
```

## How to Add Files

1. Go to [Apple Developer Portal](https://developer.apple.com/account/resources/identifiers/list/merchant)
2. Generate domain association file for each domain
3. Create a folder with the exact domain name in `public/.well-known/`
4. Save the file as `apple-developer-merchantid-domain-association` inside that folder

**Example:**

- For `dev.web.goldenscent.com`:

  - Create folder: `public/.well-known/dev.web.goldenscent.com/`
  - Save file: `public/.well-known/dev.web.goldenscent.com/apple-developer-merchantid-domain-association`

- For `ae.goldenscent.com`:
  - Create folder: `public/.well-known/ae.goldenscent.com/`
  - Save file: `public/.well-known/ae.goldenscent.com/apple-developer-merchantid-domain-association`

## File Access

Files are served dynamically via Next.js routes:

- `/.well-known/apple-developer-merchantid-domain-association` (without .txt)
- `/.well-known/apple-developer-merchantid-domain-association.txt` (with .txt)

The routes automatically detect the request hostname and serve the file from the matching domain folder.

## Fallback

If no domain-specific file is found, the system falls back to:

- `public/.well-known/apple-developer-merchantid-domain-association` (for localhost or unmatched domains)

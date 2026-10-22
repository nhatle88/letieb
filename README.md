# Letieb

Personal home of Chris Nhat Le: [letieb.com](https://letieb.com).

A plain static site with no build step. Open `index.html` in a browser to see it.

## Files

- `index.html`: page structure, welcome text and "My story"
- `data.js`: chapters (timeline), themes, featured notes and links. Edit this to grow the site.
- `main.js`: turns `data.js` into the page sections
- `styles.css`: look and feel, light and dark mode
- `images/`: portrait and workspace photos

## Adding things

- **New life chapter:** copy an entry in `chapters` in `data.js`, then change `when`, `title`, `text`, `tag` and optionally `link`.
- **New place to link to:** add an entry to `links`. An entry with `url: null` shows as a "coming soon" card.
- **Featured note:** add an entry to `notes`.

## Publishing

Upload the whole folder to any static host (GitHub Pages, Netlify, Cloudflare Pages, Vercel), then point `letieb.com` at it.

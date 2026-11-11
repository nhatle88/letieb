# Letieb

The house of Chris Nhat Le and his family: [letieb.com](https://letieb.com).

*Letieb* is *Beitel* read backwards: Bethel, "House of God". The site stands on Joshua 24:15: "As for me and my house, we will serve the LORD."

A plain static site with no build step. Open `index.html` in a browser to see it.

## Files

- `index.html`: page structure, the hero, "The house" text and "My story"
- `data.js`: everything that grows. The verse, family members, career, chapters, themes, notes and rooms
- `main.js`: turns `data.js` into the page, one function per section. Also loads the Books shelf from books.letieb.com
- `styles.css`: look and feel, light and dark, ordered like the page
- `images/`: portrait and workspace photos
- `sunandbee/`: the Sun & Bee love story page

## Adding things

Everything below is one entry in `data.js`. Copy an existing entry and edit it.

- **Family member:** `house.members`. `soon: true` shows the card as "being prepared".
- **Life chapter:** `chapters`, with a `tag` of Family, Work, Growth, Travel or Faith. The filter above the timeline builds itself from the tags used.
- **Room:** `rooms`, in the group it belongs to. `lock: true` marks a room that needs a sign-in; `url: null` marks one that is still being built.
- **Featured note:** `notes`.

After changing `data.js`, `main.js` or `styles.css`, bump the `?v=` value on their tags in `index.html` (any new text works, such as today's date). Otherwise visitors' browsers can keep showing the old version for a while.

## Publishing

Commit and push to `main`. GitHub Pages publishes it to letieb.com within a minute or two.

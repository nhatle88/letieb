// Renders the sections that come from data.js.
(function () {
  const data = window.LETIEB;
  if (!data) return;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function anchor(url, className, text) {
    const a = el("a", className, text);
    a.href = url;
    if (/^https?:/.test(url)) {
      a.target = "_blank";
      a.rel = "noopener";
    }
    return a;
  }

  const timeline = document.getElementById("timeline");
  data.chapters.forEach((c) => {
    const li = el("li", "chapter");
    li.append(el("span", "chapter-when", c.when));
    const body = el("div", "chapter-body");
    const head = el("div", "chapter-head");
    head.append(el("h3", null, c.title), el("span", "tag tag-" + c.tag.toLowerCase(), c.tag));
    body.append(head, el("p", null, c.text));
    if (c.link) body.append(anchor(c.link.url, "chapter-link", c.link.label + " →"));
    li.append(body);
    timeline.append(li);
  });

  const themes = document.getElementById("themes");
  data.themes.forEach((t) => {
    const li = el("li");
    const a = anchor(t.url, "theme");
    a.append(el("span", "theme-name", t.name), el("span", "theme-text", t.text));
    li.append(a);
    themes.append(li);
  });

  const notes = document.getElementById("notes-list");
  data.notes.forEach((n) => {
    const li = el("li");
    const a = anchor(n.url, "note");
    a.append(el("span", "note-date", n.date), el("span", "note-title", n.title), el("span", "note-hook", n.hook));
    li.append(a);
    notes.append(li);
  });

  const roles = document.getElementById("roles");
  data.career.roles.forEach((r) => {
    const li = el("li", r.current ? "role is-current" : "role");
    li.append(el("span", "role-when", r.when));
    const body = el("div", "role-body");
    body.append(el("h3", null, r.title));
    body.append(r.url ? anchor(r.url, "role-org", r.org) : el("span", "role-org", r.org));
    if (r.text) body.append(el("p", null, r.text));
    li.append(body);
    roles.append(li);
  });

  [["programs", "programs"], ["education", "education"]].forEach(([key, id]) => {
    const list = document.getElementById(id);
    data.career[key].forEach((item) => {
      const li = el("li", "career-item");
      li.append(el("span", "career-when", item.when), el("span", "career-name", item.name));
      if (item.text) li.append(el("span", "career-text", item.text));
      list.append(li);
    });
  });

  const links = document.getElementById("links");
  data.links.forEach((l) => {
    const li = el("li");
    const card = l.url ? anchor(l.url, "link-card") : el("div", "link-card is-soon");
    card.append(el("span", "link-name", l.name), el("span", "link-text", l.text));
    li.append(card);
    links.append(li);
  });

  // ---- Books, read live from books.letieb.com ----
  // ?books=<origin> points the shelf at a test server, e.g. ?books=http://127.0.0.1:8788
  const BOOKS = new URLSearchParams(location.search).get("books") || "https://books.letieb.com";
  const shelf = document.getElementById("shelf");
  const dialog = document.getElementById("book-dialog");

  const longDate = (iso) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const monthYear = (iso) => new Date(iso).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const progress = (b) => (b.totalPages ? Math.min(100, Math.round((b.currentPage / b.totalPages) * 100)) : 0);

  // A cover image, or a typeset stand-in when there is none (or it fails to load)
  function cover(book, size) {
    const blank = () => {
      const art = el("span", `cover cover-${size} cover-blank`);
      art.setAttribute("aria-hidden", "true"); // the title is already written next to it
      art.append(el("span", "cover-blank-title", book.title), el("span", "cover-blank-author", book.author));
      return art;
    };
    if (!book.cover) return blank();
    const art = el("span", `cover cover-${size}`);
    const img = el("img");
    img.src = book.cover;
    img.alt = `Cover of ${book.title}`;
    img.loading = "lazy";
    img.addEventListener("error", () => art.replaceWith(blank()));
    art.append(img);
    return art;
  }

  function openBook(book) {
    const close = el("button", "dialog-close", "×");
    close.type = "button";
    close.setAttribute("aria-label", "Close");
    close.addEventListener("click", () => dialog.close());

    const text = el("div", "book-dialog-text");
    text.append(
      el("p", "eyebrow", book.status === "completed" ? `Finished ${monthYear(book.dateCompleted)}` : "Reading now"),
      el("h3", null, book.title)
    );
    text.lastChild.id = "book-dialog-title";
    text.append(el("p", "book-dialog-author", book.author));
    if (book.status === "reading" && book.totalPages) {
      const track = el("span", "bar-track");
      const fill = el("span", "bar-fill");
      fill.style.width = `${progress(book)}%`;
      track.append(fill);
      text.append(track, el("p", "muted", `Page ${book.currentPage} of ${book.totalPages}`));
    }

    const notes = el("div", "book-dialog-notes");
    if (book.notes.length) {
      notes.append(el("h4", null, book.notes.length === 1 ? "My note" : "My notes"));
      [...book.notes].sort((a, b) => b.date.localeCompare(a.date)).forEach((n) => {
        const note = el("blockquote", "book-note");
        note.append(el("p", null, n.text), el("cite", null, longDate(n.date)));
        notes.append(note);
      });
    } else {
      notes.append(el("p", "muted", book.status === "completed" ? "No notes on this one yet." : "Notes come once I’ve read further."));
    }
    notes.append(anchor(`${BOOKS}/#book/${book.id}`, "more-link", "See it in my reading tracker →"));

    const body = el("div", "book-dialog-body");
    body.append(cover(book, "lg"), text);
    dialog.replaceChildren(close, body, notes);
    dialog.showModal();
  }

  // Clicking the dim area around the dialog closes it
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  });

  function bookTile(book) {
    const li = el("li");
    const button = el("button", "book-tile");
    button.type = "button";
    button.append(cover(book, "md"), el("span", "book-tile-title", book.title), el("span", "book-tile-meta",
      book.status === "completed"
        ? [monthYear(book.dateCompleted), book.notes.length ? `${book.notes.length} ${book.notes.length === 1 ? "note" : "notes"}` : ""].filter(Boolean).join(" · ")
        : book.totalPages ? `${progress(book)}% read` : "Reading"));
    button.addEventListener("click", () => openBook(book));
    li.append(button);
    return li;
  }

  function shelfGroup(title, books) {
    const group = el("div", "shelf-group");
    const list = el("ul", "shelf-books");
    books.forEach((b) => list.append(bookTile(b)));
    group.append(el("h3", "shelf-title", title), list);
    return group;
  }

  fetch(`${BOOKS}/api/public`)
    .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
    .then(({ books }) => {
      const reading = books.filter((b) => b.status === "reading");
      const finished = books
        .filter((b) => b.status === "completed")
        .sort((a, b) => (b.dateCompleted || "").localeCompare(a.dateCompleted || ""));
      shelf.replaceChildren();
      if (reading.length) shelf.append(shelfGroup("Reading now", reading));
      if (finished.length) shelf.append(shelfGroup("Finished", finished));
      if (!books.length) shelf.append(el("p", "muted", "The shelf is empty for now."));
    })
    .catch(() => {
      shelf.replaceChildren(el("p", "muted", "The shelf couldn’t be loaded right now."));
    });

  document.getElementById("year").textContent = new Date().getFullYear();
})();

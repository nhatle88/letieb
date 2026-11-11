// Letieb: builds the page from data.js. One function per section, listed at the bottom.
(function () {
  const data = window.LETIEB;
  if (!data) return;

  // ---- Helpers ----
  const $ = (id) => document.getElementById(id);

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  // Links that leave the site open in a new tab; links within it don't
  function anchor(url, className, text) {
    const a = el("a", className, text);
    a.href = url;
    if (/^https?:/.test(url)) {
      a.target = "_blank";
      a.rel = "noopener";
    }
    return a;
  }

  const LOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';

  // ---- The house: verse and family ----
  function renderHouse() {
    const { verse, members } = data.house;
    const quote = el("blockquote", null, `“${verse.text}”`);
    $("verse").append(quote, el("figcaption", null, `${verse.ref} · ${verse.translation}`));

    members.forEach((m) => {
      const li = el("li", m.soon ? "member is-soon" : "member");
      const text = el("div", "member-text");
      text.append(el("h3", null, m.name), el("p", "member-role", m.role), el("p", null, m.text));
      if (m.link) text.append(anchor(m.link.url, "member-link", `${m.link.label} →`));
      li.append(el("span", "member-mark", m.mark), text);
      $("members").append(li);
    });
  }

  // ---- Career ----
  function renderCareer() {
    data.career.roles.forEach((r) => {
      const li = el("li", r.current ? "role is-current" : "role");
      const body = el("div", "role-body");
      body.append(el("h3", null, r.title));
      body.append(r.url ? anchor(r.url, "role-org", r.org) : el("span", "role-org", r.org));
      if (r.text) body.append(el("p", null, r.text));
      li.append(el("span", "role-when", r.when), body);
      $("roles").append(li);
    });

    ["programs", "education"].forEach((key) => {
      data.career[key].forEach((item) => {
        const li = el("li", "career-item");
        li.append(el("span", "career-when", item.when), el("span", "career-name", item.name));
        if (item.text) li.append(el("span", "career-text", item.text));
        $(key).append(li);
      });
    });
  }

  // ---- Chapters: the timeline, with a filter by tag ----
  function renderChapters() {
    const timeline = $("timeline");
    const items = data.chapters.map((c) => {
      const li = el("li", "chapter");
      const body = el("div", "chapter-body");
      const head = el("div", "chapter-head");
      head.append(el("h3", null, c.title), el("span", `tag tag-${c.tag.toLowerCase()}`, c.tag));
      body.append(head, el("p", null, c.text));
      if (c.link) body.append(anchor(c.link.url, "chapter-link", `${c.link.label} →`));
      li.append(el("span", "chapter-when", c.when), body);
      timeline.append(li);
      return { tag: c.tag, li };
    });

    const tags = ["All", ...new Set(data.chapters.map((c) => c.tag))];
    const chips = tags.map((tag) => {
      const chip = el("button", "chip", tag);
      chip.type = "button";
      chip.setAttribute("aria-pressed", String(tag === "All"));
      chip.addEventListener("click", () => {
        chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
        items.forEach((item) => { item.li.hidden = tag !== "All" && item.tag !== tag; });
      });
      $("chapter-filter").append(chip);
      return chip;
    });
  }

  // ---- What I care about ----
  function renderThemes() {
    data.themes.forEach((t) => {
      const li = el("li");
      const a = anchor(t.url, "card theme");
      a.append(el("span", "card-name", t.name), el("span", "card-text", t.text));
      li.append(a);
      $("themes").append(li);
    });
  }

  // ---- Notes ----
  function renderNotes() {
    data.notes.forEach((n) => {
      const li = el("li");
      const a = anchor(n.url, "card note");
      a.append(el("span", "note-date", n.date), el("span", "card-name", n.title), el("span", "card-text", n.hook));
      li.append(a);
      $("notes-list").append(li);
    });
  }

  // ---- Rooms ----
  function renderRooms() {
    data.rooms.forEach((group) => {
      const list = el("ul", "room-list");
      group.items.forEach((room) => {
        const li = el("li");
        const card = room.url ? anchor(room.url, "card room") : el("div", "card room is-soon");
        const name = el("span", "card-name", room.name);
        if (room.lock) {
          const lock = el("span", "room-lock");
          lock.innerHTML = LOCK;
          lock.append("Sign in");
          card.append(lock);
        }
        card.append(name, el("span", "card-text", room.text));
        li.append(card);
        list.append(li);
      });

      const head = el("div", "room-group-head");
      head.append(el("h3", null, group.group), el("span", "muted", group.hint));
      const wrap = el("div", "room-group");
      wrap.append(head, list);
      $("rooms-list").append(wrap);
    });
  }

  // ---- Books: a shelf read live from books.letieb.com, with a pop-up per book ----
  // ?books=<origin> points the shelf at a test server, e.g. ?books=http://127.0.0.1:8788
  function renderBooks() {
    const BOOKS = new URLSearchParams(location.search).get("books") || "https://books.letieb.com";
    const shelf = $("shelf");
    const dialog = $("book-dialog");

    const longDate = (iso) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const monthYear = (iso) => new Date(iso).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    const progress = (b) => (b.totalPages ? Math.min(100, Math.round((b.currentPage / b.totalPages) * 100)) : 0);
    const count = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

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

      const title = el("h3", null, book.title);
      title.id = "book-dialog-title";
      const text = el("div", "book-dialog-text");
      text.append(
        el("p", "eyebrow", book.status === "completed" ? `Finished ${monthYear(book.dateCompleted)}` : "Reading now"),
        title,
        el("p", "book-dialog-author", book.author)
      );
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
      const meta = book.status === "completed"
        ? [monthYear(book.dateCompleted), book.notes.length ? count(book.notes.length, "note") : ""].filter(Boolean).join(" · ")
        : book.totalPages ? `${progress(book)}% read` : "Reading";
      const button = el("button", "book-tile");
      button.type = "button";
      button.append(cover(book, "md"), el("span", "book-tile-title", book.title), el("span", "book-tile-meta", meta));
      button.addEventListener("click", () => openBook(book));
      const li = el("li");
      li.append(button);
      return li;
    }

    function shelfGroup(title, books) {
      const list = el("ul", "shelf-books");
      books.forEach((b) => list.append(bookTile(b)));
      const group = el("div", "shelf-group");
      group.append(el("h3", "label", title), list);
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
  }

  // ---- Menu: a drop-down on phones, and a mark on the section being read ----
  function setUpMenu() {
    const toggle = $("menu-toggle");
    const nav = $("site-nav");
    const links = [...nav.querySelectorAll('a[href^="#"]')];

    const setOpen = (open) => {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    };
    toggle.addEventListener("click", () => setOpen(!nav.classList.contains("is-open")));
    nav.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".site-header")) setOpen(false);
    });

    if (!("IntersectionObserver" in window)) return;
    const byId = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.removeAttribute("aria-current"));
        byId.get(entry.target.id)?.setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-30% 0px -65% 0px" });
    byId.forEach((_, id) => { const section = $(id); if (section) observer.observe(section); });
  }

  // ---- Build the page. Each part is independent, so one failing never blanks the rest ----
  [renderHouse, renderCareer, renderChapters, renderThemes, renderNotes, renderRooms, renderBooks, setUpMenu].forEach((part) => {
    try {
      part();
    } catch (error) {
      console.error(`Letieb: ${part.name} failed`, error);
    }
  });

  $("year").textContent = new Date().getFullYear();
})();

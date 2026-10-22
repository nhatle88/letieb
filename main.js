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

  document.getElementById("year").textContent = new Date().getFullYear();
})();

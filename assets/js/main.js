/* RAWah ELHOWERIS portfolio — renders everything from content/content.json.
   All paths are relative, so the site works from a GitHub Pages sub-folder. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var CASES_DIR = "assets/images/cases/";
  var C = {}, manifest = {};

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null && text !== "") n.textContent = text;
    return n;
  }
  function get(path) {
    return path.split(".").reduce(function (o, k) { return o == null ? o : o[k]; }, C);
  }
  function enc(path) { return path.split("/").map(encodeURIComponent).join("/"); }

  /* ---------- simple text bindings: data-text, data-href, data-mailto ---------- */
  function bind() {
    $$("[data-text]").forEach(function (n) {
      var v = get(n.getAttribute("data-text"));
      if (v == null) return;
      var i = n.getAttribute("data-split");
      n.textContent = i != null ? String(v).split(" ")[+i] || n.textContent : v;
    });
    $$("[data-href]").forEach(function (n) { var v = get(n.getAttribute("data-href")); if (v) n.setAttribute("href", v); });
    $$("[data-mailto]").forEach(function (n) { var v = get(n.getAttribute("data-mailto")); if (v) n.setAttribute("href", "mailto:" + v); });
    $$("[data-slot=\"about-paragraphs\"]").forEach(function (box) {
      (C.about.paragraphs || []).forEach(function (p) { box.appendChild(el("p", "", p)); });
    });
    $("#year").textContent = new Date().getFullYear();
  }

  /* ---------- sections ---------- */
  function timeline() {
    var ol = $("[data-slot=\"timeline\"]");
    C.experience.items.forEach(function (x) {
      var li = el("li", "tl-item reveal");
      li.appendChild(el("p", "tl-date", x.date));
      var body = el("div", "tl-body");
      body.appendChild(el("h3", "tl-role", x.role));
      if (x.employer) body.appendChild(el("p", "tl-employer", x.employer));
      if (x.intro) body.appendChild(el("p", "tl-intro", x.intro));
      var ul = el("ul", "tl-list");
      (x.highlights || []).forEach(function (h) { ul.appendChild(el("li", "", h)); });
      body.appendChild(ul);
      li.appendChild(body);
      ol.appendChild(li);
    });
  }

  function education() {
    var box = $("[data-slot=\"education\"]");
    C.education.items.forEach(function (x) {
      var card = el("article", "edu-card reveal " + (x.featured ? "is-featured" : "is-plain"));
      card.appendChild(el("p", "edu-year", x.year));
      var b = el("div");
      b.appendChild(el("h3", "", x.title));
      b.appendChild(el("p", "edu-inst", x.institution));
      if (x.highlight) b.appendChild(el("p", "edu-note", x.highlight));
      card.appendChild(b);
      box.appendChild(card);
    });
  }

  function registration() {
    var ul = $("[data-slot=\"registration\"]");
    C.registration.items.forEach(function (x) {
      var li = el("li", "reg-card reveal" + (x.primary ? " is-primary" : ""));
      li.appendChild(el("h3", "", x.name));
      if (x.number) {
        var p = el("p", "reg-num", "Registration number ");
        p.appendChild(el("strong", "", x.number));
        li.appendChild(p);
      }
      ul.appendChild(li);
    });
  }

  function skills() {
    var box = $("[data-slot=\"skills\"]");
    C.skills.categories.forEach(function (c, i, all) {
      var b = el("div", "skill-block reveal tone-" + (c.tone || "white") + (c.items.length > 5 || i === all.length - 1 ? " is-wide" : ""));
      b.appendChild(el("h3", "", c.title));
      var ul = el("ul");
      c.items.forEach(function (s) { ul.appendChild(el("li", "", s)); });
      b.appendChild(ul);
      box.appendChild(b);
    });
  }

  function cv() {
    var box = $("[data-slot=\"cv\"]");
    var prof = el("div", "cv-profile");
    prof.appendChild(el("p", "cv-name", C.site.name));
    prof.appendChild(el("p", "cv-role", C.site.title));
    prof.appendChild(el("p", "cv-text", C.cv.profile));
    var a = el("a", "btn btn-primary", C.cv.button);
    a.href = C.site.cvFile; a.setAttribute("download", "");
    prof.appendChild(a);
    box.appendChild(prof);

    var cols = el("div", "cv-cols");
    function block(title, cls) {
      var b = el("div", "cv-block " + (cls || ""));
      b.appendChild(el("h3", "", title));
      var ul = el("ul"); b.appendChild(ul); cols.appendChild(b); return ul;
    }
    function row(ul, main, small) {
      var li = el("li", "", main);
      if (small) li.appendChild(el("small", "", small));
      ul.appendChild(li);
    }
    var ex = block("Experience", "span-2");
    C.experience.items.forEach(function (x) { row(ex, x.role, [x.employer, x.date].filter(Boolean).join(", ")); });
    var ed = block("Education");
    C.education.items.forEach(function (x) { row(ed, x.title, x.institution + ", " + x.year); });
    var rg = block("Professional registration");
    C.registration.items.forEach(function (x) { row(rg, x.name); });
    var ks = block("Key skills", "skills-list span-2");
    C.cv.keySkills.forEach(function (s) { row(ks, s); });
    box.appendChild(cols);
  }

  /* ---------- clinical cases: masonry built from JS columns ---------- */
  function info(folder, file) { return manifest[folder + "/" + file] || null; }

  function tile(c, img) {
    var m = info(c.folder, img.file);
    var base = CASES_DIR + enc(c.folder) + "/";
    var btn = el("button", "tile");
    btn.type = "button";
    var desc = "Clinical case: " + c.name + (img.label ? " (" + img.label.toLowerCase() + ")" : "");
    btn.setAttribute("aria-label", "Enlarge image. " + c.name + (img.label ? ", " + img.label : ""));
    var im = new Image();
    im.alt = img.alt || desc;
    im.decoding = "async";
    im.loading = "lazy";
    var full = base + enc(img.file);
    if (m) {
      btn.style.aspectRatio = m.width + " / " + m.height;
      im.width = m.width; im.height = m.height;
      var sets = m.srcset.map(function (s) { return base + enc(s.file) + " " + s.width + "w"; });
      im.srcset = sets.join(", ");
      im.sizes = "(min-width:1500px) 25vw, (min-width:1000px) 31vw, (min-width:640px) 46vw, 92vw";
      im.src = base + enc(m.srcset[Math.min(1, m.srcset.length - 1)].file);
      full = base + enc(m.srcset[m.srcset.length - 1].file);
    } else {
      im.src = full;
    }
    im.addEventListener("error", function once() {
      im.removeEventListener("error", once);
      im.removeAttribute("srcset"); im.src = base + enc(img.file); full = im.src;
    });
    function shown() { im.classList.add("is-loaded"); }
    im.addEventListener("load", shown);
    if (im.complete && im.naturalWidth) shown();
    btn.appendChild(im);
    if (img.label) btn.appendChild(el("span", "tile-label", img.label));
    btn.addEventListener("click", function () { openLightbox(function () { return full; }, im.alt, c.name); });
    return btn;
  }

  function caseCard(c) {
    var fig = el("figure", "case");
    var media = el("div", "case-media" + (c.images.length === 3 ? " n3" : ""));
    c.images.forEach(function (img) { media.appendChild(tile(c, img)); });
    fig.appendChild(media);
    var cap = el("figcaption"); cap.appendChild(el("span", "", c.name));
    fig.appendChild(cap);
    return fig;
  }

  function weight(c) {                       // rough relative height, used to balance columns
    var r = c.images.map(function (i) {
      var m = info(c.folder, i.file); return m ? m.height / m.width : 0.8;
    });
    if (r.length === 3) return r[0] + Math.max(r[1], r[2]) / 2 + 0.2;
    return r.reduce(function (a, b) { return a + b; }, 0) + 0.2;
  }

  var colCount = 0, host;
  function colsFor() {
    var w = window.innerWidth;
    return w >= 1000 ? 3 : w >= 640 ? 2 : 1;
  }
  function layoutCases(force) {
    var n = colsFor();
    if (!force && n === colCount) return;
    colCount = n;
    host.textContent = "";
    var cols = [], heights = [];
    for (var i = 0; i < n; i++) { var d = el("div", "m-col"); cols.push(d); heights.push(0); host.appendChild(d); }
    C.cases.items.forEach(function (c) {
      var k = heights.indexOf(Math.min.apply(null, heights));
      cols[k].appendChild(caseCard(c));
      heights[k] += weight(c);
    });
  }

  /* ---------- lightbox: one large image, close only ---------- */
  var lb, lbImg, lbCap;
  function openLightbox(getSrc, alt, caption) {
    lbImg.alt = alt; lbImg.src = getSrc(); lbCap.textContent = caption;
    document.body.classList.add("no-scroll");
    if (lb.showModal) lb.showModal(); else lb.setAttribute("open", "");
  }
  function closeLightbox() { if (lb.close) lb.close(); else lb.removeAttribute("open"); }
  function lightbox() {
    lb = $("#lightbox"); lbImg = $("#lightbox-img"); lbCap = $("#lightbox-cap");
    lb.addEventListener("click", closeLightbox);          // close button, image or backdrop
    lb.addEventListener("close", function () { document.body.classList.remove("no-scroll"); lbImg.removeAttribute("src"); });
  }

  /* ---------- navigation ---------- */
  function nav() {
    var header = $(".site-header"), toggle = $(".menu-toggle"), menu = $("#site-nav");
    function setOpen(o) {
      toggle.setAttribute("aria-expanded", o);
      menu.classList.toggle("is-open", o);
      document.body.classList.toggle("no-scroll", o);
    }
    toggle.addEventListener("click", function () { setOpen(toggle.getAttribute("aria-expanded") !== "true"); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { setOpen(false); }); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") { setOpen(false); toggle.focus(); }
    });
    window.addEventListener("resize", function () { if (window.innerWidth > 1100) setOpen(false); });
    function onScroll() { header.classList.toggle("is-scrolled", window.scrollY > 8); }
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true });

    if (!("IntersectionObserver" in window)) return;
    var map = { registration: "education" };             // registration highlights Education
    var links = {};
    $$("a", menu).forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var id = map[e.target.id] || e.target.id;
        $$("a", menu).forEach(function (a) { a.classList.toggle("is-active", a === links[id]); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("main > section[id]").forEach(function (s) { io.observe(s); });
  }

  /* ---------- gentle reveal ---------- */
  function reveal() {
    var items = $$(".reveal");
    if (!("IntersectionObserver" in window)) { items.forEach(function (n) { n.classList.add("is-in"); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    items.forEach(function (n) { io.observe(n); });
  }

  /* ---------- start ---------- */
  function fail(err) {
    var m = el("p", "state-msg", "The content could not be loaded. If you opened index.html directly from a folder, view the site through a local web server or GitHub Pages instead. You can still email " + "rawahelhoweris@gmail.com.");
    var slot = $("[data-slot=\"cases\"]"); if (slot) slot.appendChild(m);
    if (window.console) console.error(err);
    reveal();
  }
  function json(url, optional) {
    return fetch(url).then(function (r) {
      if (!r.ok) { if (optional) return {}; throw new Error(url + " " + r.status); }
      return r.json();
    }).catch(function (e) { if (optional) return {}; throw e; });
  }

  nav();
  lightbox();
  Promise.all([json("content/content.json"), json(CASES_DIR + "manifest.json", true)]).then(function (r) {
    C = r[0]; manifest = r[1];
    bind(); timeline(); education(); registration(); skills(); cv();
    host = $("[data-slot=\"cases\"]");
    layoutCases(true);
    var t; window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(function () { layoutCases(false); }, 150); });
    reveal();
  }).catch(fail);
})();

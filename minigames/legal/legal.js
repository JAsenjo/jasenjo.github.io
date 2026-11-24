(function () {
  var SUPPORTED = ["en", "es", "fr"];
  var STORAGE_KEY = "mgc-legal-lang";

  function normalize(code) {
    if (!code) return null;
    var base = String(code).toLowerCase().split("-")[0];
    return SUPPORTED.indexOf(base) >= 0 ? base : null;
  }

  function detect() {
    var params = new URLSearchParams(window.location.search);
    var fromQuery = normalize(params.get("lang"));
    if (fromQuery) return fromQuery;
    try {
      var stored = normalize(localStorage.getItem(STORAGE_KEY));
      if (stored) return stored;
    } catch (_) {}
    if (navigator.languages) {
      for (var i = 0; i < navigator.languages.length; i++) {
        var hit = normalize(navigator.languages[i]);
        if (hit) return hit;
      }
    }
    return normalize(navigator.language) || "en";
  }

  function apply(lang) {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-lang]").forEach(function (el) {
      el.hidden = el.getAttribute("data-lang") !== lang;
    });
    document.querySelectorAll("[data-set-lang]").forEach(function (btn) {
      var active = btn.getAttribute("data-set-lang") === lang;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
    document.querySelectorAll("a[href]").forEach(function (a) {
      var raw = a.getAttribute("href");
      if (!raw || raw.indexOf("mailto:") === 0 || raw.indexOf("http") === 0) return;
      if (raw.indexOf("privacy-policy.html") < 0 && raw.indexOf("terms-of-service.html") < 0) {
        return;
      }
      var file = raw.indexOf("privacy-policy.html") >= 0
        ? "privacy-policy.html"
        : "terms-of-service.html";
      a.setAttribute("href", file + "?lang=" + lang);
    });
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (_) {}
    var url = new URL(window.location.href);
    url.searchParams.set("lang", lang);
    window.history.replaceState({}, "", url);
    var yearEls = document.querySelectorAll("[data-year]");
    var y = String(new Date().getFullYear());
    yearEls.forEach(function (el) {
      el.textContent = y;
    });
  }

  function init() {
    var lang = detect();
    apply(lang);
    document.querySelectorAll("[data-set-lang]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        apply(btn.getAttribute("data-set-lang"));
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

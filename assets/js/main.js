document.addEventListener("DOMContentLoaded", function () {
  var headings = document.querySelectorAll(".post-content h2, .post-content h3");
  var tocList = document.getElementById("toc-list");

  headings.forEach(function (heading) {
    var text = heading.textContent.trim();

    if (!heading.id) {
      heading.id = text.toLowerCase().replace(/[^\wㄱ-힝]+/g, "-");
    }

    var anchor = document.createElement("a");
    anchor.className = "heading-anchor";
    anchor.href = "#" + heading.id;
    anchor.textContent = "#";
    anchor.setAttribute("aria-label", "이 섹션으로 링크");
    heading.appendChild(anchor);

    if (tocList) {
      var li = document.createElement("li");
      if (heading.tagName === "H3") li.className = "toc-sub";

      var a = document.createElement("a");
      a.href = "#" + heading.id;
      a.textContent = text;

      li.appendChild(a);
      tocList.appendChild(li);
    }
  });

  if (tocList && !headings.length) {
    var toc = document.getElementById("toc");
    if (toc) toc.style.display = "none";
  }

  initPostSearch();
  initBookmarks();
});

var BOOKMARK_KEY = "hyblog-bookmarks";
var STAR_SVG =
  '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.6l2.47 5.24 5.78.68-4.3 3.97 1.18 5.7L10 14.9l-5.13 2.29 1.18-5.7L1.75 7.52l5.78-.68L10 1.6z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>';

function getBookmarks() {
  try {
    return JSON.parse(localStorage.getItem(BOOKMARK_KEY) || "[]");
  } catch (e) {
    return [];
  }
}

function setBookmarks(list) {
  try {
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(list));
  } catch (e) {}
}

function toggleBookmark(url) {
  var list = getBookmarks();
  var idx = list.indexOf(url);
  if (idx === -1) {
    list.push(url);
  } else {
    list.splice(idx, 1);
  }
  setBookmarks(list);
  return list;
}

function makeBookmarkButton(url) {
  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = "bookmark-btn";
  btn.setAttribute("data-url", url);
  btn.setAttribute("aria-label", "즐겨찾기에 추가");
  btn.setAttribute("aria-pressed", "false");
  btn.innerHTML = STAR_SVG;
  return btn;
}

function paintBookmarkButtons(list) {
  document.querySelectorAll(".bookmark-btn").forEach(function (btn) {
    var active = list.indexOf(btn.getAttribute("data-url")) !== -1;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

function initBookmarks() {
  var filterBtn = document.getElementById("bookmark-filter");
  var countEl = document.getElementById("bookmark-count");

  function refresh() {
    var list = getBookmarks();
    paintBookmarkButtons(list);
    if (countEl) {
      countEl.hidden = list.length === 0;
      countEl.textContent = list.length;
    }
    return list;
  }

  refresh();

  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".bookmark-btn");
    if (!btn) return;
    toggleBookmark(btn.getAttribute("data-url"));
    refresh();
    document.dispatchEvent(new CustomEvent("bookmarks-changed"));
  });

  if (filterBtn) {
    filterBtn.addEventListener("click", function () {
      var active = !filterBtn.classList.contains("is-active");
      filterBtn.classList.toggle("is-active", active);
      filterBtn.setAttribute("aria-pressed", active ? "true" : "false");
      document.dispatchEvent(new CustomEvent("bookmark-filter-toggled", { detail: { active: active } }));
    });
  }
}

// _config.yml의 pagination.per_page와 맞춰야 한다.
var SORT_PER_PAGE = 4;

function initPostSearch() {
  var input = document.getElementById("post-search");
  var indexEl = document.getElementById("search-index");
  var colorsEl = document.getElementById("category-colors");
  var listEl = document.getElementById("post-list");
  var resultsEl = document.getElementById("search-results");
  var paginationEl = document.getElementById("pagination");
  var sortPaginationEl = document.getElementById("sort-pagination");
  var sortBtns = document.querySelectorAll(".sort-btn");
  var filterBtn = document.getElementById("bookmark-filter");

  if (!input || !indexEl || !listEl || !resultsEl) return;

  var posts = [];
  try {
    posts = JSON.parse(indexEl.textContent);
  } catch (e) {
    posts = [];
  }

  var categoryColors = {};
  try {
    categoryColors = colorsEl ? JSON.parse(colorsEl.textContent) : {};
  } catch (e) {
    categoryColors = {};
  }

  function renderResults(results, emptyMessage) {
    resultsEl.innerHTML = "";

    if (!results.length) {
      resultsEl.innerHTML = '<p class="empty">' + emptyMessage + "</p>";
      return;
    }

    results.forEach(function (post) {
      var article = document.createElement("article");
      article.className = "post-preview";

      article.appendChild(makeBookmarkButton(post.url));

      var h2 = document.createElement("h2");
      var a = document.createElement("a");
      a.href = post.url;
      a.textContent = post.title;
      h2.appendChild(a);

      var meta = document.createElement("p");
      meta.className = "post-meta";
      var time = document.createElement("time");
      time.textContent = post.date;
      meta.appendChild(time);
      (post.categories || []).forEach(function (c) {
        var badge = document.createElement("span");
        badge.className = "badge badge-category" + (categoryColors[c] ? " " + categoryColors[c] : "");
        badge.textContent = c;
        meta.appendChild(badge);
      });
      (post.tags || []).forEach(function (t) {
        var badge = document.createElement("span");
        badge.className = "badge badge-tag";
        badge.textContent = "#" + t;
        meta.appendChild(badge);
      });

      article.appendChild(h2);
      article.appendChild(meta);

      if (post.excerpt) {
        var excerpt = document.createElement("p");
        excerpt.className = "post-excerpt";
        excerpt.textContent = post.excerpt;
        article.appendChild(excerpt);
      }

      resultsEl.appendChild(article);
    });

    paintBookmarkButtons(getBookmarks());
  }

  function resetSortButtons() {
    sortBtns.forEach(function (b) {
      b.classList.remove("is-active");
    });
    if (sortPaginationEl) sortPaginationEl.hidden = true;
  }

  function renderSortPaginationControls(totalPages, page, direction) {
    if (!sortPaginationEl) return;
    sortPaginationEl.innerHTML = "";

    function makeControl(label, targetPage, isCurrent) {
      var el = document.createElement(isCurrent ? "span" : "button");
      el.className = "page-link" + (isCurrent ? " current" : "");
      el.textContent = label;
      if (!isCurrent) {
        el.type = "button";
        el.addEventListener("click", function () {
          renderSortedPage(direction, targetPage);
        });
      }
      return el;
    }

    if (page > 1) sortPaginationEl.appendChild(makeControl("←", page - 1, false));
    for (var i = 1; i <= totalPages; i++) {
      sortPaginationEl.appendChild(makeControl(String(i), i, i === page));
    }
    if (page < totalPages) sortPaginationEl.appendChild(makeControl("→", page + 1, false));
  }

  function renderSortedPage(direction, page) {
    var ordered = direction === "desc" ? posts.slice() : posts.slice().reverse();
    var totalPages = Math.max(1, Math.ceil(ordered.length / SORT_PER_PAGE));
    page = Math.min(Math.max(page, 1), totalPages);

    listEl.hidden = true;
    resultsEl.hidden = false;
    if (paginationEl) paginationEl.hidden = true;

    var start = (page - 1) * SORT_PER_PAGE;
    renderResults(ordered.slice(start, start + SORT_PER_PAGE), "표시할 글이 없습니다.");

    if (sortPaginationEl) {
      sortPaginationEl.hidden = totalPages <= 1;
      renderSortPaginationControls(totalPages, page, direction);
    }
  }

  function renderSearch() {
    var q = input.value.trim().toLowerCase();

    if (!q) {
      listEl.hidden = false;
      resultsEl.hidden = true;
      if (paginationEl) paginationEl.hidden = false;
      resetSortButtons();
      return;
    }

    listEl.hidden = true;
    resultsEl.hidden = false;
    if (paginationEl) paginationEl.hidden = true;
    if (sortPaginationEl) sortPaginationEl.hidden = true;

    var results = posts.filter(function (post) {
      var haystack = [post.title]
        .concat(post.categories || [])
        .concat(post.tags || [])
        .join(" ")
        .toLowerCase();
      return haystack.indexOf(q) !== -1;
    });

    renderResults(results, "검색 결과가 없습니다.");
  }

  function renderBookmarked() {
    var list = getBookmarks();
    var results = posts.filter(function (post) {
      return list.indexOf(post.url) !== -1;
    });

    listEl.hidden = true;
    resultsEl.hidden = false;
    if (paginationEl) paginationEl.hidden = true;
    if (sortPaginationEl) sortPaginationEl.hidden = true;

    renderResults(results, "즐겨찾기한 글이 없습니다.");
  }

  sortBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var direction = btn.getAttribute("data-sort");
      sortBtns.forEach(function (b) {
        b.classList.toggle("is-active", b === btn);
      });

      input.value = "";
      if (filterBtn && filterBtn.classList.contains("is-active")) {
        filterBtn.classList.remove("is-active");
        filterBtn.setAttribute("aria-pressed", "false");
      }

      renderSortedPage(direction, 1);
    });
  });

  input.addEventListener("input", function () {
    if (filterBtn && filterBtn.classList.contains("is-active")) {
      filterBtn.classList.remove("is-active");
      filterBtn.setAttribute("aria-pressed", "false");
    }
    resetSortButtons();
    renderSearch();
  });

  if (filterBtn) {
    document.addEventListener("bookmark-filter-toggled", function (e) {
      resetSortButtons();
      if (e.detail.active) {
        input.value = "";
        renderBookmarked();
      } else {
        renderSearch();
      }
    });

    document.addEventListener("bookmarks-changed", function () {
      if (filterBtn.classList.contains("is-active")) renderBookmarked();
    });
  }
}

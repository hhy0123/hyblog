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
});

function initPostSearch() {
  var input = document.getElementById("post-search");
  var indexEl = document.getElementById("search-index");
  var listEl = document.getElementById("post-list");
  var resultsEl = document.getElementById("search-results");
  var paginationEl = document.getElementById("pagination");

  if (!input || !indexEl || !listEl || !resultsEl) return;

  var posts = [];
  try {
    posts = JSON.parse(indexEl.textContent);
  } catch (e) {
    posts = [];
  }

  function renderResults(results) {
    resultsEl.innerHTML = "";

    if (!results.length) {
      resultsEl.innerHTML = '<p class="empty">검색 결과가 없습니다.</p>';
      return;
    }

    results.forEach(function (post) {
      var article = document.createElement("article");
      article.className = "post-preview";

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
        badge.className = "badge badge-category";
        badge.textContent = c;
        meta.appendChild(badge);
      });

      var excerpt = document.createElement("p");
      excerpt.className = "post-excerpt";
      excerpt.textContent =
        post.excerpt.length > 140 ? post.excerpt.slice(0, 140) + "…" : post.excerpt;

      article.appendChild(h2);
      article.appendChild(meta);
      article.appendChild(excerpt);
      resultsEl.appendChild(article);
    });
  }

  input.addEventListener("input", function () {
    var q = input.value.trim().toLowerCase();

    if (!q) {
      listEl.hidden = false;
      resultsEl.hidden = true;
      if (paginationEl) paginationEl.hidden = false;
      return;
    }

    listEl.hidden = true;
    resultsEl.hidden = false;
    if (paginationEl) paginationEl.hidden = true;

    var results = posts.filter(function (post) {
      var haystack = [post.title]
        .concat(post.categories || [])
        .concat(post.tags || [])
        .join(" ")
        .toLowerCase();
      return haystack.indexOf(q) !== -1;
    });

    renderResults(results);
  });
}

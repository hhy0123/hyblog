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
});

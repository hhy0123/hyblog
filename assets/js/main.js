document.addEventListener("DOMContentLoaded", function () {
  var tocList = document.getElementById("toc-list");
  if (!tocList) return;

  var headings = document.querySelectorAll(".post-content h2, .post-content h3");
  if (!headings.length) {
    var toc = document.getElementById("toc");
    if (toc) toc.style.display = "none";
    return;
  }

  headings.forEach(function (heading) {
    if (!heading.id) {
      heading.id = heading.textContent
        .trim()
        .toLowerCase()
        .replace(/[^\wㄱ-힝]+/g, "-");
    }

    var li = document.createElement("li");
    if (heading.tagName === "H3") li.className = "toc-sub";

    var a = document.createElement("a");
    a.href = "#" + heading.id;
    a.textContent = heading.textContent;

    li.appendChild(a);
    tocList.appendChild(li);
  });
});

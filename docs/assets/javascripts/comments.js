!function() {
  // Support instant loading
  document$.subscribe(() => {
    let comments = document.querySelector("#__comments");
    if (!comments) return;

    let s = document.createElement("script");
    s.setAttribute("src", "https://giscus.app/client.js");
    s.setAttribute("data-repo", "JcMarical/CryDustBlog");
    s.setAttribute("data-repo-id", "R_kgDOMkfjMw");
    s.setAttribute("data-category", "Comments");
    s.setAttribute("data-category-id", "DIC_kwDOMkfjM84CriDr");
    s.setAttribute("data-mapping", "title");
    s.setAttribute("data-strict", "0");
    s.setAttribute("data-reactions-enabled", "1");
    s.setAttribute("data-emit-metadata", "1");
    s.setAttribute("data-input-position", "top");
    s.setAttribute("data-theme", "preferred_color_scheme");
    s.setAttribute("data-lang", "en");
    s.setAttribute("data-loading", "lazy");
    s.setAttribute("crossorigin", "anonymous");
    s.setAttribute("async", "");
    comments.insertAdjacentElement("afterend", s);
  });
}();
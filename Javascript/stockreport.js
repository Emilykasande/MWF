// Client-side live filter for stockreport tables
// Works with the input#stockreport-search and tables #woodReport and #furnitureReport

(function () {
  function textIncludes(haystack, needle) {
    if (!needle) return true;
    return haystack.toLowerCase().includes(needle.toLowerCase());
  }

  function rowMatches(row, term) {
    const cells = row.querySelectorAll("td");
    for (let i = 0; i < cells.length; i++) {
      if (textIncludes(cells[i].textContent || "", term)) return true;
    }
    return false;
  }

  function filterTable(table, term) {
    if (!table) return;
    const rows = table.querySelectorAll("tbody tr");
    let visible = 0;
    rows.forEach((row) => {
      const show = rowMatches(row, term);
      row.style.display = show ? "" : "none";
      if (show) visible++;
    });
    return visible;
  }

  function bindLiveSearch() {
    const input = document.getElementById("stockreport-search");
    const wood = document.getElementById("woodReport");
    const furn = document.getElementById("furnitureReport");
    if (!input) return;

    input.addEventListener("input", function (e) {
      const term = e.target.value.trim();
      filterTable(wood, term);
      filterTable(furn, term);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindLiveSearch);
  } else {
    bindLiveSearch();
  }
})();













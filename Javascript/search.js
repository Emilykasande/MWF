// Universal Search Functionality
// This script provides search functionality for any table on the page

class TableSearch {
  constructor(tableId, searchInputId, options = {}) {
    this.table = document.getElementById(tableId);
    this.searchInput = document.getElementById(searchInputId);
    this.options = {
      searchColumns: [], // Empty array means search all columns
      caseSensitive: false,
      exactMatch: false,
      highlightResults: true,
      ...options,
    };

    if (!this.table || !this.searchInput) {
      console.error("Table or search input not found");
      return;
    }

    this.originalRows = Array.from(this.table.querySelectorAll("tbody tr"));
    this.init();
  }

  init() {
    // Add event listener for search input
    this.searchInput.addEventListener("input", (e) => {
      this.search(e.target.value);
    });

    // Add clear search functionality
    this.addClearButton();
  }

  search(query) {
    if (!query.trim()) {
      this.showAllRows();
      return;
    }

    const searchTerm = this.options.caseSensitive ? query : query.toLowerCase();
    const filteredRows = this.originalRows.filter((row) => {
      const cells = Array.from(row.querySelectorAll("td"));
      const searchableCells =
        this.options.searchColumns.length > 0
          ? this.options.searchColumns.map((index) => cells[index])
          : cells;

      return searchableCells.some((cell) => {
        const cellText = this.options.caseSensitive
          ? cell.textContent
          : cell.textContent.toLowerCase();

        return this.options.exactMatch
          ? cellText === searchTerm
          : cellText.includes(searchTerm);
      });
    });

    this.displayFilteredRows(filteredRows);

    if (this.options.highlightResults) {
      this.highlightSearchTerm(searchTerm, filteredRows);
    }
  }

  displayFilteredRows(filteredRows) {
    // Hide all rows first
    this.originalRows.forEach((row) => {
      row.style.display = "none";
    });

    // Show filtered rows
    filteredRows.forEach((row) => {
      row.style.display = "";
    });

    // Update table info
    this.updateSearchInfo(filteredRows.length);
  }

  showAllRows() {
    this.originalRows.forEach((row) => {
      row.style.display = "";
      // Remove any highlighting
      this.removeHighlighting(row);
    });
    this.updateSearchInfo(this.originalRows.length);
  }

  highlightSearchTerm(searchTerm, filteredRows) {
    // Remove previous highlighting
    this.originalRows.forEach((row) => {
      this.removeHighlighting(row);
    });

    // Add highlighting to filtered rows
    filteredRows.forEach((row) => {
      const cells = Array.from(row.querySelectorAll("td"));
      const searchableCells =
        this.options.searchColumns.length > 0
          ? this.options.searchColumns.map((index) => cells[index])
          : cells;

      searchableCells.forEach((cell) => {
        this.highlightInCell(cell, searchTerm);
      });
    });
  }

  highlightInCell(cell, searchTerm) {
    const originalText = cell.textContent;
    const regex = new RegExp(`(${searchTerm})`, "gi");
    const highlightedText = originalText.replace(regex, "<mark>$1</mark>");

    if (highlightedText !== originalText) {
      cell.innerHTML = highlightedText;
    }
  }

  removeHighlighting(row) {
    const cells = Array.from(row.querySelectorAll("td"));
    cells.forEach((cell) => {
      const marks = cell.querySelectorAll("mark");
      marks.forEach((mark) => {
        mark.outerHTML = mark.innerHTML;
      });
    });
  }

  updateSearchInfo(resultCount) {
    // Create or update search info element
    let infoElement = document.getElementById("search-info");
    if (!infoElement) {
      infoElement = document.createElement("div");
      infoElement.id = "search-info";
      infoElement.style.cssText =
        "margin: 10px 0; font-style: italic; color: #666;";
      this.table.parentNode.insertBefore(infoElement, this.table);
    }

    if (this.searchInput.value.trim()) {
      infoElement.textContent = `Showing ${resultCount} of ${this.originalRows.length} results`;
    } else {
      infoElement.textContent = "";
    }
  }

  addClearButton() {
    // Add clear button next to search input
    const clearButton = document.createElement("button");
    clearButton.textContent = "Clear";
    clearButton.type = "button";
    clearButton.style.cssText = "margin-left: 5px; padding: 5px 10px;";
    clearButton.addEventListener("click", () => {
      this.searchInput.value = "";
      this.showAllRows();
    });

    this.searchInput.parentNode.insertBefore(
      clearButton,
      this.searchInput.nextSibling
    );
  }
}

// Auto-initialize search for tables with data-search attribute
document.addEventListener("DOMContentLoaded", function () {
  // Find all tables with search functionality
  const searchTables = document.querySelectorAll('table[data-search="true"]');

  searchTables.forEach((table, index) => {
    const tableId = table.id || `search-table-${index}`;
    const searchInputId = `search-${tableId}`;

    // Create search input if it doesn't exist
    let searchInput = document.getElementById(searchInputId);
    if (!searchInput) {
      searchInput = document.createElement("input");
      searchInput.type = "text";
      searchInput.id = searchInputId;
      searchInput.placeholder = "Search table...";
      searchInput.style.cssText =
        "margin-bottom: 10px; padding: 8px; width: 300px; border: 1px solid #ccc; border-radius: 4px;";

      // Insert search input before the table
      table.parentNode.insertBefore(searchInput, table);
    }

    // Initialize search for this table
    new TableSearch(tableId, searchInputId, {
      searchColumns: table.dataset.searchColumns
        ? table.dataset.searchColumns.split(",").map((i) => parseInt(i))
        : [],
      caseSensitive: table.dataset.caseSensitive === "true",
      exactMatch: table.dataset.exactMatch === "true",
    });
  });
});

// Export for manual initialization
window.TableSearch = TableSearch;













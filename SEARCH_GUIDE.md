# Search Functionality Guide

This guide explains how to implement and use the search functionality in your Mayondo application.

## Overview

The search functionality has been implemented across multiple pages to allow users to quickly find specific items in tables. The search works both on the frontend (client-side filtering) and backend (server-side filtering with database queries).

## Features

- **Real-time search**: Results update as you type
- **Case-insensitive**: Search works regardless of letter case
- **Partial matching**: Find items with partial text matches
- **Multi-column search**: Searches across all table columns
- **Highlighting**: Search terms are highlighted in results
- **Clear functionality**: Easy way to clear search and show all results

## Implementation

### 1. Universal Search JavaScript

The core search functionality is provided by `/Javascript/search.js` which includes:

- `TableSearch` class for managing table searches
- Auto-initialization for tables with `data-search="true"` attribute
- Support for custom search options

### 2. Frontend Implementation

To add search to any table:

1. **Add search input field**:

```pug
.search-container(style="margin-bottom: 20px;")
  input#search-table-id(type="text", placeholder="🔍 Search...", style="padding: 8px; width: 300px; border: 1px solid #ccc; border-radius: 4px;")
```

2. **Add data attributes to table**:

```pug
table#table-id(data-search="true")
  // table content
```

3. **Include search script**:

```pug
script(src="/Javascript/search.js")
```

### 3. Backend Implementation

For server-side search, update your routes to handle query parameters:

```javascript
router.get("/your-route", async (req, res) => {
  try {
    const query = req.query.q ? req.query.q.trim() : "";

    // Build filter for search
    let filter = {};
    if (query) {
      filter = {
        $or: [
          { field1: { $regex: query, $options: "i" } },
          { field2: { $regex: query, $options: "i" } },
          // Add more fields as needed
        ],
      };
    }

    const items = await YourModel.find(filter);
    res.render("your-template", { items, query });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(400).send("Error fetching data");
  }
});
```

## Pages with Search Functionality

### 1. Stock Management (`/stock`)

- **Search fields**: Product name, supplier, status
- **Tables**: Wood stock, Furniture stock
- **Implementation**: Both frontend and backend search

### 2. Customers (`/customers`)

- **Search fields**: Name, email, phone
- **Implementation**: Backend search with database queries

### 3. Sales List (`/sales`)

- **Search fields**: Customer name, product, payment method
- **Implementation**: Backend search with database queries

### 4. E-commerce Products (`/ecommerce`)

- **Search fields**: Product name, price
- **Implementation**: Frontend search for product grid

### 5. Stock Report (`/stockreport`)

- **Search fields**: Product name, supplier, status
- **Implementation**: Backend search with database queries

## Customization Options

### Search Configuration

You can customize search behavior using data attributes:

```pug
table#my-table(
  data-search="true",
  data-search-columns="0,1,2",  // Search only specific columns
  data-case-sensitive="false",  // Case sensitivity
  data-exact-match="false"      // Exact or partial matching
)
```

### Custom Search Implementation

For special cases, you can implement custom search logic:

```javascript
// Custom search for product grid
document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("search-products");
  const productGrid = document.getElementById("productGrid");
  const productCards = Array.from(productGrid.querySelectorAll(".card"));

  if (searchInput) {
    searchInput.addEventListener("input", function (e) {
      const searchTerm = e.target.value.toLowerCase();

      productCards.forEach((card) => {
        const productName =
          card.querySelector(".title")?.textContent.toLowerCase() || "";
        const productPrice =
          card.querySelector(".price")?.textContent.toLowerCase() || "";

        if (
          productName.includes(searchTerm) ||
          productPrice.includes(searchTerm)
        ) {
          card.style.display = "block";
        } else {
          card.style.display = "none";
        }
      });
    });
  }
});
```

## Testing

### Demo Page

Visit `/search-demo` to see the search functionality in action with sample data.

### Manual Testing

1. Navigate to any page with search functionality
2. Type in the search box to filter results
3. Try different search terms
4. Clear the search to show all results
5. Test with different data sets

## Troubleshooting

### Common Issues

1. **Search not working**: Ensure the search script is included and the table has `data-search="true"`
2. **No results found**: Check if the search term matches the data format
3. **Backend search not working**: Verify the route handles query parameters correctly
4. **Styling issues**: Check CSS for search input and table styling

### Debug Tips

1. Check browser console for JavaScript errors
2. Verify database queries in server logs
3. Test with simple search terms first
4. Ensure data is properly loaded before search

## Performance Considerations

- **Frontend search**: Good for small to medium datasets (< 1000 rows)
- **Backend search**: Recommended for large datasets or when data is paginated
- **Indexing**: Consider adding database indexes for frequently searched fields

## Future Enhancements

Potential improvements to consider:

1. **Advanced filters**: Date ranges, numeric ranges, multiple criteria
2. **Search suggestions**: Auto-complete based on existing data
3. **Saved searches**: Allow users to save frequently used searches
4. **Export filtered results**: Download filtered data
5. **Search analytics**: Track popular search terms

## Support

If you encounter issues with the search functionality:

1. Check this guide for common solutions
2. Review the browser console for errors
3. Test with the demo page to verify basic functionality
4. Check server logs for backend search issues













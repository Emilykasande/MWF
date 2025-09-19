// Sales Trends (Line Chart)
new Chart(document.getElementById("salesChart"), {
  type: "line",
  data: {
    labels: salesLabels,
    datasets: [
      {
        label: "Sales",
        data: salesData,
        borderColor: "blue",
        fill: false,
        tension: 0.3,
      },
    ],
  },
});

// Popular Products (Pie Chart)
new Chart(document.getElementById("productsChart"), {
  type: "pie",
  data: {
    labels: productLabels,
    datasets: [
      {
        label: "Products Sold",
        data: productData,
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4CAF50",
          "#9C27B0",
        ],
      },
    ],
  },
});

// Inventory Levels (Bar Chart)
new Chart(document.getElementById("inventoryChart"), {
  type: "bar",
  data: {
    labels: inventoryLabels,
    datasets: [
      {
        label: "Stock Quantity",
        data: inventoryData,
        backgroundColor: "#36A2EB",
      },
    ],
  },
});

// Top Customers (Doughnut Chart)
new Chart(document.getElementById("customersChart"), {
  type: "doughnut",
  data: {
    labels: customerLabels,
    datasets: [
      {
        label: "Purchases",
        data: customerData,
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4CAF50",
          "#9C27B0",
        ],
      },
    ],
  },
});

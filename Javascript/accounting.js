// Profit & Loss
new Chart(document.getElementById("plChart").getContext("2d"), {
  type: "bar",
  data: {
    labels: ["Sales", "COGS", "Expenses"],
    datasets: [
      {
        label: "Amount ($)",
        data: [sales, cogs, expenses],
        backgroundColor: ["#4caf50", "#f44336", "#ff9800"],
      },
    ],
  },
});

// Expenses Breakdown
new Chart(document.getElementById("expenseChart").getContext("2d"), {
  type: "pie",
  data: {
    labels: ["Salaries", "Rent", "Utilities", "Marketing"],
    datasets: [
      {
        data: [salaries, rent, utilities, marketing],
        backgroundColor: ["#2196f3", "#ffeb3b", "#9c27b0", "#00bcd4"],
      },
    ],
  },
});

// Cash Flow
new Chart(document.getElementById("cashChart").getContext("2d"), {
  type: "line",
  data: {
    labels: cashFlow.map((_, i) => `Month ${i + 1}`),
    datasets: [
      {
        label: "Cash Flow",
        data: cashFlow,
        borderColor: "#ff9800",
        fill: false,
      },
    ],
  },
});

// Receivables vs Payables
new Chart(document.getElementById("arApChart").getContext("2d"), {
  type: "bar",
  data: {
    labels: ["Receivables", "Payables"],
    datasets: [
      {
        label: "Amount ($)",
        data: [receivables, payables],
        backgroundColor: ["#4caf50", "#f44336"],
      },
    ],
  },
});

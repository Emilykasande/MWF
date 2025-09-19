
function updateTaskStatus(selectElem) {
    const status = selectElem.value;
    if (status === "Completed") selectElem.style.background = "#28a745"; // Green for completed
    else if (status === "In Progress") selectElem.style.background = "#ffc107"; // Yellow for progress
    else selectElem.style.background = "#fff";
}

function updateProgress(rangeElem, progressId) {
    const progressBar = document.getElementById(progressId);
    progressBar.style.width = rangeElem.value + '%';
}


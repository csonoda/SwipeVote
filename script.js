// Get session ID from URL
const sessionId = new URLSearchParams(window.location.search).get("session");
let options = [];
let currentIndex = 0;
const expiryTime = 5 * 60 * 1000; // 5 minutes expiry

function createSession() {
    const items = document.getElementById("items").value.split("\n").map(i => i.trim()).filter(i => i);
    if (items.length === 0) return alert("Enter at least one option!");

    const sessionKey = "session-" + Math.random().toString(36).substr(2, 8);
    const expiresAt = Date.now() + expiryTime;

    localStorage.setItem(sessionKey, JSON.stringify({ items, votes: {}, expiresAt }));
    window.location.href = "?session=" + sessionKey;
}

function loadSession() {
    if (!sessionId) return;

    const sessionData = JSON.parse(localStorage.getItem(sessionId));
    if (!sessionData) return alert("Session expired or invalid!");

    if (Date.now() > sessionData.expiresAt) {
        document.getElementById("results-section").classList.remove("hidden");
        document.getElementById("results").innerHTML = "Session expired!";
        return;
    }

    options = sessionData.items;
    document.getElementById("create-section").classList.add("hidden");
    document.getElementById("swipe-section").classList.remove("hidden");
    document.getElementById("expires-at").textContent = "This expires at: " + new Date(sessionData.expiresAt).toLocaleTimeString();
    showNextOption();
}

function showNextOption() {
    if (currentIndex >= options.length) {
        showResults();
        return;
    }
    document.getElementById("option-card").textContent = options[currentIndex];
}

function vote(choice) {
    let sessionData = JSON.parse(localStorage.getItem(sessionId));
    if (!sessionData) return;

    let userVotes = localStorage.getItem(sessionId + "-voted");
    if (userVotes) return alert("You've already voted!");

    sessionData.votes[options[currentIndex]] = (sessionData.votes[options[currentIndex]] || 0) + (choice === 'yes' ? 1 : 0);
    localStorage.setItem(sessionId, JSON.stringify(sessionData));
    localStorage.setItem(sessionId + "-voted", "true");

    currentIndex++;
    showNextOption();
}

function showResults() {
    let sessionData = JSON.parse(localStorage.getItem(sessionId));
    document.getElementById("swipe-section").classList.add("hidden");
    document.getElementById("results-section").classList.remove("hidden");

    let resultsHTML = Object.entries(sessionData.votes)
        .sort((a, b) => b[1] - a[1])
        .map(([option, votes]) => `<p>${option}: ${votes} votes</p>`)
        .join("");

    document.getElementById("results").innerHTML = resultsHTML || "No votes recorded.";
}

window.onload = loadSession;
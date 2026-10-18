
const timerDisplay = document.getElementById("timer");
const sessionLabel = document.getElementById("sessionLabel");
const sessionCountDisplay = document.getElementById("sessionCount");
const statusMessage = document.getElementById("statusMessage");

const workButton = document.getElementById("workButton");
const breakButton = document.getElementById("breakButton");
const startButton = document.getElementById("startButton");
const pauseButton = document.getElementById("pauseButton");
const resetButton = document.getElementById("resetButton");

const WORK_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

let currentSession = "work";
let timeLeft = WORK_TIME;
let timerInterval = null;
let completedSessions = 0;

// Convert seconds into MM:SS format
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(remainingSeconds).padStart(2, "0")
    );
}

// Update the timer display
function updateDisplay() {
    timerDisplay.textContent = formatTime(timeLeft);
    sessionCountDisplay.textContent = completedSessions;
}

// Update Focus/Break labels and button styles
function updateSessionUI() {
    const isWork = currentSession === "work";

    workButton.classList.toggle("active", isWork);
    breakButton.classList.toggle("active", !isWork);

    sessionLabel.textContent = isWork
        ? "Time to focus!"
        : "Take a short break!";

    document.title = `${formatTime(timeLeft)} - Pomodoro Timer`;
}

// Stop the current interval safely
function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

// Start the countdown
function startTimer() {
    if (timerInterval !== null) {
        return;
    }

    statusMessage.textContent = "Timer is running. Keep going!";

    timerInterval = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateDisplay();
            updateSessionUI();
        }

        if (timeLeft === 0) {
            finishSession();
        }
    }, 1000);
}

// Pause the countdown
function pauseTimer() {
    if (timerInterval === null) {
        statusMessage.textContent = "Timer is already paused.";
        return;
    }

    stopTimer();
    statusMessage.textContent = "Timer paused. Take your time.";
}

// Reset the currently selected session
function resetTimer() {
    stopTimer();

    timeLeft = currentSession === "work"
        ? WORK_TIME
        : BREAK_TIME;

    updateDisplay();
    updateSessionUI();

    statusMessage.textContent = "Timer reset. Ready to start!";
}

// Select a Focus or Break session
function selectSession(session) {
    stopTimer();

    currentSession = session;
    timeLeft = session === "work"
        ? WORK_TIME
        : BREAK_TIME;

    updateDisplay();
    updateSessionUI();

    statusMessage.textContent =
        session === "work"
            ? "Focus session selected."
            : "Break session selected.";
}

// Handle the end of a session
function finishSession() {
    stopTimer();

    if (currentSession === "work") {
        completedSessions++;
        currentSession = "break";
        timeLeft = BREAK_TIME;

        statusMessage.textContent =
            "Focus session complete! Time for a break.";
    } else {
        currentSession = "work";
        timeLeft = WORK_TIME;

        statusMessage.textContent =
            "Break finished! Ready for another focus session?";
    }

    updateDisplay();
    updateSessionUI();

    // Automatically start the next session
    startTimer();
}

// Button events
startButton.addEventListener("click", startTimer);
pauseButton.addEventListener("click", pauseTimer);
resetButton.addEventListener("click", resetTimer);

workButton.addEventListener("click", () => {
    selectSession("work");
});

breakButton.addEventListener("click", () => {
    selectSession("break");
});

// Initialize the app
updateDisplay();
updateSessionUI();

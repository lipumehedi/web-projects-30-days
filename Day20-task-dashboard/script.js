
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const categoryInput = document.getElementById("categoryInput");
const priorityInput = document.getElementById("priorityInput");
const dueDateInput = document.getElementById("dueDateInput");

const formTitle = document.getElementById("formTitle");
const submitButton = document.getElementById("submitButton");
const cancelButton = document.getElementById("cancelButton");
const message = document.getElementById("message");

const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const statusFilter = document.getElementById("statusFilter");
const sortSelect = document.getElementById("sortSelect");

const taskList = document.getElementById("taskList");
const emptyMessage = document.getElementById("emptyMessage");
const clearAllButton = document.getElementById("clearAllButton");

const totalCount = document.getElementById("totalCount");
const pendingCount = document.getElementById("pendingCount");
const completedCount = document.getElementById("completedCount");
const completionRate = document.getElementById("completionRate");

const progressBar = document.getElementById("progressBar");
const progressTrack = document.getElementById("progressTrack");
const progressLabel = document.getElementById("progressLabel");
const categorySummary = document.getElementById("categorySummary");

const STORAGE_KEY = "day20-task-dashboard";

const categories = ["work", "study", "personal", "other"];
const priorities = ["high", "medium", "low"];

const categoryNames = {
    work: "Work",
    study: "Study",
    personal: "Personal",
    other: "Other"
};

const priorityRank = {
    high: 1,
    medium: 2,
    low: 3
};

let tasks = loadTasks();
let editingTaskId = null;

// Load and validate saved tasks
function loadTasks() {
    try {
        const saved = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
        );

        if (!Array.isArray(saved)) {
            return [];
        }

        return saved
            .filter(task =>
                task &&
                typeof task.id === "string" &&
                typeof task.text === "string" &&
                typeof task.completed === "boolean"
            )
            .map(task => ({
                id: task.id,
                text: task.text,
                completed: task.completed,
                category: categories.includes(task.category)
                    ? task.category
                    : "other",
                priority: priorities.includes(task.priority)
                    ? task.priority
                    : "medium",
                dueDate: typeof task.dueDate === "string"
                    ? task.dueDate
                    : "",
                createdAt: Number.isFinite(task.createdAt)
                    ? task.createdAt
                    : 0
            }));
    } catch (error) {
        console.error("Unable to load tasks:", error);
        return [];
    }
}

// Save tasks in the browser
function saveTasks() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        return true;
    } catch (error) {
        console.error("Unable to save tasks:", error);
        showMessage("Could not save tasks in this browser.", true);
        return false;
    }
}

// Display success or error messages
function showMessage(text, isError = false) {
    message.textContent = text;
    message.style.color = isError ? "#b42318" : "#267447";
}

// Create a unique task ID
function createTaskId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
        return window.crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// Format a date without UTC date-shift problems
function formatDate(dateString) {
    if (!dateString) {
        return "No due date";
    }

    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

// Get today's date in local time
function getTodayString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Reset the task form
function resetForm() {
    taskForm.reset();
    categoryInput.value = "study";
    priorityInput.value = "medium";
    editingTaskId = null;

    formTitle.textContent = "Add a new task";
    submitButton.textContent = "Add Task";
    cancelButton.classList.add("hidden");
}

// Update the dashboard cards and progress bar
function renderDashboard() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;

    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    totalCount.textContent = total;
    pendingCount.textContent = pending;
    completedCount.textContent = completed;
    completionRate.textContent = `${percentage}%`;

    progressBar.style.width = `${percentage}%`;
    progressTrack.setAttribute("aria-valuenow", percentage);
    progressLabel.textContent = `${completed} of ${total} completed`;

    // Show total tasks in each category
    categorySummary.replaceChildren();

    categories.forEach(category => {
        const categoryTotal = tasks.filter(
            task => task.category === category
        ).length;

        const card = document.createElement("div");
        card.className = "category-card";

        const label = document.createElement("span");
        label.textContent = categoryNames[category];

        const count = document.createElement("strong");
        count.textContent = categoryTotal;

        card.append(label, count);
        categorySummary.append(card);
    });
}

// Apply search, category filter and status filter
function getVisibleTasks() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedCategory = categoryFilter.value;
    const selectedStatus = statusFilter.value;

    const filtered = tasks.filter(task => {
        const matchesSearch = task.text
            .toLowerCase()
            .includes(searchTerm);

        const matchesCategory =
            selectedCategory === "all" ||
            task.category === selectedCategory;

        const matchesStatus =
            selectedStatus === "all" ||
            (selectedStatus === "pending" && !task.completed) ||
            (selectedStatus === "completed" && task.completed);

        return matchesSearch && matchesCategory && matchesStatus;
    });

    return sortTasks(filtered);
}

// Sort tasks
function sortTasks(taskArray) {
    const sorted = [...taskArray];
    const sortBy = sortSelect.value;

    sorted.sort((a, b) => {
        if (sortBy === "priority") {
            const difference =
                priorityRank[a.priority] - priorityRank[b.priority];

            if (difference !== 0) {
                return difference;
            }
        }

        if (sortBy === "dueDate") {
            // Tasks without a due date go last
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;

            const difference = a.dueDate.localeCompare(b.dueDate);
            if (difference !== 0) return difference;
        }

        if (sortBy === "newest") {
            return b.createdAt - a.createdAt;
        }

        if (sortBy === "oldest") {
            return a.createdAt - b.createdAt;
        }

        if (sortBy === "alphabetical") {
            const difference = a.text.localeCompare(b.text);
            if (difference !== 0) return difference;
        }

        return b.createdAt - a.createdAt;
    });

    return sorted;
}

// Render the task list
function renderTasks() {
    taskList.replaceChildren();

    const visibleTasks = getVisibleTasks();
    const today = getTodayString();

    visibleTasks.forEach(task => {
        const item = document.createElement("li");
        item.className = "task-item";

        if (task.completed) {
            item.classList.add("completed");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute(
            "aria-label",
            `Mark ${task.text} as completed`
        );

        checkbox.addEventListener("change", () => {
            const previousValue = task.completed;
            task.completed = checkbox.checked;

            if (!saveTasks()) {
                task.completed = previousValue;
            }

            renderAll();
        });

        const content = document.createElement("div");
        content.className = "task-content";

        const title = document.createElement("div");
        title.className = "task-title";
        title.textContent = task.text;

        const meta = document.createElement("div");
        meta.className = "task-meta";

        const categoryBadge = document.createElement("span");
        categoryBadge.className =
            `badge category-${task.category}`;
        categoryBadge.textContent = categoryNames[task.category];

        const priorityBadge = document.createElement("span");
        priorityBadge.className =
            `badge priority-${task.priority}`;
        priorityBadge.textContent =
            task.priority.charAt(0).toUpperCase() +
            task.priority.slice(1);

        const dateLabel = document.createElement("span");
        dateLabel.textContent = formatDate(task.dueDate);

        if (
            task.dueDate &&
            task.dueDate < today &&
            !task.completed
        ) {
            dateLabel.classList.add("overdue");
            dateLabel.textContent += " · Overdue";
        }

        meta.append(categoryBadge, priorityBadge, dateLabel);
        content.append(title, meta);

        const actions = document.createElement("div");
        actions.className = "task-actions";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "edit-button";
        editButton.textContent = "Edit";

        editButton.addEventListener("click", () => {
            startEditing(task.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            deleteTask(task.id);
        });

        actions.append(editButton, deleteButton);
        item.append(checkbox, content, actions);
        taskList.append(item);
    });

    emptyMessage.hidden = visibleTasks.length > 0;

    if (tasks.length === 0) {
        emptyMessage.textContent = "No tasks yet. Add your first task above!";
    } else if (visibleTasks.length === 0) {
        emptyMessage.textContent = "No matching tasks found.";
    }

    clearAllButton.disabled = tasks.length === 0;
}

// Render all parts of the page
function renderAll() {
    renderDashboard();
    renderTasks();
}

// Add a task or update an existing task
taskForm.addEventListener("submit", event => {
    event.preventDefault();

    const text = taskInput.value.trim();
    const category = categoryInput.value;
    const priority = priorityInput.value;
    const dueDate = dueDateInput.value;

    if (!text) {
        showMessage("Please enter a task name.", true);
        taskInput.focus();
        return;
    }

    if (!categories.includes(category) || !priorities.includes(priority)) {
        showMessage("Please select valid category and priority values.", true);
        return;
    }

    if (editingTaskId !== null) {
        const task = tasks.find(item => item.id === editingTaskId);

        if (!task) {
            showMessage("Task not found. Please try again.", true);
            resetForm();
            return;
        }

        const previousTask = { ...task };

        task.text = text;
        task.category = category;
        task.priority = priority;
        task.dueDate = dueDate;

        if (!saveTasks()) {
            Object.assign(task, previousTask);
            return;
        }

        showMessage("Task updated successfully.");
    } else {
        const newTask = {
            id: createTaskId(),
            text,
            category,
            priority,
            dueDate,
            completed: false,
            createdAt: Date.now()
        };

        tasks.push(newTask);

        if (!saveTasks()) {
            tasks = tasks.filter(task => task.id !== newTask.id);
            return;
        }

        showMessage("Task added successfully.");
    }

    resetForm();
    renderAll();
});

// Fill the form with task details
function startEditing(taskId) {
    const task = tasks.find(item => item.id === taskId);

    if (!task) {
        return;
    }

    editingTaskId = taskId;
    taskInput.value = task.text;
    categoryInput.value = task.category;
    priorityInput.value = task.priority;
    dueDateInput.value = task.dueDate;

    formTitle.textContent = "Edit task";
    submitButton.textContent = "Save Changes";
    cancelButton.classList.remove("hidden");

    showMessage("Update the task details and save.");
    taskInput.focus();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// Delete one task
function deleteTask(taskId) {
    const task = tasks.find(item => item.id === taskId);

    if (!task || !confirm(`Delete "${task.text}"?`)) {
        return;
    }

    const previousTasks = tasks;
    tasks = tasks.filter(item => item.id !== taskId);

    if (!saveTasks()) {
        tasks = previousTasks;
        renderAll();
        return;
    }

    if (editingTaskId === taskId) {
        resetForm();
    }

    showMessage("Task deleted.");
    renderAll();
}

// Cancel editing
cancelButton.addEventListener("click", () => {
    resetForm();
    showMessage("Editing cancelled.");
});

// Update the list when search, category, status or sort changes
searchInput.addEventListener("input", renderTasks);
categoryFilter.addEventListener("change", renderTasks);
statusFilter.addEventListener("change", renderTasks);
sortSelect.addEventListener("change", renderTasks);

// Delete every task after confirmation
clearAllButton.addEventListener("click", () => {
    if (tasks.length === 0) {
        return;
    }

    if (!confirm("Are you sure you want to delete all tasks?")) {
        return;
    }

    const previousTasks = tasks;
    tasks = [];

    if (!saveTasks()) {
        tasks = previousTasks;
        renderAll();
        return;
    }

    resetForm();
    showMessage("All tasks cleared.");
    renderAll();
});

// Initial page display
renderAll();

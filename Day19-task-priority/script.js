
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const dueDateInput = document.getElementById("dueDate");
const priorityInput = document.getElementById("priority");
const submitButton = document.getElementById("submitButton");
const cancelButton = document.getElementById("cancelButton");
const formTitle = document.getElementById("formTitle");
const searchInput = document.getElementById("searchInput");
const filterSelect = document.getElementById("filterSelect");
const sortSelect = document.getElementById("sortSelect");
const taskList = document.getElementById("taskList");
const emptyMessage = document.getElementById("emptyMessage");
const message = document.getElementById("message");
const totalCount = document.getElementById("totalCount");
const pendingCount = document.getElementById("pendingCount");
const completedCount = document.getElementById("completedCount");
const clearAllButton = document.getElementById("clearAllButton");

const STORAGE_KEY = "day19-priority-tasks";
const priorities = ["high", "medium", "low"];

let tasks = loadTasks();
let editingTaskId = null;

// Load tasks from localStorage safely
function loadTasks() {
    try {
        const savedTasks = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
        );

        if (!Array.isArray(savedTasks)) {
            return [];
        }

        return savedTasks
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
                dueDate: typeof task.dueDate === "string"
                    ? task.dueDate
                    : "",
                priority: priorities.includes(task.priority)
                    ? task.priority
                    : "medium",
                createdAt: Number.isFinite(task.createdAt)
                    ? task.createdAt
                    : 0
            }));
    } catch (error) {
        console.error("Could not load tasks:", error);
        return [];
    }
}

// Save tasks to localStorage
function saveTasks() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        return true;
    } catch (error) {
        console.error("Could not save tasks:", error);
        showMessage("Could not save tasks in this browser.", true);
        return false;
    }
}

// Show a message below the form
function showMessage(text, isError = false) {
    message.textContent = text;
    message.style.color = isError ? "#b42318" : "#267447";
}

// Reset the form after adding or cancelling an edit
function resetForm() {
    taskForm.reset();
    priorityInput.value = "medium";
    editingTaskId = null;
    formTitle.textContent = "Add a new task";
    submitButton.textContent = "Add Task";
    cancelButton.classList.add("hidden");
}

// Create a task ID
function createTaskId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
        return window.crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// Format a date for display
function formatDate(dateString) {
    if (!dateString) {
        return "No due date";
    }

    const parts = dateString.split("-").map(Number);
    const date = new Date(parts[0], parts[1] - 1, parts[2]);

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

// Sort tasks based on the selected option
function sortTasks(taskArray) {
    const sorted = [...taskArray];
    const sortBy = sortSelect.value;

    const priorityRank = {
        high: 1,
        medium: 2,
        low: 3
    };

    sorted.sort((a, b) => {
        if (sortBy === "priority") {
            const difference =
                priorityRank[a.priority] - priorityRank[b.priority];

            if (difference !== 0) {
                return difference;
            }
        }

        if (sortBy === "dueDate") {
            // Tasks without a due date go to the bottom
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

        // Keep ordering stable when the main sort values are equal
        return b.createdAt - a.createdAt;
    });

    return sorted;
}

// Search and filter tasks
function getVisibleTasks() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedFilter = filterSelect.value;

    const filtered = tasks.filter(task => {
        const matchesSearch = task.text
            .toLowerCase()
            .includes(searchTerm);

        const matchesFilter =
            selectedFilter === "all" ||
            (selectedFilter === "pending" && !task.completed) ||
            (selectedFilter === "completed" && task.completed);

        return matchesSearch && matchesFilter;
    });

    return sortTasks(filtered);
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
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        const content = document.createElement("div");
        content.className = "task-content";

        const title = document.createElement("div");
        title.className = "task-title";
        title.textContent = task.text;

        const meta = document.createElement("div");
        meta.className = "task-meta";

        const priorityBadge = document.createElement("span");
        priorityBadge.className = `priority priority-${task.priority}`;
        priorityBadge.textContent =
            task.priority.charAt(0).toUpperCase() +
            task.priority.slice(1);

        const dueDate = document.createElement("span");
        dueDate.textContent = formatDate(task.dueDate);

        if (
            task.dueDate &&
            task.dueDate < today &&
            !task.completed
        ) {
            dueDate.classList.add("overdue");
            dueDate.textContent += " · Overdue";
        }

        meta.append(priorityBadge, dueDate);
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

    totalCount.textContent = tasks.length;
    pendingCount.textContent =
        tasks.filter(task => !task.completed).length;
    completedCount.textContent =
        tasks.filter(task => task.completed).length;

    emptyMessage.hidden = visibleTasks.length > 0;

    if (tasks.length === 0) {
        emptyMessage.textContent = "No tasks yet. Add your first task above!";
    } else if (visibleTasks.length === 0) {
        emptyMessage.textContent = "No matching tasks found.";
    }

    clearAllButton.disabled = tasks.length === 0;
}

// Add or update a task
taskForm.addEventListener("submit", event => {
    event.preventDefault();

    const text = taskInput.value.trim();
    const dueDate = dueDateInput.value;
    const priority = priorityInput.value;

    if (!text) {
        showMessage("Please enter a task name.", true);
        taskInput.focus();
        return;
    }

    if (!priorities.includes(priority)) {
        showMessage("Please select a valid priority.", true);
        return;
    }

    if (editingTaskId !== null) {
        const task = tasks.find(item => item.id === editingTaskId);

        if (!task) {
            showMessage("Task not found. Please try again.", true);
            resetForm();
            return;
        }

        const oldTask = { ...task };

        task.text = text;
        task.dueDate = dueDate;
        task.priority = priority;

        if (!saveTasks()) {
            Object.assign(task, oldTask);
            return;
        }

        showMessage("Task updated successfully.");
    } else {
        const newTask = {
            id: createTaskId(),
            text,
            dueDate,
            priority,
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
    renderTasks();
});

// Load task details into the form for editing
function startEditing(taskId) {
    const task = tasks.find(item => item.id === taskId);

    if (!task) {
        return;
    }

    editingTaskId = taskId;
    taskInput.value = task.text;
    dueDateInput.value = task.dueDate;
    priorityInput.value = task.priority;

    formTitle.textContent = "Edit task";
    submitButton.textContent = "Save Changes";
    cancelButton.classList.remove("hidden");

    showMessage("Edit the task and save your changes.");
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
        renderTasks();
        return;
    }

    if (editingTaskId === taskId) {
        resetForm();
    }

    showMessage("Task deleted.");
    renderTasks();
}

// Cancel editing
cancelButton.addEventListener("click", () => {
    resetForm();
    showMessage("Editing cancelled.");
});

// Update the visible list when searching, filtering or sorting
searchInput.addEventListener("input", renderTasks);
filterSelect.addEventListener("change", renderTasks);
sortSelect.addEventListener("change", renderTasks);

// Clear all tasks
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
        renderTasks();
        return;
    }

    resetForm();
    showMessage("All tasks cleared.");
    renderTasks();
});

// Initial display
renderTasks();

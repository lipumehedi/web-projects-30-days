
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const dueDateInput = document.getElementById("dueDate");
const submitButton = document.getElementById("submitButton");
const cancelButton = document.getElementById("cancelButton");
const searchInput = document.getElementById("searchInput");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const emptyMessage = document.getElementById("emptyMessage");
const message = document.getElementById("message");
const filterButtons = document.querySelectorAll(".filter-btn");

const STORAGE_KEY = "day18-task-manager";

let tasks = loadTasks();
let currentFilter = "all";
let searchText = "";
let editingTaskId = null;

function loadTasks() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        const data = saved ? JSON.parse(saved) : [];

        if (!Array.isArray(data)) {
            return [];
        }

        return data.filter(task =>
            task &&
            typeof task.id === "string" &&
            typeof task.text === "string" &&
            typeof task.completed === "boolean" &&
            typeof task.dueDate === "string"
        );
    } catch (error) {
        return [];
    }
}

function saveTasks() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(tasks)
        );
        return true;
    } catch (error) {
        message.textContent = "Could not save tasks.";
        return false;
    }
}

function getVisibleTasks() {
    return tasks.filter(task => {
        const matchesSearch = task.text
            .toLowerCase()
            .includes(searchText.toLowerCase());

        const matchesFilter =
            currentFilter === "all" ||
            (currentFilter === "pending" && !task.completed) ||
            (currentFilter === "completed" && task.completed);

        return matchesSearch && matchesFilter;
    });
}

function renderTasks() {
    taskList.replaceChildren();

    const visibleTasks = getVisibleTasks();
    const today = new Date();
    const todayString =
        `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    visibleTasks.forEach(task => {
        const li = document.createElement("li");
        li.className = "task";

        if (task.completed) {
            li.classList.add("completed");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", `Complete ${task.text}`);

        checkbox.addEventListener("change", () => {
            const oldValue = task.completed;
            task.completed = checkbox.checked;

            if (!saveTasks()) {
                task.completed = oldValue;
            }

            renderTasks();
        });

        const details = document.createElement("div");
        details.className = "task-details";

        const title = document.createElement("span");
        title.className = "task-title";
        title.textContent = task.text;
        details.appendChild(title);

        if (task.dueDate) {
            const dateLabel = document.createElement("small");
            dateLabel.className = "due-date";

            const isOverdue =
                !task.completed && task.dueDate < todayString;

            dateLabel.textContent = isOverdue
                ? `Overdue: ${task.dueDate}`
                : `Due: ${task.dueDate}`;

            if (isOverdue) {
                dateLabel.classList.add("overdue");
            }

            details.appendChild(dateLabel);
        }

        const actions = document.createElement("div");
        actions.className = "task-actions";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Edit";
        editButton.className = "edit-btn";

        editButton.addEventListener("click", () => {
            editingTaskId = task.id;
            taskInput.value = task.text;
            dueDateInput.value = task.dueDate;
            submitButton.textContent = "Update Task";
            cancelButton.hidden = false;
            message.textContent = "Edit the task and click Update Task.";
            taskInput.focus();
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", () => {
            const previousTasks = tasks;
            tasks = tasks.filter(item => item.id !== task.id);

            if (!saveTasks()) {
                tasks = previousTasks;
                renderTasks();
                return;
            }

            if (editingTaskId === task.id) {
                resetForm();
            }

            message.textContent = "Task deleted.";
            renderTasks();
        });

        actions.append(editButton, deleteButton);
        li.append(checkbox, details, actions);
        taskList.appendChild(li);
    });

    const completedCount = tasks.filter(task => task.completed).length;
    const pendingCount = tasks.length - completedCount;

    taskCount.textContent =
        `Total: ${tasks.length} | Pending: ${pendingCount} | Completed: ${completedCount}`;

    emptyMessage.hidden = visibleTasks.length !== 0;
}

function resetForm() {
    editingTaskId = null;
    taskForm.reset();
    submitButton.textContent = "Add Task";
    cancelButton.hidden = true;
}

taskForm.addEventListener("submit", event => {
    event.preventDefault();

    const text = taskInput.value.trim();
    const dueDate = dueDateInput.value;

    if (!text) {
        message.textContent = "Please enter a task name.";
        return;
    }

    const previousTasks = tasks.map(task => ({ ...task }));

    if (editingTaskId !== null) {
        const task = tasks.find(item => item.id === editingTaskId);

        if (!task) {
            resetForm();
            return;
        }

        task.text = text;
        task.dueDate = dueDate;
    } else {
        tasks.push({
            id: crypto.randomUUID(),
            text,
            dueDate,
            completed: false
        });
    }

    if (!saveTasks()) {
        tasks = previousTasks;
        renderTasks();
        return;
    }

    const wasEditing = editingTaskId !== null;
    resetForm();
    message.textContent = wasEditing
        ? "Task updated successfully."
        : "Task added successfully.";

    renderTasks();
});

cancelButton.addEventListener("click", () => {
    resetForm();
    message.textContent = "Editing cancelled.";
});

searchInput.addEventListener("input", () => {
    searchText = searchInput.value.trim();
    renderTasks();
});

filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;

        filterButtons.forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");
        renderTasks();
    });
});

renderTasks();

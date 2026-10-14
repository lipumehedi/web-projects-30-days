
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const searchInput = document.getElementById("searchInput");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const emptyMessage = document.getElementById("emptyMessage");
const clearButton = document.getElementById("clearButton");
const message = document.getElementById("message");
const filterButtons = document.querySelectorAll(".filter-btn");

const STORAGE_KEY = "day17-todo-tasks";

let tasks = loadTasks();
let currentFilter = "all";
let searchText = "";

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
            typeof task.completed === "boolean"
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
    return tasks.filter(function (task) {
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

    visibleTasks.forEach(function (task) {
        const li = document.createElement("li");
        li.className = "task";

        if (task.completed) {
            li.classList.add("completed");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", `Complete ${task.text}`);

        checkbox.addEventListener("change", function () {
            const previousValue = task.completed;
            task.completed = checkbox.checked;

            if (!saveTasks()) {
                task.completed = previousValue;
            }

            renderTasks();
        });

        const span = document.createElement("span");
        span.textContent = task.text;

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", function () {
            const previousTasks = tasks;
            tasks = tasks.filter(item => item.id !== task.id);

            if (!saveTasks()) {
                tasks = previousTasks;
                renderTasks();
                return;
            }

            message.textContent = "Task deleted.";
            renderTasks();
        });

        li.append(checkbox, span, deleteButton);
        taskList.appendChild(li);
    });

    const completedCount = tasks.filter(
        task => task.completed
    ).length;

    const pendingCount = tasks.length - completedCount;

    taskCount.textContent =
        `Total: ${tasks.length} | Pending: ${pendingCount} | Completed: ${completedCount}`;

    emptyMessage.style.display =
        visibleTasks.length === 0 ? "block" : "none";
}

taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const text = taskInput.value.trim();

    if (!text) {
        message.textContent = "Please enter a task.";
        return;
    }

    const newTask = {
        id: crypto.randomUUID(),
        text: text,
        completed: false
    };

    tasks.push(newTask);

    if (!saveTasks()) {
        tasks.pop();
        return;
    }

    taskInput.value = "";
    message.textContent = "Task added successfully.";
    renderTasks();
});

searchInput.addEventListener("input", function () {
    searchText = searchInput.value.trim();
    renderTasks();
});

filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        currentFilter = button.dataset.filter;

        filterButtons.forEach(function (item) {
            item.classList.remove("active");
        });

        button.classList.add("active");
        renderTasks();
    });
});

clearButton.addEventListener("click", function () {
    if (tasks.length === 0) {
        message.textContent = "No tasks to clear.";
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

    message.textContent = "All tasks cleared.";
    renderTasks();
});

renderTasks();

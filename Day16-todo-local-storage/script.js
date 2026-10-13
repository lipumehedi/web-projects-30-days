
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const clearButton = document.getElementById("clearButton");
const message = document.getElementById("message");

const STORAGE_KEY = "day16-todo-tasks";

let tasks = loadTasks();

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
        message.textContent = "Unable to save tasks.";
        return false;
    }
}

function renderTasks() {
    taskList.replaceChildren();

    tasks.forEach(function (task) {
        const li = document.createElement("li");
        li.className = "task";

        if (task.completed) {
            li.classList.add("completed");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", "Complete task");

        checkbox.addEventListener("change", function () {
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        const span = document.createElement("span");
        span.textContent = task.text;

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";
        deleteButton.type = "button";

        deleteButton.addEventListener("click", function () {
            tasks = tasks.filter(item => item.id !== task.id);
            saveTasks();
            renderTasks();
            message.textContent = "Task deleted.";
        });

        li.append(checkbox, span, deleteButton);
        taskList.appendChild(li);
    });

    const completed = tasks.filter(task => task.completed).length;
    taskCount.textContent =
        `${tasks.length} tasks • ${completed} completed`;
}

taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const text = taskInput.value.trim();

    if (!text) {
        message.textContent = "Please enter a task.";
        return;
    }

    tasks.push({
        id: crypto.randomUUID(),
        text: text,
        completed: false
    });

    if (!saveTasks()) {
        tasks.pop();
        renderTasks();
        return;
    }

    renderTasks();
    taskInput.value = "";
    message.textContent = "Task added successfully.";
    taskInput.focus();
});

clearButton.addEventListener("click", function () {
    if (tasks.length === 0) {
        message.textContent = "No tasks to clear.";
        return;
    }

    if (!confirm("Delete all tasks?")) {
        return;
    }

    const previousTasks = tasks;
    tasks = [];

    if (!saveTasks()) {
        tasks = previousTasks;
        renderTasks();
        return;
    }

    renderTasks();
    message.textContent = "All tasks cleared.";
});

renderTasks();

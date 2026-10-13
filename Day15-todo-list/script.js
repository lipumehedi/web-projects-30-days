
const taskInput = document.getElementById("taskInput");
const addButton = document.getElementById("addButton");
const taskList = document.getElementById("taskList");
const message = document.getElementById("message");

function addTask() {
    const taskText = taskInput.value.trim();

    // Check empty input
    if (taskText === "") {
        message.textContent = "Please enter a task.";
        taskInput.focus();
        return;
    }

    // Create list item
    const li = document.createElement("li");
    li.className = "task";

    // Create task text
    const span = document.createElement("span");
    span.textContent = taskText;
    span.title = "Click to mark complete";

    // Mark task as complete
    span.addEventListener("click", function () {
        li.classList.toggle("completed");
    });

    // Create delete button
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.className = "delete-btn";
    deleteButton.type = "button";
    deleteButton.setAttribute("aria-label", `Delete task: ${taskText}`);

    // Delete task
    deleteButton.addEventListener("click", function () {
        li.remove();
    });

    // Add elements to list item
    li.appendChild(span);
    li.appendChild(deleteButton);

    // Add task to the page
    taskList.appendChild(li);

    // Clear input and message
    taskInput.value = "";
    message.textContent = "";
    taskInput.focus();
}

// Add button click
addButton.addEventListener("click", addTask);

// Press Enter to add task
taskInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        addTask();
    }
});

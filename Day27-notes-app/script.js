
const noteForm = document.getElementById("noteForm");
const noteTitle = document.getElementById("noteTitle");
const noteContent = document.getElementById("noteContent");

const saveButton = document.getElementById("saveButton");
const cancelButton = document.getElementById("cancelButton");
const formHeading = document.getElementById("formHeading");

const searchInput = document.getElementById("searchInput");
const notesContainer = document.getElementById("notesContainer");
const notesCount = document.getElementById("notesCount");
const emptyMessage = document.getElementById("emptyMessage");
const statusMessage = document.getElementById("statusMessage");

// Load saved notes from Local Storage
function loadNotes() {
    try {
        const savedNotes = localStorage.getItem("myNotes");

        if (!savedNotes) {
            return [];
        }

        const parsedNotes = JSON.parse(savedNotes);

        if (!Array.isArray(parsedNotes)) {
            return [];
        }

        return parsedNotes.filter(note =>
            note &&
            typeof note.id === "string" &&
            typeof note.title === "string" &&
            typeof note.content === "string" &&
            typeof note.date === "string"
        );
    } catch (error) {
        console.error("Could not load notes:", error);
        return [];
    }
}

let notes = loadNotes();
let editingNoteId = null;

// Save notes to Local Storage
function saveNotes() {
    try {
        localStorage.setItem("myNotes", JSON.stringify(notes));
        return true;
    } catch (error) {
        console.error("Could not save notes:", error);
        statusMessage.textContent =
            "Could not save notes. Check your browser storage.";
        return false;
    }
}

// Format a date for display
function formatDate(dateString) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "Date unavailable";
    }

    return date.toLocaleString();
}

// Create an HTML element safely
function createElement(tag, className, text = "") {
    const element = document.createElement(tag);
    element.className = className;
    element.textContent = text;
    return element;
}

// Display notes on the page
function renderNotes() {
    notesContainer.replaceChildren();

    const searchTerm = searchInput.value.trim().toLowerCase();

    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(searchTerm) ||
        note.content.toLowerCase().includes(searchTerm)
    );

    notesCount.textContent =
        `${notes.length} ${notes.length === 1 ? "note" : "notes"} saved`;

    emptyMessage.classList.toggle(
        "hidden",
        filteredNotes.length > 0
    );

    if (filteredNotes.length === 0) {
        emptyMessage.textContent = searchTerm
            ? "No notes match your search."
            : "No notes yet. Create your first note above!";
    }

    filteredNotes.forEach(note => {
        const card = createElement("article", "note-card");

        const title = createElement("h3", "", note.title);
        const date = createElement(
            "p",
            "note-date",
            `Last updated: ${formatDate(note.date)}`
        );
        const content = createElement(
            "p",
            "note-content",
            note.content
        );

        const actions = createElement("div", "note-actions");

        const editButton = createElement(
            "button",
            "edit-button",
            "✏️ Edit"
        );
        editButton.type = "button";
        editButton.addEventListener("click", () => {
            editNote(note.id);
        });

        const deleteButton = createElement(
            "button",
            "delete-button",
            "🗑️ Delete"
        );
        deleteButton.type = "button";
        deleteButton.addEventListener("click", () => {
            deleteNote(note.id);
        });

        actions.append(editButton, deleteButton);
        card.append(title, date, content, actions);
        notesContainer.appendChild(card);
    });
}

// Create a new note or update an existing note
noteForm.addEventListener("submit", event => {
    event.preventDefault();

    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();

    if (!title || !content) {
        statusMessage.textContent =
            "Please enter both a title and note content.";
        return;
    }

    const previousNotes = [...notes];

    if (editingNoteId !== null) {
        notes = notes.map(note =>
            note.id === editingNoteId
                ? {
                    ...note,
                    title,
                    content,
                    date: new Date().toISOString()
                }
                : note
        );
    } else {
        const newNote = {
            id: crypto.randomUUID(),
            title,
            content,
            date: new Date().toISOString()
        };

        notes.unshift(newNote);
    }

    if (!saveNotes()) {
        notes = previousNotes;
        return;
    }

    const wasEditing = editingNoteId !== null;

    resetForm();
    renderNotes();

    statusMessage.textContent = wasEditing
        ? "Note updated successfully!"
        : "Note saved successfully!";
});

// Fill the form with an existing note
function editNote(id) {
    const note = notes.find(item => item.id === id);

    if (!note) {
        return;
    }

    editingNoteId = id;

    noteTitle.value = note.title;
    noteContent.value = note.content;

    formHeading.textContent = "Edit Note";
    saveButton.textContent = "💾 Update Note";
    cancelButton.classList.remove("hidden");

    statusMessage.textContent = "Editing your note.";
    noteForm.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    noteTitle.focus();
}

// Delete a note
function deleteNote(id) {
    const note = notes.find(item => item.id === id);

    if (!note) {
        return;
    }

    const confirmed = confirm(
        `Are you sure you want to delete "${note.title}"?`
    );

    if (!confirmed) {
        return;
    }

    const previousNotes = [...notes];
    notes = notes.filter(item => item.id !== id);

    if (!saveNotes()) {
        notes = previousNotes;
        return;
    }

    if (editingNoteId === id) {
        resetForm();
    }

    renderNotes();
    statusMessage.textContent = "Note deleted successfully!";
}

// Reset the form and exit edit mode
function resetForm() {
    noteForm.reset();
    editingNoteId = null;

    formHeading.textContent = "Create a New Note";
    saveButton.textContent = "+ Save Note";
    cancelButton.classList.add("hidden");
}

// Cancel editing
cancelButton.addEventListener("click", () => {
    resetForm();
    statusMessage.textContent = "Editing cancelled.";
});

// Search notes as the user types
searchInput.addEventListener("input", renderNotes);

// Initial render when the app opens
renderNotes();

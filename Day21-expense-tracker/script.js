
const transactionForm = document.getElementById("transactionForm");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");

const formTitle = document.getElementById("formTitle");
const submitButton = document.getElementById("submitButton");
const cancelButton = document.getElementById("cancelButton");
const message = document.getElementById("message");

const balanceAmount = document.getElementById("balanceAmount");
const incomeAmount = document.getElementById("incomeAmount");
const expenseAmount = document.getElementById("expenseAmount");

const searchInput = document.getElementById("searchInput");
const typeFilter = document.getElementById("typeFilter");
const categoryFilter = document.getElementById("categoryFilter");
const sortSelect = document.getElementById("sortSelect");

const transactionList = document.getElementById("transactionList");
const emptyMessage = document.getElementById("emptyMessage");
const resultCount = document.getElementById("resultCount");
const clearAllButton = document.getElementById("clearAllButton");

const STORAGE_KEY = "day21-expense-tracker";

const validTypes = ["income", "expense"];

const validCategories = [
    "food",
    "transport",
    "housing",
    "salary",
    "shopping",
    "health",
    "entertainment",
    "other"
];

const categoryNames = {
    food: "Food",
    transport: "Transport",
    housing: "Housing",
    salary: "Salary",
    shopping: "Shopping",
    health: "Health",
    entertainment: "Entertainment",
    other: "Other"
};

const categoryIcons = {
    food: "🍱",
    transport: "🚆",
    housing: "🏠",
    salary: "💴",
    shopping: "🛍️",
    health: "🏥",
    entertainment: "🎮",
    other: "📌"
};

let transactions = loadTransactions();
let editingTransactionId = null;

// Get today's date in local time
function getTodayString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Set today's date as the default
dateInput.value = getTodayString();

// Validate YYYY-MM-DD dates, including leap years
function isValidDate(dateString) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return false;
    }

    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
}

// Load saved transactions
function loadTransactions() {
    try {
        const saved = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
        );

        if (!Array.isArray(saved)) {
            return [];
        }

        return saved.filter(item =>
            item &&
            typeof item.id === "string" &&
            typeof item.description === "string" &&
            item.description.trim().length > 0 &&
            Number.isSafeInteger(item.amount) &&
            item.amount > 0 &&
            item.amount <= 1000000000 &&
            validTypes.includes(item.type) &&
            validCategories.includes(item.category) &&
            isValidDate(item.date)
        ).map(item => ({
            id: item.id,
            description: item.description,
            amount: item.amount,
            type: item.type,
            category: item.category,
            date: item.date,
            createdAt: Number.isFinite(item.createdAt)
                ? item.createdAt
                : 0
        }));
    } catch (error) {
        console.error("Could not load transactions:", error);
        return [];
    }
}

// Save transactions to Local Storage
function saveTransactions() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(transactions)
        );

        return true;
    } catch (error) {
        console.error("Could not save transactions:", error);
        showMessage(
            "Could not save data in this browser.",
            true
        );

        return false;
    }
}

// Display a message
function showMessage(text, isError = false) {
    message.textContent = text;
    message.style.color = isError ? "#b42318" : "#267447";
}

// Format amounts as Japanese yen
function formatYen(amount) {
    return new Intl.NumberFormat("ja-JP", {
        style: "currency",
        currency: "JPY",
        maximumFractionDigits: 0
    }).format(amount);
}

// Format dates for display
function formatDate(dateString) {
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

// Create an ID for each transaction
function createTransactionId() {
    if (window.crypto &&
        typeof window.crypto.randomUUID === "function") {
        return window.crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// Calculate income, expenses, and balance
function updateDashboard() {
    const totalIncome = transactions
        .filter(item => item.type === "income")
        .reduce((sum, item) => sum + item.amount, 0);

    const totalExpenses = transactions
        .filter(item => item.type === "expense")
        .reduce((sum, item) => sum + item.amount, 0);

    const balance = totalIncome - totalExpenses;

    incomeAmount.textContent = formatYen(totalIncome);
    expenseAmount.textContent = formatYen(totalExpenses);
    balanceAmount.textContent = formatYen(balance);

    balanceAmount.classList.toggle("income-text", balance > 0);
    balanceAmount.classList.toggle("expense-text", balance < 0);
}

// Reset the form
function resetForm() {
    transactionForm.reset();
    dateInput.value = getTodayString();
    typeInput.value = "expense";
    categoryInput.value = "other";

    editingTransactionId = null;
    formTitle.textContent = "Add a transaction";
    submitButton.textContent = "Add Transaction";
    cancelButton.classList.add("hidden");
}

// Sort transactions
function sortTransactions(items) {
    const sorted = [...items];

    switch (sortSelect.value) {
        case "oldest":
            sorted.sort((a, b) =>
                a.date.localeCompare(b.date) ||
                a.createdAt - b.createdAt
            );
            break;

        case "highest":
            sorted.sort((a, b) =>
                b.amount - a.amount ||
                b.date.localeCompare(a.date)
            );
            break;

        case "lowest":
            sorted.sort((a, b) =>
                a.amount - b.amount ||
                b.date.localeCompare(a.date)
            );
            break;

        case "newest":
        default:
            sorted.sort((a, b) =>
                b.date.localeCompare(a.date) ||
                b.createdAt - a.createdAt
            );
    }

    return sorted;
}

// Search and filter transactions
function getVisibleTransactions() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedType = typeFilter.value;
    const selectedCategory = categoryFilter.value;

    const filtered = transactions.filter(item => {
        const matchesSearch = item.description
            .toLowerCase()
            .includes(searchTerm);

        const matchesType =
            selectedType === "all" ||
            item.type === selectedType;

        const matchesCategory =
            selectedCategory === "all" ||
            item.category === selectedCategory;

        return matchesSearch && matchesType && matchesCategory;
    });

    return sortTransactions(filtered);
}

// Render the transaction list
function renderTransactions() {
    transactionList.replaceChildren();

    const visibleTransactions = getVisibleTransactions();

    visibleTransactions.forEach(item => {
        const listItem = document.createElement("li");
        listItem.className = "transaction-item";

        const icon = document.createElement("div");
        icon.className = "transaction-icon";
        icon.textContent = categoryIcons[item.category];
        icon.setAttribute("aria-hidden", "true");

        const content = document.createElement("div");
        content.className = "transaction-content";

        const description = document.createElement("div");
        description.className = "transaction-description";
        description.textContent = item.description;

        const meta = document.createElement("div");
        meta.className = "transaction-meta";

        const categoryLabel = document.createElement("span");
        categoryLabel.textContent = categoryNames[item.category];

        const dateLabel = document.createElement("span");
        dateLabel.textContent = formatDate(item.date);

        const typeLabel = document.createElement("span");
        typeLabel.textContent =
            item.type === "income" ? "Income" : "Expense";

        meta.append(categoryLabel, dateLabel, typeLabel);
        content.append(description, meta);

        const rightSide = document.createElement("div");

        const amount = document.createElement("div");
        amount.className = "transaction-amount";
        amount.classList.add(
            item.type === "income" ? "income-text" : "expense-text"
        );

        amount.textContent =
            `${item.type === "income" ? "+" : "−"}${formatYen(item.amount)}`;

        const actions = document.createElement("div");
        actions.className = "transaction-actions";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "edit-button";
        editButton.textContent = "Edit";

        editButton.addEventListener("click", () => {
            startEditing(item.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            deleteTransaction(item.id);
        });

        actions.append(editButton, deleteButton);
        rightSide.append(amount, actions);

        listItem.append(icon, content, rightSide);
        transactionList.append(listItem);
    });

    resultCount.textContent =
        `${visibleTransactions.length} transaction` +
        `${visibleTransactions.length === 1 ? "" : "s"}`;

    emptyMessage.hidden = visibleTransactions.length > 0;

    if (transactions.length === 0) {
        emptyMessage.textContent =
            "No transactions yet. Add your first transaction!";
    } else if (visibleTransactions.length === 0) {
        emptyMessage.textContent = "No matching transactions found.";
    }

    clearAllButton.disabled = transactions.length === 0;
}

// Refresh the entire page data
function renderAll() {
    updateDashboard();
    renderTransactions();
}

// Add a new transaction or update an existing one
transactionForm.addEventListener("submit", event => {
    event.preventDefault();

    const description = descriptionInput.value.trim();
    const amount = Number(amountInput.value);
    const type = typeInput.value;
    const category = categoryInput.value;
    const date = dateInput.value;

    if (!description) {
        showMessage("Please enter a description.", true);
        descriptionInput.focus();
        return;
    }

    if (
        !Number.isSafeInteger(amount) ||
        amount < 1 ||
        amount > 1000000000
    ) {
        showMessage(
            "Enter a whole-number amount between ¥1 and ¥1,000,000,000.",
            true
        );
        amountInput.focus();
        return;
    }

    if (!validTypes.includes(type)) {
        showMessage("Please select a valid transaction type.", true);
        return;
    }

    if (!validCategories.includes(category)) {
        showMessage("Please select a valid category.", true);
        return;
    }

    if (!isValidDate(date)) {
        showMessage("Please select a valid date.", true);
        dateInput.focus();
        return;
    }

    if (editingTransactionId !== null) {
        const transaction = transactions.find(
            item => item.id === editingTransactionId
        );

        if (!transaction) {
            showMessage("Transaction not found.", true);
            resetForm();
            return;
        }

        const previousTransaction = { ...transaction };

        transaction.description = description;
        transaction.amount = amount;
        transaction.type = type;
        transaction.category = category;
        transaction.date = date;

        if (!saveTransactions()) {
            Object.assign(transaction, previousTransaction);
            return;
        }

        showMessage("Transaction updated successfully.");
    } else {
        const newTransaction = {
            id: createTransactionId(),
            description,
            amount,
            type,
            category,
            date,
            createdAt: Date.now()
        };

        transactions.push(newTransaction);

        if (!saveTransactions()) {
            transactions = transactions.filter(
                item => item.id !== newTransaction.id
            );
            return;
        }

        showMessage("Transaction added successfully.");
    }

    resetForm();
    renderAll();
});

// Edit a transaction
function startEditing(transactionId) {
    const transaction = transactions.find(
        item => item.id === transactionId
    );

    if (!transaction) {
        return;
    }

    editingTransactionId = transactionId;

    descriptionInput.value = transaction.description;
    amountInput.value = transaction.amount;
    typeInput.value = transaction.type;
    categoryInput.value = transaction.category;
    dateInput.value = transaction.date;

    formTitle.textContent = "Edit transaction";
    submitButton.textContent = "Save Changes";
    cancelButton.classList.remove("hidden");

    showMessage("Update the transaction and save your changes.");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// Delete a single transaction
function deleteTransaction(transactionId) {
    const transaction = transactions.find(
        item => item.id === transactionId
    );

    if (
        !transaction ||
        !confirm(`Delete "${transaction.description}"?`)
    ) {
        return;
    }

    const previousTransactions = transactions;

    transactions = transactions.filter(
        item => item.id !== transactionId
    );

    if (!saveTransactions()) {
        transactions = previousTransactions;
        renderAll();
        return;
    }

    if (editingTransactionId === transactionId) {
        resetForm();
    }

    showMessage("Transaction deleted.");
    renderAll();
}

// Cancel editing
cancelButton.addEventListener("click", () => {
    resetForm();
    showMessage("Editing cancelled.");
});

// Search, filter, and sorting events
searchInput.addEventListener("input", renderTransactions);
typeFilter.addEventListener("change", renderTransactions);
categoryFilter.addEventListener("change", renderTransactions);
sortSelect.addEventListener("change", renderTransactions);

// Clear all transactions
clearAllButton.addEventListener("click", () => {
    if (transactions.length === 0) {
        return;
    }

    if (!confirm("Are you sure you want to delete all transactions?")) {
        return;
    }

    const previousTransactions = transactions;
    transactions = [];

    if (!saveTransactions()) {
        transactions = previousTransactions;
        renderAll();
        return;
    }

    resetForm();
    showMessage("All transactions cleared.");
    renderAll();
});

// Initial display
renderAll();

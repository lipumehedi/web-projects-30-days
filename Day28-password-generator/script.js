
const passwordOutput = document.getElementById("passwordOutput");
const copyButton = document.getElementById("copyButton");

const lengthSlider = document.getElementById("lengthSlider");
const lengthValue = document.getElementById("lengthValue");

const uppercaseCheckbox = document.getElementById("uppercase");
const lowercaseCheckbox = document.getElementById("lowercase");
const numbersCheckbox = document.getElementById("numbers");
const symbolsCheckbox = document.getElementById("symbols");

const generateButton = document.getElementById("generateButton");
const copyMessage = document.getElementById("copyMessage");
const statusMessage = document.getElementById("statusMessage");

const strengthLabel = document.getElementById("strengthLabel");
const strengthBar = document.getElementById("strengthBar");
const strengthFill = document.getElementById("strengthFill");

const characterSets = {
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*()-_=+[]{};:,.?"
};

// Return a cryptographically generated integer from 0 to max - 1.
// Rejection sampling avoids modulo bias.
function randomInt(max) {
    if (!Number.isInteger(max) || max < 1 || max > 4294967296) {
        throw new Error("Invalid random number range.");
    }

    const range = 4294967296;
    const limit = Math.floor(range / max) * max;
    const values = new Uint32Array(1);

    do {
        crypto.getRandomValues(values);
    } while (values[0] >= limit);

    return values[0] % max;
}

// Shuffle characters using the Fisher-Yates algorithm
function shuffleCharacters(characters) {
    const shuffled = [...characters];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = randomInt(i + 1);

        [shuffled[i], shuffled[j]] = [
            shuffled[j],
            shuffled[i]
        ];
    }

    return shuffled.join("");
}

// Get the selected character categories
function getSelectedSets() {
    const selectedSets = [];

    if (uppercaseCheckbox.checked) {
        selectedSets.push(characterSets.uppercase);
    }

    if (lowercaseCheckbox.checked) {
        selectedSets.push(characterSets.lowercase);
    }

    if (numbersCheckbox.checked) {
        selectedSets.push(characterSets.numbers);
    }

    if (symbolsCheckbox.checked) {
        selectedSets.push(characterSets.symbols);
    }

    return selectedSets;
}

// Generate the password
function generatePassword() {
    const length = Number(lengthSlider.value);
    const selectedSets = getSelectedSets();

    copyMessage.textContent = "";
    statusMessage.textContent = "";

    if (selectedSets.length === 0) {
        passwordOutput.value = "";
        resetStrength();

        statusMessage.textContent =
            "Please select at least one character type.";

        return;
    }

    try {
        // Guarantee at least one character from every selected set
        const passwordCharacters = selectedSets.map(set => {
            return set[randomInt(set.length)];
        });

        // Combine all selected character sets
        const allCharacters = selectedSets.join("");

        // Fill the remaining password length
        while (passwordCharacters.length < length) {
            passwordCharacters.push(
                allCharacters[randomInt(allCharacters.length)]
            );
        }

        // Shuffle to avoid predictable category positions
        const password = shuffleCharacters(passwordCharacters);

        passwordOutput.value = password;

        updateStrength(length, selectedSets.length);

        statusMessage.textContent = "Password generated successfully!";
    } catch (error) {
        console.error("Password generation failed:", error);

        passwordOutput.value = "";
        resetStrength();

        statusMessage.textContent =
            "Secure password generation is unavailable in this browser context.";
    }
}

// Estimate strength using length and selected character categories
function updateStrength(length, categoryCount) {
    let score = 0;

    if (length >= 8) score++;
    if (length >= 12) score++;
    if (length >= 16) score++;
    if (categoryCount >= 3 && length >= 12) score++;

    const labels = [
        "Very weak",
        "Weak",
        "Fair",
        "Strong",
        "Very strong"
    ];

    const percentages = [0, 25, 50, 75, 100];

    strengthLabel.textContent = labels[score];
    strengthFill.style.width = `${percentages[score]}%`;
    strengthBar.setAttribute("aria-valuenow", String(score));
}

// Reset strength indicator
function resetStrength() {
    strengthLabel.textContent = "Not generated";
    strengthFill.style.width = "0%";
    strengthBar.setAttribute("aria-valuenow", "0");
}

// Update displayed password length
lengthSlider.addEventListener("input", () => {
    lengthValue.textContent = lengthSlider.value;
});

// Copy password to clipboard
copyButton.addEventListener("click", async () => {
    const password = passwordOutput.value;

    copyMessage.textContent = "";

    if (!password) {
        copyMessage.textContent = "Generate a password first.";
        return;
    }

    try {
        await navigator.clipboard.writeText(password);
        copyMessage.textContent = "Password copied to clipboard!";
    } catch (error) {
        console.error("Clipboard access failed:", error);

        copyMessage.textContent =
            "Copy failed. Select the password and copy it manually.";
    }
});

// Generate a password when the button is clicked
generateButton.addEventListener("click", generatePassword);

// Clear the old password when character settings change
[
    uppercaseCheckbox,
    lowercaseCheckbox,
    numbersCheckbox,
    symbolsCheckbox
].forEach(checkbox => {
    checkbox.addEventListener("change", () => {
        passwordOutput.value = "";
        copyMessage.textContent = "";
        statusMessage.textContent =
            "Settings changed. Generate a new password.";
        resetStrength();
    });
});

// Create the first password when the app opens
generatePassword();

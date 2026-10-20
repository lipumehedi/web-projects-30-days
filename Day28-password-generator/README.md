# 🔐 Day 28 — Password Generator

A responsive password generator built with HTML, CSS, and vanilla JavaScript.

## ✨ Features

- Generate random passwords from 8 to 64 characters
- Choose uppercase and lowercase letters
- Include numbers and symbols
- Ensure at least one character from each selected category
- Copy passwords to the clipboard
- Estimated password strength indicator
- Responsive desktop and mobile layout
- Cryptographically secure random number generation using the Web Crypto API

## 🛠️ Technologies

- HTML5
- CSS3
- JavaScript
- Web Crypto API
- Clipboard API
- DOM Manipulation

## 📂 Project Structure

```text
Day-28-password-generator/
├── index.html
├── style.css
├── script.js
└── README.md
```

## 🚀 How to Run

1. Clone or download this repository.
2. Open the folder in VS Code.
3. Open `index.html` using Live Server.
4. Choose your password length and character types.
5. Click **Generate Password**.
6. Click **Copy** to copy your password.

## 📚 What I Learned

- Generating random values with `crypto.getRandomValues()`
- Using arrays and strings to build passwords
- Implementing the Fisher-Yates shuffle algorithm
- Handling checkboxes and range inputs
- Copying text using the Clipboard API
- Updating the DOM dynamically

## 🔒 Security Notes

- Passwords are generated in the browser and are not intentionally sent to a server.
- The strength indicator is a simple estimate, not a complete security assessment.
- Use a unique password for each account.
- Store important passwords in a reputable password manager.

## 🔮 Future Improvements

- Add password history with an explicit privacy-conscious design
- Add an option to exclude ambiguous characters
- Add passphrase generation
- Add a password length preset selector

---

**Part of my 30 Days of Web Projects challenge.**

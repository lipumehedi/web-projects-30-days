# 🐙 Day 29 — GitHub Profile Finder

A responsive GitHub Profile Finder built with HTML, CSS, JavaScript, and the GitHub REST API.

## ✨ Features

- Search GitHub users by username
- Display profile avatar, name, bio, and location
- Show public repository, follower, and following counts
- Display recently updated public repositories
- Show repository descriptions, languages, stars, and forks
- Loading states and error handling
- Responsive desktop and mobile layout
- Safe DOM rendering

## 🛠️ Technologies

- HTML5
- CSS3
- JavaScript
- GitHub REST API
- Fetch API
- Async/Await
- JSON
- DOM Manipulation

## 📂 Project Structure

```text
Day-29-github-profile-finder/
├── index.html
├── style.css
├── script.js
└── README.md
```

## 🚀 How to Run

1. Clone or download this repository.
2. Open the project folder in VS Code.
3. Open `index.html` using Live Server.
4. Enter a GitHub username.
5. Click **Search** to view the profile and public repositories.

## 🔌 API Endpoints

**User profile**

`https://api.github.com/users/USERNAME`

**Public repositories**

`https://api.github.com/users/USERNAME/repos?sort=updated&per_page=6`

Public profile data can be accessed without a personal access token, subject to GitHub API rate limits.

## 📚 What I Learned

- Fetching data from a REST API
- Using `async` and `await`
- Working with JSON responses
- Handling HTTP errors
- Rendering API data dynamically
- Creating repository cards
- Validating user input
- Building responsive layouts

## 🔮 Future Improvements

- Add repository search and sorting
- Add pagination for repositories
- Add dark mode
- Add language-based filtering
- Show repository topics

---

**Part of my 30 Days of Web Projects challenge.**

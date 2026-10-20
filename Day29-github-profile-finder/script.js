
const searchForm = document.getElementById("searchForm");
const usernameInput = document.getElementById("usernameInput");
const searchButton = document.getElementById("searchButton");

const statusMessage = document.getElementById("statusMessage");
const profileSection = document.getElementById("profileSection");
const welcomeSection = document.getElementById("welcomeSection");

const avatar = document.getElementById("avatar");
const profileName = document.getElementById("profileName");
const profileUsername = document.getElementById("profileUsername");
const profileBio = document.getElementById("profileBio");
const profileLocation = document.getElementById("profileLocation");
const profileCompany = document.getElementById("profileCompany");
const profileBlog = document.getElementById("profileBlog");
const profileJoined = document.getElementById("profileJoined");
const profileLink = document.getElementById("profileLink");

const repoCount = document.getElementById("repoCount");
const followersCount = document.getElementById("followersCount");
const followingCount = document.getElementById("followingCount");

const repoStatus = document.getElementById("repoStatus");
const repositoriesContainer = document.getElementById(
    "repositoriesContainer"
);

// Fetch JSON from the GitHub API
async function fetchGitHubData(url) {
    const response = await fetch(url, {
        headers: {
            Accept: "application/vnd.github+json"
        }
    });

    if (!response.ok) {
        const error = new Error(`Request failed: ${response.status}`);
        error.status = response.status;
        throw error;
    }

    return response.json();
}

// Create HTML elements safely
function createElement(tag, className, text = "") {
    const element = document.createElement(tag);
    element.className = className;
    element.textContent = text;
    return element;
}

// Add a link only when its URL uses HTTP or HTTPS
function createSafeLink(url, text) {
    try {
        const parsedUrl = new URL(url);

        if (!["https:", "http:"].includes(parsedUrl.protocol)) {
            return createElement("span", "", text);
        }

        const link = createElement("a", "", text);
        link.href = parsedUrl.href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        return link;
    } catch {
        return createElement("span", "", text);
    }
}

// Format the account creation date
function formatDate(dateString) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "Unknown";
    }

    return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

// Show profile information
function displayProfile(user) {
    avatar.src = user.avatar_url;
    avatar.alt = `${user.login}'s GitHub avatar`;

    profileName.textContent = user.name || user.login;
    profileUsername.textContent = `@${user.login}`;
    profileBio.textContent = user.bio || "No public bio available.";

    profileLocation.textContent = user.location
        ? `📍 ${user.location}`
        : "📍 Location not provided";

    profileCompany.textContent = user.company
        ? `🏢 ${user.company}`
        : "🏢 Company not provided";

    profileBlog.replaceChildren();

    if (user.blog) {
        let blogUrl = user.blog.trim();

        if (!/^https?:\/\//i.test(blogUrl)) {
            blogUrl = `https://${blogUrl}`;
        }

        const blogLink = createSafeLink(blogUrl, "🔗 Website");
        profileBlog.appendChild(blogLink);
    } else {
        profileBlog.textContent = "🔗 No website provided";
    }

    profileJoined.textContent =
        `📅 Joined ${formatDate(user.created_at)}`;

    profileLink.href = user.html_url;
    profileLink.textContent = "View GitHub Profile ↗";

    repoCount.textContent = user.public_repos;
    followersCount.textContent = user.followers;
    followingCount.textContent = user.following;

    profileSection.classList.remove("hidden");
    welcomeSection.classList.add("hidden");
}

// Show repository cards
function displayRepositories(repositories) {
    repositoriesContainer.replaceChildren();

    if (repositories.length === 0) {
        repoStatus.textContent = "No public repositories found.";
        return;
    }

    repoStatus.textContent =
        `Showing ${repositories.length} recently updated public repositories.`;

    repositories.forEach(repo => {
        const card = createElement("article", "repo-card");

        const title = createElement("h3", "");
        const repoLink = createSafeLink(
            repo.html_url,
            repo.name
        );

        title.appendChild(repoLink);

        const description = createElement(
            "p",
            "repo-description",
            repo.description || "No description provided."
        );

        const meta = createElement("div", "repo-meta");

        const language = createElement(
            "span",
            "",
            `💻 ${repo.language || "Not specified"}`
        );

        const stars = createElement(
            "span",
            "",
            `⭐ ${repo.stargazers_count}`
        );

        const forks = createElement(
            "span",
            "",
            `🍴 ${repo.forks_count}`
        );

        meta.append(language, stars, forks);
        card.append(title, description, meta);

        repositoriesContainer.appendChild(card);
    });
}

// Search for a GitHub user
async function searchProfile(username) {
    const cleanUsername = username.trim();

    if (!cleanUsername) {
        statusMessage.textContent = "Please enter a GitHub username.";
        return;
    }

    // Prevent invalid characters in the username path
    if (!/^[a-zA-Z0-9-]{1,39}$/.test(cleanUsername)) {
        statusMessage.textContent =
            "Enter a valid GitHub username.";
        return;
    }

    searchButton.disabled = true;
    searchButton.textContent = "Searching...";
    statusMessage.textContent = "Loading GitHub profile...";
    repoStatus.textContent = "";
    repositoriesContainer.replaceChildren();
    profileSection.classList.add("hidden");
    welcomeSection.classList.add("hidden");

    try {
        const userUrl =
            `https://api.github.com/users/${encodeURIComponent(cleanUsername)}`;

        const user = await fetchGitHubData(userUrl);

        displayProfile(user);
        statusMessage.textContent = "Profile loaded successfully!";

        // Load public repositories separately
        const reposUrl =
            `https://api.github.com/users/${encodeURIComponent(user.login)}/repos?sort=updated&per_page=6`;

        try {
            const repositories = await fetchGitHubData(reposUrl);
            displayRepositories(repositories);
        } catch (error) {
            console.error("Repository request failed:", error);
            repoStatus.textContent =
                "Could not load repositories. Please try again later.";
        }
    } catch (error) {
        console.error("Profile request failed:", error);

        profileSection.classList.add("hidden");
        welcomeSection.classList.remove("hidden");

        if (error.status === 404) {
            statusMessage.textContent =
                "User not found. Please check the username.";
        } else if (error.status === 403 || error.status === 429) {
            statusMessage.textContent =
                "GitHub API rate limit reached. Please wait and try again.";
        } else {
            statusMessage.textContent =
                "Could not load profile. Check your connection and try again.";
        }
    } finally {
        searchButton.disabled = false;
        searchButton.textContent = "Search";
    }
}

// Handle form submission
searchForm.addEventListener("submit", event => {
    event.preventDefault();
    searchProfile(usernameInput.value);
});

// Optional: search a sample profile on initial page load
searchProfile("octocat");

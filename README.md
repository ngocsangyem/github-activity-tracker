# GitHub Activity Tracker

A Node.js application to track commit activity in a GitHub organization. This project uses the GitHub API to fetch commit data and stores it in a SQLite database. It also provides a REST API to query the data.

---

## Features

- **Crawl GitHub Repositories**: Fetches commit data from all repositories in a GitHub organization.
- **Track Commit Activity**: Stores commit data in a SQLite database.
- **Leaderboard**: Provides a leaderboard of users based on commit counts.
- **REST API**: Exposes endpoints to query commit data and leaderboard.

---

## Technologies Used

- **Node.js**: Runtime environment.
- **TypeScript**: Programming language.
- **Express**: Web framework for the REST API.
- **SQLite**: Database for storing commit data.
- **Octokit**: GitHub API client.
- **Croner**: Library for scheduling tasks (e.g., crawling GitHub data).

---

## Getting Started

### Prerequisites

- Node.js (v20 or higher)
- npm (Node Package Manager)
- GitHub Personal Access Token (PAT) with `repo` and `read:org` scopes.

### Installation

1. Clone the repository:

```sh
   git clone https://github.com/your-username/github-activity-tracker.git
   cd github-activity-tracker/backend
```

2. Install dependencies:

```sh
yarn install
```

3. Create a .env file in the backend directory and add your GitHub token:

```sh
GITHUB_TOKEN=your_github_token
ORG_NAME=your_organization_name
DB_PATH=commits.db
```

## API Documentation

### Endpoints

1. Get Leaderboard

- URL: /api/leaderboard
- Method: GET
- Description: Returns the top 10 users by commit count.
- Response:

```json
[
  {
    "username": "user1",
    "commit_count": 42
  },
  {
    "username": "user2",
    "commit_count": 35
  }
]
```

2. Get Commits

- URL: /api/commits
- Method: GET
- Query Parameters:
    - repo (required): The name of the repository.
    - author (optional): The username of the commit author.
    - limit (optional): Number of commits to return (default: 10).
    - offset (optional): Number of commits to skip (default: 0).
- Description: Returns commits for a specific repository, optionally filtered by author.
- Response:

```json
[
  {
    "sha": "abc123",
    "repo": "your-repo-name",
    "author": "user1",
    "date": "2024-01-01T12:00:00.000Z",
    "message": "Initial commit"
  },
  {
    "sha": "def456",
    "repo": "your-repo-name",
    "author": "user2",
    "date": "2024-01-02T12:00:00.000Z",
    "message": "Update README"
  }
]
```

## Database Schema

The application uses a SQLite database with the following tables:

`commits`

| Column  | Type     | Description      |
|---------|----------|------------------|
| id      | INTEGER  | Primary key.     |
| sha     | TEXT     | Commit SHA.      |
| repo    | TEXT     | Repository name. |
| author  | TEXT     | Commit author.   |
| date    | DATETIME | Commit date.     |
| message | TEXT     | Commit message.  |

`leaderboard`

| Column       | Type    | Description                    |
|--------------|---------|--------------------------------|
| user_id      | TEXT    | GitHub user ID.                |
| username     | TEXT    | GitHub username.               |
| commit_count | INTEGER | Number of commits by the user. |

## Contributing
Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch (git checkout -b feature/your-feature).
3. Commit your changes (git commit -m 'Add some feature').
4. Push to the branch (git push origin feature/your-feature).
5. Open a pull request.

## License
This project is licensed under the MIT License. See the LICENSE file for details.


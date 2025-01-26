import { Octokit } from '@octokit/rest';
import { config } from './config.js';

export const octokit = new Octokit({
  auth: config.GITHUB_TOKEN,
});

// Fetch all organization repositories (including private)
export async function getOrgRepos() {
  try {
    const repos = await octokit.paginate(octokit.rest.repos.listForOrg, {
      org: config.ORG_NAME ?? '',
      type: 'all', // Include private repos
      per_page: 100,
    });
    return repos;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching organization repos:', error.message);
    } else {
      console.error('An unknown error occurred while fetching organization repos');
    }
    throw error;
  }
}

// Fetch commits for a specific repository
export async function getRepoCommits(repoName: string) {
  try {
    const commits = await octokit.paginate(octokit.rest.repos.listCommits, {
      owner: config.ORG_NAME ?? '',
      repo: repoName,
      per_page: 100,
    });
    return commits;
  } catch (error) {
    if (error instanceof Error) {
      if ('status' in error && error.status === 409) {
        // Empty repository, skip
        return [];
      }
      console.error(`Error fetching commits for ${repoName}:`, error.message);
    } else {
      console.error(`An unknown error occurred while fetching commits for ${repoName}`);
    }
    throw error;
  }
}

// Fetch PRs linked to a commit
export async function getCommitPRs(repoName: string, commitSha: string) {
  try {
    const response = await octokit.rest.repos.listPullRequestsAssociatedWithCommit({
      owner: config.ORG_NAME ?? '',
      repo: repoName,
      commit_sha: commitSha,
    });
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error fetching PRs for commit ${commitSha}:`, error.message);
    }
    return [];
  }
}
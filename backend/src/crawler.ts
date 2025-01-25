import { getOrgRepos, getRepoCommits, getCommitPRs } from './github.js';
import db, { insertCommit, updateLeaderboard } from './database.js';

export async function crawlOrganization() {
    try {
        const repos = await getOrgRepos();

        for (const repo of repos) {
            // Skip archived repos (optional)
            if (repo.archived) continue;

            const commits = await getRepoCommits(repo.name);

            const tx = db.transaction(async () => {
                for (const commit of commits) {
                    const author = commit.author?.login || commit.commit.author?.name || null;

                    // Fetch PRs for this commit
                    const prs = await getCommitPRs(repo.name, commit.sha);
                    const prUrl = prs.length > 0 ? prs[0].html_url : null; // Use the first PR URL

                    insertCommit.run(
                        commit.sha,
                        repo.name,
                        author,
                        commit.commit.author?.date,
                        commit.commit.message,
                        prUrl
                    );

                    if (author) {
                        updateLeaderboard.run(
                            author,
                            author,
                            1 // Increment count by 1
                        );
                    }
                }
            });

            tx();

            console.log(`Processed ${commits.length} commits for ${repo.name}.`);
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error('Crawl failed:', error.message);
        } else {
            console.error('An unknown error occurred during the crawl');
        }
    }
}
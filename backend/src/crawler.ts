import { getOrgRepos, getRepoCommits } from './github.js';
import db, { insertCommit, updateLeaderboard } from './database.js';

export async function crawlOrganization() {
    try {
        const repos = await getOrgRepos();

        for (const repo of repos) {
            // Skip archived repos (optional)
            if (repo.archived) continue;

            const commits = await getRepoCommits(repo.name);

            const tx = db.transaction(() => {
                for (const commit of commits) {
                    const author = commit.author?.login || commit.commit.author?.name || null;

                    insertCommit.run(
                        commit.sha,
                        repo.name,
                        author,
                        commit.commit.author?.date,
                        commit.commit.message
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
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error('Crawl failed:', error.message);
        } else {
            console.error('An unknown error occurred during the crawl');
        }
    }
}
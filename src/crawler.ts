import { getOrgRepos, getRepoCommits } from './github.js';
import db, { insertCommit, updateLeaderboard } from './database.js';

// Get today's date in YYYY-MM-DD format
function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

export async function crawlOrganization() {
    const today = getTodayDate();

    try {
        const repos = await getOrgRepos();
        console.log(`Found ${repos.length} repositories.`);

        for (const repo of repos) {
            if (repo.archived) {
                console.log(`Skipping archived repository: ${repo.name}`);
                continue;
            }

            console.log(`Fetching commits for repository: ${repo.name}`);
            const commits = await getRepoCommits(repo.name);

            // Filter commits for today
            const todayCommits = commits.filter(commit =>
                commit.commit.author?.date?.startsWith(today)
            );

            if (todayCommits.length === 0) {
                console.log(`No commits today for ${repo.name}`);
                continue;
            }

            const tx = db.transaction(() => {
                for (const commit of todayCommits) {
                    const author = commit.author?.login || commit.commit.author?.name || null;

                    insertCommit.run(
                        commit.sha,
                        repo.name,
                        author,
                        commit.commit.author?.date,
                        commit.commit.message,
                        commit.author?.avatar_url || null
                    );

                    if (author) {
                        updateLeaderboard.run(
                            author,
                            author,
                            commit.author?.avatar_url || null,
                            1
                        );
                    }
                }
            });

            tx();
            console.log(`Processed ${todayCommits.length} commits for ${repo.name}.`);
        }
    } catch (error) {
        console.error('Crawl failed:', error);
    }
}
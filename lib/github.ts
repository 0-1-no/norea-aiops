import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export async function getPRDiff(owner: string, repo: string, pullNumber: number): Promise<string> {
  try {
    const { data } = await octokit.pulls.get({
      owner,
      repo,
      pull_number: pullNumber,
      mediaType: {
        format: 'diff'
      }
    });

    return data as unknown as string;
  } catch (error) {
    console.error('Error fetching PR diff:', error);
    throw error;
  }
}

export async function postComment(
  owner: string, 
  repo: string, 
  pullNumber: number, 
  body: string
): Promise<void> {
  try {
    await octokit.issues.createComment({
      owner,
      repo,
      issue_number: pullNumber,
      body
    });
  } catch (error) {
    console.error('Error posting comment:', error);
    throw error;
  }
}
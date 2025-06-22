const { Octokit } = require('@octokit/rest');

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

exports.getPRDiff = async function getPRDiff(owner, repo, pullNumber) {
  try {
    const { data } = await octokit.pulls.get({
      owner,
      repo,
      pull_number: pullNumber,
      mediaType: {
        format: 'diff'
      }
    });

    return data;
  } catch (error) {
    console.error('Error fetching PR diff:', error);
    throw error;
  }
}

exports.postComment = async function postComment(owner, repo, pullNumber, body) {
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
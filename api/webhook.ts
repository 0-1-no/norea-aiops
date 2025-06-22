import { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac } from 'crypto';
import { analyzeWithClaude } from '../lib/claude.js';
import { postComment, getPRDiff } from '../lib/github.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify GitHub webhook signature
    const signature = req.headers['x-hub-signature-256'] as string;
    const payload = JSON.stringify(req.body);
    const expectedSignature = 'sha256=' + createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET!)
      .update(payload)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { action, pull_request, repository } = req.body;

    // Only process PR opened/synchronize events
    if (action !== 'opened' && action !== 'synchronize') {
      return res.status(200).json({ message: 'Event ignored' });
    }

    const prNumber = pull_request.number;
    const repoOwner = repository.owner.login;
    const repoName = repository.name;

    console.log(`Processing PR #${prNumber} in ${repoOwner}/${repoName}`);

    // Get PR diff
    const diff = await getPRDiff(repoOwner, repoName, prNumber);

    // Analyze with Claude
    const analysis = await analyzeWithClaude(diff);

    // Post comment if issues found
    if (analysis.issues.length > 0) {
      await postComment(repoOwner, repoName, prNumber, analysis.comment);
    }

    return res.status(200).json({ 
      message: 'Analysis complete',
      issuesFound: analysis.issues.length
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
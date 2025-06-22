require('dotenv').config({ path: '.env.local' });

// Test dependencies
try {
  const { Octokit } = require('@octokit/rest');
  console.log('✅ @octokit/rest imported successfully');
  
  const Anthropic = require('@anthropic-ai/sdk');
  console.log('✅ @anthropic-ai/sdk imported successfully');
  
  const { createHmac } = require('crypto');
  console.log('✅ crypto imported successfully');
  
  // Test functions
  const { analyzeWithClaude } = require('./lib/claude');
  console.log('✅ claude module imported successfully');
  
  const { postComment, getPRDiff } = require('./lib/github');
  console.log('✅ github module imported successfully');
  
  console.log('\n🎉 All modules imported successfully!');
  
} catch (error) {
  console.error('❌ Import error:', error.message);
  process.exit(1);
}
require('dotenv').config({ path: '.env.local' });

const handler = require('./api/webhook');

// Mock request and response
const mockReq = {
  method: 'POST',
  headers: {
    'x-hub-signature-256': 'sha256=test'
  },
  body: {
    action: 'opened',
    pull_request: {
      number: 1
    },
    repository: {
      owner: { login: 'test-owner' },
      name: 'test-repo'
    }
  }
};

const mockRes = {
  status: (code) => ({
    json: (data) => {
      console.log(`Status: ${code}`);
      console.log('Response:', data);
      return mockRes;
    }
  })
};

console.log('Testing webhook handler...');
handler(mockReq, mockRes).catch(console.error);
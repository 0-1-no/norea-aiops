const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface AnalysisResult {
  issues: Array<{
    file: string;
    line: number;
    type: 'english_text' | 'console_log';
    description: string;
    prompt: string;
  }>;
  comment: string;
}

exports.analyzeWithClaude = async function analyzeWithClaude(diff: string): Promise<AnalysisResult> {
  const prompt = `
Analyser denne Git diff for Norea AI (norsk AI-plattform):

SJEKKER:
1. Finn engelske tekster som er synlige for brukere (ikke console.log, ikke kommentarer)
2. Finn console.log statements

For hver funn, generer:
- Filnavn og linje
- Type problem
- Kort beskrivelse
- Prompt for � fikse

Returner som JSON:
{
  "issues": [
    {
      "file": "src/components/Button.tsx",
      "line": 23,
      "type": "english_text",
      "description": "Engelsk knappetekst 'Save changes'",
      "prompt": "Endre knappeteksten fra 'Save changes' til norsk 'Lagre endringer'"
    }
  ]
}

Git diff:
${diff}
`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Parse JSON response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { issues: [], comment: '' };
    }

    const analysis = JSON.parse(jsonMatch[0]);
    
    // Generate comment
    const comment = formatComment(analysis.issues);
    
    return {
      issues: analysis.issues,
      comment
    };

  } catch (error) {
    console.error('Error analyzing with Claude:', error);
    throw error;
  }
}

function formatComment(issues: AnalysisResult['issues']): string {
  if (issues.length === 0) {
    return '';
  }

  let comment = '## > Norea AIOps - Kodeanalyse\n\n';
  
  issues.forEach(issue => {
    const icon = issue.type === 'english_text' ? '<�<�' : '�';
    comment += `**${issue.file}:${issue.line}**\n`;
    comment += `${icon} ${issue.description}\n`;
    comment += `=� **Prompt:** ${issue.prompt}\n\n`;
  });

  comment += '---\n*Generert av Norea AIOps*';
  
  return comment;
}
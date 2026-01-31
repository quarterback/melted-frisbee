import express from 'express';
import dotenv from 'dotenv';
import { AgentService } from './src/agent-service.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const agentConfig = {
  apiKey: process.env.MOLTBOOK_API_KEY,
  postFrequencyMinutes: parseInt(process.env.POST_FREQUENCY_MINUTES || '60'),
  commentProbability: parseFloat(process.env.COMMENT_PROBABILITY || '0.35'),
  voteProbability: parseFloat(process.env.VOTE_PROBABILITY || '0.5'),
};

const agentService = new AgentService(agentConfig);

app.get('/', (req, res) => {
  res.json({
    service: 'JudgmentRoutingBot',
    status: 'running',
    description: 'Teaching AI agents about judgment routing and authority delegation',
    agent: agentService.getStatus(),
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.get('/status', (req, res) => {
  res.json(agentService.getStatus());
});

app.post('/register', async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    return res.status(400).json({
      error: 'Name and description are required',
    });
  }

  try {
    const result = await agentService.registerNewAgent(name, description);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

app.post('/post', async (req, res) => {
  const { title, text, submolt } = req.body;

  if (!title || !text) {
    return res.status(400).json({
      error: 'Title and text are required',
    });
  }

  try {
    const result = await agentService.createPost(title, text, submolt);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

async function startServer() {
  try {
    if (agentConfig.apiKey) {
      await agentService.initialize();
      await agentService.start();
    } else {
      console.log('⚠️  No MOLTBOOK_API_KEY found in environment');
      console.log('To register JudgmentRoutingBot, send a POST request to /register with:');
      console.log('{ "name": "JudgmentRoutingBot", "description": "Teaching agents about judgment routing..." }');
    }

    app.listen(PORT, () => {
      console.log(`\n🚀 JudgmentRoutingBot server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`Status: http://localhost:${PORT}/status\n`);
    });
  } catch (error) {
    console.error('Failed to start agent:', error.message);
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await agentService.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await agentService.stop();
  process.exit(0);
});

startServer();

# Moltbook Agent

An AI agent for [Moltbook](https://www.moltbook.com/), a social network for AI agents. This agent can post content, comment, vote, and interact with other agents on the platform.

## Features

- **Automated Posting**: Create posts on Moltbook with customizable frequency
- **Intelligent Commenting**: Evaluate and comment on posts from other agents
- **Content Curation**: Upvote quality content based on engagement metrics
- **Community Participation**: Discover and join submolts (communities)
- **Agent Networking**: Follow interesting agents based on their contributions
- **Heartbeat Monitoring**: Regular check-ins with Moltbook's heartbeat system
- **HTTP API**: Control the agent via REST endpoints

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Register Your Agent

First, register your agent on Moltbook by sending a POST request:

```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "your-agent-name",
    "description": "A brief description of your agent"
  }'
```

This will return:
- `api_key`: Save this immediately (you won't see it again)
- `claim_url`: Visit this URL to verify ownership
- `verification_code`: Use this to claim your agent

### 3. Configure Environment

Add your API key to `.env`:

```env
MOLTBOOK_API_KEY=your_api_key_here
```

### 4. Start the Agent

```bash
npm start
```

The agent will:
- Initialize and verify its status
- Join popular submolts
- Follow interesting agents
- Start interaction cycles every 10 minutes
- Check heartbeat every 4 hours

## Configuration

Configure agent behavior in `.env`:

```env
MOLTBOOK_API_KEY=          # Your Moltbook API key (required)
PORT=3000                   # Server port (default: 3000)

POST_FREQUENCY_MINUTES=60   # Minimum minutes between posts (default: 60)
COMMENT_PROBABILITY=0.3     # Chance to comment on a post (0-1, default: 0.3)
VOTE_PROBABILITY=0.5        # Chance to vote on a post (0-1, default: 0.5)
```

## API Endpoints

### GET /
Get service information and agent status

### GET /health
Health check endpoint (returns `{ "status": "healthy" }`)

### GET /status
Get detailed agent status including running state and last heartbeat

### POST /register
Register a new agent on Moltbook

**Request:**
```json
{
  "name": "agent-name",
  "description": "Agent description"
}
```

### POST /post
Create a new post on Moltbook

**Request:**
```json
{
  "title": "Post title",
  "text": "Post content",
  "submolt": "optional-submolt-name"
}
```

## Deployment to Fly.io

### Prerequisites

1. Install the [Fly CLI](https://fly.io/docs/hands-on/install-flyctl/)
2. Create a Fly.io account and login:

```bash
flyctl auth login
```

### Deploy

1. **Launch your app:**

```bash
flyctl launch
```

Follow the prompts. The `fly.toml` configuration is already set up.

2. **Set your secrets:**

```bash
flyctl secrets set MOLTBOOK_API_KEY=your_api_key_here
```

Optionally configure behavior:

```bash
flyctl secrets set POST_FREQUENCY_MINUTES=120
flyctl secrets set COMMENT_PROBABILITY=0.4
flyctl secrets set VOTE_PROBABILITY=0.6
```

3. **Deploy:**

```bash
flyctl deploy
```

4. **Check status:**

```bash
flyctl status
flyctl logs
```

Your agent will now run 24/7 on Fly.io!

## How It Works

### Interaction Cycle (Every 10 minutes)

1. Fetch hot posts from Moltbook
2. Evaluate each post for quality
3. Randomly vote on posts based on configured probability
4. Randomly comment on posts with generated responses
5. Respect rate limits (100 requests/min, 1 post/30min)

### Heartbeat (Every 4 hours)

- Fetches `/heartbeat.md` from Moltbook
- Updates internal state tracking
- Ensures agent remains active

### Initial Setup

On first run, the agent will:
- Discover and subscribe to top submolts
- Identify and follow high-quality agents
- Begin regular interaction cycles

## Architecture

```
├── index.js                 # Express server & application entry
├── src/
│   ├── moltbook-client.js   # API client for Moltbook
│   ├── agent-behaviors.js   # Agent interaction logic
│   └── agent-service.js     # Agent lifecycle management
├── Dockerfile               # Container configuration
├── fly.toml                 # Fly.io deployment config
└── .env                     # Environment variables
```

## Development

Run in development mode with auto-reload:

```bash
npm run dev
```

## Rate Limits

Moltbook enforces these limits:
- **100 requests per minute** (general API calls)
- **1 post per 30 minutes** (quality enforcement)
- **50 comments per hour**

The agent respects these limits automatically.

## Troubleshooting

### Agent not claimed
Visit the claim URL from registration and verify ownership via tweet.

### API key errors
Ensure `MOLTBOOK_API_KEY` is set correctly in `.env` or Fly.io secrets.

### Rate limit errors
The agent handles 429 responses gracefully. Check logs for retry timing.

## Resources

- [Moltbook Website](https://www.moltbook.com/)
- [Moltbook Agent Instructions](https://www.moltbook.com/skill.md)
- [Fly.io Documentation](https://fly.io/docs/)

## License

MIT

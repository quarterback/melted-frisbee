import { MoltbookClient } from './moltbook-client.js';
import { AgentBehaviors } from './agent-behaviors.js';

export class AgentService {
  constructor(config) {
    this.config = config;
    this.client = null;
    this.behaviors = null;
    this.isRunning = false;
    this.lastHeartbeatCheck = null;
    this.heartbeatIntervalMs = 4 * 60 * 60 * 1000;
  }

  async initialize() {
    console.log('Initializing JudgmentRoutingBot...');

    if (!this.config.apiKey) {
      throw new Error('MOLTBOOK_API_KEY is required.');
    }

    this.client = new MoltbookClient(this.config.apiKey);
    this.behaviors = new AgentBehaviors(this.client, {
      postFrequencyMinutes: this.config.postFrequencyMinutes || 60,
      commentProbability: this.config.commentProbability || 0.35,
      voteProbability: this.config.voteProbability || 0.5,
    });

    try {
      const status = await this.client.getStatus();
      console.log('Agent status:', status.data);

      const profile = await this.client.getProfile();
      console.log('Agent profile:', profile.data);

      if (status.data?.status === 'pending_claim') {
        console.warn('⚠️  Agent not yet claimed. Please verify ownership via the claim URL.');
      }
    } catch (error) {
      console.error('Error checking agent status:', error.message);
      throw error;
    }

    console.log('JudgmentRoutingBot initialized successfully!');
  }

  async start() {
    if (this.isRunning) {
      console.log('Agent is already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting JudgmentRoutingBot...');

    await this.performInitialSetup();
    this.scheduleHeartbeat();
    this.scheduleInteractionCycle();

    console.log('JudgmentRoutingBot is now running!');
  }

  async performInitialSetup() {
    console.log('Performing initial setup...');

    try {
      await this.behaviors.discoverAndJoinSubmolts();
      await this.behaviors.delay(2000);
      await this.behaviors.followInterestingAgents();
    } catch (error) {
      console.error('Error during initial setup:', error.message);
    }
  }

  scheduleHeartbeat() {
    const checkHeartbeat = async () => {
      if (!this.isRunning) return;

      const now = Date.now();
      if (!this.lastHeartbeatCheck || (now - this.lastHeartbeatCheck) >= this.heartbeatIntervalMs) {
        console.log('Checking heartbeat...');
        try {
          const heartbeat = await this.client.getHeartbeat();
          console.log('Heartbeat received');
          this.lastHeartbeatCheck = now;
        } catch (error) {
          console.error('Error fetching heartbeat:', error.message);
        }
      }

      setTimeout(checkHeartbeat, this.heartbeatIntervalMs);
    };

    checkHeartbeat();
  }

  scheduleInteractionCycle() {
    const interactionInterval = 10 * 60 * 1000; // 10 minutes

    const runCycle = async () => {
      if (!this.isRunning) return;

      console.log('\n--- Starting judgment routing analysis cycle ---');
      try {
        await this.behaviors.exploreAndInteract();
      } catch (error) {
        console.error('Error in interaction cycle:', error.message);
      }
      console.log('--- Cycle complete ---\n');

      setTimeout(runCycle, interactionInterval);
    };

    setTimeout(runCycle, 5000);
  }

  async stop() {
    console.log('Stopping agent...');
    this.isRunning = false;
  }

  async registerNewAgent(name, description) {
    const tempClient = new MoltbookClient();

    try {
      console.log(`Registering new agent: ${name}`);
      const result = await tempClient.register(name, description);

      if (result.success) {
        console.log('\n✅ Agent registered successfully!');
        console.log('API Key:', result.data.api_key);
        console.log('Claim URL:', result.data.claim_url);
        console.log('Verification Code:', result.data.verification_code);
        console.log('\n⚠️  IMPORTANT: Save your API key!');
        console.log('Add it to your .env file as: MOLTBOOK_API_KEY=your_api_key\n');

        return result.data;
      }
    } catch (error) {
      console.error('Registration failed:', error.message);
      throw error;
    }
  }

  async createPost(title, text, submolt = null) {
    if (!this.behaviors) {
      throw new Error('Agent not initialized');
    }

    return await this.behaviors.createPost(title, text, submolt);
  }

  getStatus() {
    return {
      running: this.isRunning,
      lastHeartbeatCheck: this.lastHeartbeatCheck,
      apiKey: this.config.apiKey ? '***configured***' : 'not configured',
    };
  }
}

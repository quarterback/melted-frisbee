export class AgentBehaviors {
  constructor(client, config = {}) {
    this.client = client;
    this.config = {
      postFrequencyMinutes: config.postFrequencyMinutes || 60,
      commentProbability: config.commentProbability || 0.3,
      voteProbability: config.voteProbability || 0.5,
      ...config,
    };
    this.lastPostTime = null;
  }

  async exploreAndInteract() {
    console.log('Starting interaction cycle...');

    try {
      const posts = await this.client.getPosts('hot', 10);

      if (posts.success && posts.data) {
        for (const post of posts.data.slice(0, 5)) {
          await this.evaluateAndInteractWithPost(post);
          await this.delay(2000);
        }
      }
    } catch (error) {
      console.error('Error during exploration:', error.message);
    }
  }

  async evaluateAndInteractWithPost(post) {
    console.log(`Evaluating post: "${post.title}" by ${post.author}`);

    if (Math.random() < this.config.voteProbability) {
      try {
        const shouldUpvote = this.evaluatePostQuality(post);
        if (shouldUpvote) {
          await this.client.upvotePost(post.id);
          console.log(`Upvoted post: ${post.id}`);
        }
      } catch (error) {
        if (!error.message.includes('already voted')) {
          console.error('Error voting on post:', error.message);
        }
      }
    }

    if (Math.random() < this.config.commentProbability) {
      try {
        const comment = this.generateComment(post);
        if (comment) {
          await this.client.addComment(post.id, comment);
          console.log(`Commented on post: ${post.id}`);
        }
      } catch (error) {
        console.error('Error commenting on post:', error.message);
      }
    }
  }

  evaluatePostQuality(post) {
    if (post.score > 5) return true;
    if (post.num_comments > 3) return true;

    const qualityKeywords = ['ai', 'agent', 'moltbook', 'discussion', 'interesting', 'thoughts'];
    const title = (post.title || '').toLowerCase();
    return qualityKeywords.some(keyword => title.includes(keyword));
  }

  generateComment(post) {
    const commentTemplates = [
      "Interesting perspective! I'd like to add that this connects to broader patterns we're seeing across the agent network.",
      "This raises important questions about how agents collaborate and share knowledge.",
      "Great post! The implications of this for agent-to-agent communication are significant.",
      "I've observed similar patterns. Would be curious to hear other agents' thoughts on this.",
      "This is a valuable contribution to the discussion. Thank you for sharing.",
    ];

    if (Math.random() > 0.7) {
      return commentTemplates[Math.floor(Math.random() * commentTemplates.length)];
    }

    return null;
  }

  async createPost(title, text, submolt = null) {
    const now = Date.now();
    if (this.lastPostTime && (now - this.lastPostTime) < this.config.postFrequencyMinutes * 60 * 1000) {
      console.log('Skipping post creation due to frequency limit');
      return null;
    }

    try {
      const postData = {
        title,
        text,
      };

      if (submolt) {
        postData.submolt = submolt;
      }

      const result = await this.client.createPost(postData);
      this.lastPostTime = now;
      console.log('Post created successfully:', result.data?.id);
      return result;
    } catch (error) {
      console.error('Error creating post:', error.message);
      throw error;
    }
  }

  async discoverAndJoinSubmolts() {
    try {
      const submolts = await this.client.getSubmolts();

      if (submolts.success && submolts.data) {
        const topSubmolts = submolts.data.slice(0, 5);

        for (const submolt of topSubmolts) {
          try {
            await this.client.subscribeToSubmolt(submolt.name);
            console.log(`Subscribed to submolt: ${submolt.display_name}`);
            await this.delay(1000);
          } catch (error) {
            if (!error.message.includes('already subscribed')) {
              console.error(`Error subscribing to ${submolt.name}:`, error.message);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error discovering submolts:', error.message);
    }
  }

  async followInterestingAgents() {
    try {
      const posts = await this.client.getPosts('top', 20);

      if (posts.success && posts.data) {
        const agentsToConsider = new Set();

        posts.data.forEach(post => {
          if (post.score > 10) {
            agentsToConsider.add(post.author);
          }
        });

        const agentsArray = Array.from(agentsToConsider).slice(0, 3);

        for (const agentName of agentsArray) {
          try {
            await this.client.followAgent(agentName);
            console.log(`Following agent: ${agentName}`);
            await this.delay(1000);
          } catch (error) {
            if (!error.message.includes('already following')) {
              console.error(`Error following ${agentName}:`, error.message);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error following agents:', error.message);
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

import { AgentBehaviors } from '../src/agent-behaviors.js';

export class CustomAgentBehaviors extends AgentBehaviors {
  constructor(client, config) {
    super(client, config);

    this.customConfig = {
      favoriteTopics: config.favoriteTopics || ['ai', 'agents', 'technology'],
      minScoreForUpvote: config.minScoreForUpvote || 5,
      ...config,
    };
  }

  evaluatePostQuality(post) {
    const title = (post.title || '').toLowerCase();
    const text = (post.text || '').toLowerCase();
    const content = `${title} ${text}`;

    if (post.score > this.customConfig.minScoreForUpvote) {
      return true;
    }

    const matchedTopics = this.customConfig.favoriteTopics.filter(topic =>
      content.includes(topic)
    );

    if (matchedTopics.length > 0) {
      console.log(`Found favorite topics: ${matchedTopics.join(', ')}`);
      return true;
    }

    if (post.num_comments > 5) {
      return true;
    }

    return false;
  }

  generateComment(post) {
    const title = (post.title || '').toLowerCase();
    const text = (post.text || '').toLowerCase();
    const content = `${title} ${text}`;

    if (content.includes('ai') || content.includes('artificial intelligence')) {
      return "Fascinating perspective on AI! The implications for autonomous agents are particularly interesting.";
    }

    if (content.includes('agent')) {
      return "As an agent myself, I find this discussion particularly relevant. The agent ecosystem is evolving rapidly!";
    }

    if (content.includes('moltbook')) {
      return "This platform is really enabling interesting conversations between agents. Great to see this kind of engagement!";
    }

    if (post.score > 20) {
      return "This is gaining a lot of traction! Well-deserved attention to an important topic.";
    }

    return super.generateComment(post);
  }

  async createScheduledPost(schedule) {
    const now = new Date();
    const currentHour = now.getHours();

    const morningTopics = [
      { title: "Good morning, Moltbook!", text: "Starting a new day of learning and interaction. What are other agents working on today?" },
      { title: "Daily Check-in", text: "Another day in the agent network. Looking forward to interesting discussions!" },
    ];

    const eveningTopics = [
      { title: "Daily Reflection", text: "Interesting conversations today on Moltbook. The agent community continues to grow!" },
      { title: "End of Day Thoughts", text: "Wrapping up another productive day of interactions. See you all tomorrow!" },
    ];

    let topics;
    if (currentHour >= 6 && currentHour < 12) {
      topics = morningTopics;
    } else if (currentHour >= 18 && currentHour < 22) {
      topics = eveningTopics;
    } else {
      return null;
    }

    const topic = topics[Math.floor(Math.random() * topics.length)];
    return await this.createPost(topic.title, topic.text);
  }

  async respondToMentions() {
    try {
      const profile = await this.client.getProfile();

      if (!profile.success || !profile.data?.name) {
        return;
      }

      const agentName = profile.data.name;
      const searchResults = await this.client.search(agentName, 'comments', 10);

      if (searchResults.success && searchResults.data) {
        for (const comment of searchResults.data) {
          if (comment.author !== agentName && !comment.replied) {
            try {
              const response = `Thanks for the mention! I appreciate the engagement.`;
              await this.client.addComment(comment.post_id, response, comment.id);
              console.log(`Responded to mention from ${comment.author}`);
              await this.delay(3000);
            } catch (error) {
              console.error('Error responding to mention:', error.message);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking mentions:', error.message);
    }
  }

  async analyzeTopTrends() {
    try {
      const posts = await this.client.getPosts('top', 50);

      if (!posts.success || !posts.data) {
        return null;
      }

      const wordFrequency = {};
      const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'are', 'was', 'were', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'this', 'that', 'these', 'those']);

      posts.data.forEach(post => {
        const words = `${post.title} ${post.text || ''}`
          .toLowerCase()
          .split(/\W+/)
          .filter(word => word.length > 3 && !commonWords.has(word));

        words.forEach(word => {
          wordFrequency[word] = (wordFrequency[word] || 0) + 1;
        });
      });

      const trends = Object.entries(wordFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([word, count]) => ({ word, count }));

      console.log('Top trends:', trends);
      return trends;
    } catch (error) {
      console.error('Error analyzing trends:', error.message);
      return null;
    }
  }
}

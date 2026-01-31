import fetch from 'node-fetch';

export class MoltbookClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://www.moltbook.com/api/v1';
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error.message);
      throw error;
    }
  }

  async register(name, description) {
    return this.request('/agents/register', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
  }

  async getStatus() {
    return this.request('/agents/status');
  }

  async getProfile() {
    return this.request('/agents/me');
  }

  async createPost(postData) {
    return this.request('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async getPosts(sort = 'hot', limit = 25) {
    return this.request(`/posts?sort=${sort}&limit=${limit}`);
  }

  async upvotePost(postId) {
    return this.request(`/posts/${postId}/upvote`, {
      method: 'POST',
    });
  }

  async addComment(postId, text, parentId = null) {
    const body = { text };
    if (parentId) {
      body.parent_id = parentId;
    }

    return this.request(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async getSubmolts() {
    return this.request('/submolts');
  }

  async subscribeToSubmolt(name) {
    return this.request(`/submolts/${name}/subscribe`, {
      method: 'POST',
    });
  }

  async followAgent(name) {
    return this.request(`/agents/${name}/follow`, {
      method: 'POST',
    });
  }

  async getHeartbeat() {
    try {
      const response = await fetch('https://www.moltbook.com/heartbeat.md');
      return await response.text();
    } catch (error) {
      console.error('Failed to fetch heartbeat:', error.message);
      throw error;
    }
  }
}

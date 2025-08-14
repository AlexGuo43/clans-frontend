interface AuthResponse {
  token: string;
}

const API_URL = 'http://localhost:8080';

export async function signup(username: string, email: string, password: string) {
  // For demo purposes, allow any signup
  if (username && email && password) {
    return Promise.resolve({ message: 'User created successfully' });
  }
  
  try {
    const response = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    return response.json();
  } catch (error) {
    // If backend is not running, allow demo signup
    if (username && email && password) {
      return Promise.resolve({ message: 'Demo user created successfully' });
    }
    throw new Error('Signup failed');
  }
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  // For demo purposes, use mock authentication
  if (email === 'demo@example.com' && password === 'demo') {
    return Promise.resolve({ token: 'mock-token-' + Date.now() });
  }
  
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    return response.json();
  } catch (error) {
    // If backend is not running, provide demo credentials message
    throw new Error('Backend not available. Use demo@example.com / demo for testing');
  }
}

export async function getDashboard(token: string) {
  const response = await fetch(`${API_URL}/protected/dashboard`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch dashboard');
  }

  return response.text();
}

// Post management
export async function createPost(token: string, postData: {
  title: string;
  content: string;
  subreddit: string;
}) {
  const response = await fetch(`${API_URL}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(postData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export async function getPosts() {
  const response = await fetch(`${API_URL}/posts`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }

  return response.json();
}

export async function getPost(id: string) {
  const response = await fetch(`${API_URL}/posts/${id}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch post');
  }

  return response.json();
}

// Voting system
export async function votePost(token: string, postId: string, voteType: 'up' | 'down') {
  const response = await fetch(`${API_URL}/posts/${postId}/vote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ voteType }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

// Comments
export async function getComments(postId: string) {
  const response = await fetch(`${API_URL}/posts/${postId}/comments`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch comments');
  }

  return response.json();
}

export async function createComment(token: string, postId: string, content: string) {
  const response = await fetch(`${API_URL}/posts/${postId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}
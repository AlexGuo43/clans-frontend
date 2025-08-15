interface AuthResponse {
  token: string;
}

const API_URL = 'http://localhost:8000/api';

export async function signup(username: string, email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, email, password }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Signup failed');
  }

  return response.json();
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  console.log('Attempting login for:', email);
  
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  console.log('Login response status:', response.status);

  if (!response.ok) {
    const error = await response.text();
    console.error('Login error:', error);
    throw new Error(error || 'Login failed');
  }

  const result = await response.json();
  console.log('Login successful, token received:', result.token?.substring(0, 20) + '...');
  
  return result;
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
  subreddit: string; // This will map to clan on the backend
}) {
  // Map frontend field to backend expectation
  const backendData = {
    title: postData.title,
    content: postData.content,
    clan: postData.subreddit, // Map subreddit to clan for backend
  };

  console.log('Creating post with token:', token?.substring(0, 20) + '...');
  console.log('Post data:', backendData);

  // Try different authorization header formats
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Check if token already includes 'Bearer' prefix
  if (token.startsWith('Bearer ')) {
    headers['Authorization'] = token;
  } else {
    headers['Authorization'] = `Bearer ${token}`;
  }

  console.log('Request headers:', headers);

  const response = await fetch(`${API_URL}/posts`, {
    method: 'POST',
    headers,
    body: JSON.stringify(backendData),
  });

  console.log('Create post response status:', response.status);

  if (!response.ok) {
    const error = await response.text();
    console.error('Create post error:', error);
    throw new Error(error || `HTTP ${response.status}: Failed to create post`);
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
  console.log('Voting on post with token:', token?.substring(0, 20) + '...');
  console.log('Vote data:', { postId, voteType });

  // Try different authorization header formats
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Check if token already includes 'Bearer' prefix
  if (token.startsWith('Bearer ')) {
    headers['Authorization'] = token;
  } else {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/posts/${postId}/vote`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ voteType }),
  });

  console.log('Vote response status:', response.status);

  if (!response.ok) {
    const error = await response.text();
    console.error('Vote error:', error);
    throw new Error(error || `HTTP ${response.status}: Failed to vote`);
  }

  return response.json();
}

// Comments
export async function getComments(postId: string) {
  const response = await fetch(`${API_URL}/comments/post/${postId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch comments');
  }

  return response.json();
}

export async function createComment(token: string, postId: string | number, content: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token.startsWith('Bearer ')) {
    headers['Authorization'] = token;
  } else {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Convert postId to number if it's a string
  const post_id = typeof postId === 'string' ? parseInt(postId, 10) : postId;

  const requestBody = { 
    post_id,
    content 
  };

  console.log('Creating comment with request body:', requestBody);

  const response = await fetch(`${API_URL}/comments`, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export async function updateComment(token: string, commentId: string, content: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token.startsWith('Bearer ')) {
    headers['Authorization'] = token;
  } else {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/comments/${commentId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export async function deleteComment(token: string, commentId: string) {
  const headers: Record<string, string> = {};

  if (token.startsWith('Bearer ')) {
    headers['Authorization'] = token;
  } else {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/comments/${commentId}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.ok;
}

export async function voteComment(token: string, commentId: string, voteType: 'up' | 'down') {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token.startsWith('Bearer ')) {
    headers['Authorization'] = token;
  } else {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/comments/${commentId}/vote`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ voteType }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export async function removeCommentVote(token: string, commentId: string) {
  const headers: Record<string, string> = {};

  if (token.startsWith('Bearer ')) {
    headers['Authorization'] = token;
  } else {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/comments/${commentId}/vote`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.ok;
}

// Clan Service
export async function getClans() {
  const response = await fetch(`${API_URL}/clans`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch clans');
  }

  return response.json();
}

export async function getClan(id: string) {
  const response = await fetch(`${API_URL}/clans/${id}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch clan');
  }

  return response.json();
}

export async function getClanByName(name: string) {
  const response = await fetch(`${API_URL}/clans/name/${name}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch clan');
  }

  return response.json();
}

export async function createClan(token: string, clanData: {
  name: string;
  displayName?: string;
  description: string;
}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token.startsWith('Bearer ')) {
    headers['Authorization'] = token;
  } else {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Map frontend field to backend expectation
  const backendData = {
    name: clanData.name,
    display_name: clanData.displayName, // Try snake_case
    displayName: clanData.displayName,  // Also send camelCase as backup
    description: clanData.description,
  };

  console.log('Sending to clan service:', backendData);

  const response = await fetch(`${API_URL}/clans`, {
    method: 'POST',
    headers,
    body: JSON.stringify(backendData),
  });

  console.log('Clan creation response status:', response.status);

  if (!response.ok) {
    const error = await response.text();
    console.error('Clan creation error:', error);
    throw new Error(error);
  }

  return response.json();
}

export async function updateClan(token: string, clanId: string, clanData: {
  displayName?: string;
  description?: string;
}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token.startsWith('Bearer ')) {
    headers['Authorization'] = token;
  } else {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/clans/${clanId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(clanData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export async function deleteClan(token: string, clanId: string) {
  const headers: Record<string, string> = {};

  if (token.startsWith('Bearer ')) {
    headers['Authorization'] = token;
  } else {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/clans/${clanId}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.ok;
}

// Clan Membership
export async function joinClan(token: string, clanId: string) {
  const headers: Record<string, string> = {};

  if (token.startsWith('Bearer ')) {
    headers['Authorization'] = token;
  } else {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/clans/${clanId}/join`, {
    method: 'POST',
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export async function leaveClan(token: string, clanId: string) {
  const headers: Record<string, string> = {};

  if (token.startsWith('Bearer ')) {
    headers['Authorization'] = token;
  } else {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/clans/${clanId}/leave`, {
    method: 'POST',
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.ok;
}

export async function getClanMembers(clanId: string) {
  const response = await fetch(`${API_URL}/clans/${clanId}/members`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch clan members');
  }

  return response.json();
}

export async function getUserClans(token: string) {
  const headers: Record<string, string> = {};

  if (token.startsWith('Bearer ')) {
    headers['Authorization'] = token;
  } else {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/users/clans`, {
    headers,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user clans');
  }

  return response.json();
}

export async function getClanMembershipStatus(token: string, clanId: string) {
  const headers: Record<string, string> = {};

  if (token.startsWith('Bearer ')) {
    headers['Authorization'] = token;
  } else {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/clans/${clanId}/membership`, {
    headers,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch membership status');
  }

  return response.json();
}
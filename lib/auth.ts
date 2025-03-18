import axios from 'axios';
import * as cheerio from 'cheerio';

interface LinkedInCredentials {
  username: string;
  password: string;
}

interface LinkedInSession {
  cookies: string[];
  csrfToken?: string;
  authToken?: string;
}

export async function authenticateLinkedIn(credentials: LinkedInCredentials): Promise<LinkedInSession> {
  try {
    // First get the login page to get CSRF token
    const loginPageResponse = await axios.get('https://www.linkedin.com/login', {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      withCredentials: true
    });

    const $ = cheerio.load(loginPageResponse.data);
    const csrfToken = $('input[name="csrfToken"]').attr('value');
    const loginCookies = loginPageResponse.headers['set-cookie'] || [];

    if (!csrfToken) {
      throw new Error('Failed to get CSRF token');
    }

    // Perform login
    const loginResponse = await axios.post('https://www.linkedin.com/checkpoint/lg/login-submit', 
      {
        session_key: credentials.username,
        session_password: credentials.password,
        csrfToken
      },
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': loginCookies.join('; '),
          'Referer': 'https://www.linkedin.com/login'
        },
        withCredentials: true,
        maxRedirects: 5
      }
    );

    // Get session cookies
    const authCookies = loginResponse.headers['set-cookie'] || [];
    
    // Get auth token if available
    const authToken = authCookies
      .find(cookie => cookie.includes('li_at='))
      ?.split(';')[0]
      ?.split('=')[1];

    return {
      cookies: [...loginCookies, ...authCookies],
      csrfToken,
      authToken
    };
  } catch (error) {
    console.error('LinkedIn authentication error:', error);
    throw new Error('Failed to authenticate with LinkedIn');
  }
}

export async function checkAuthStatus(session: LinkedInSession): Promise<boolean> {
  try {
    const response = await axios.get('https://www.linkedin.com/feed/', {
      headers: {
        'Cookie': session.cookies.join('; ')
      },
      maxRedirects: 0,
      validateStatus: (status) => status === 200 || status === 303
    });

    // If we get redirected to login page, session is invalid
    return !response.headers.location?.includes('/login');
  } catch {
    return false;
  }
}

export type { LinkedInCredentials, LinkedInSession };

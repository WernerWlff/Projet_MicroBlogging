// URL de l'API - côté client, toujours utiliser l'URL publique
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface User {
    id: string;
    email: string;
    username: string;
    createdAt: string;
}

export interface Post {
    id: string;
    content: string;
    authorId: string;
    author: User;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

class ApiClient {
    private baseUrl: string;

    constructor() {
        this.baseUrl = API_URL;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string> || {}),
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                ...options,
                headers: headers as HeadersInit,
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ 
                    message: `HTTP ${response.status}: ${response.statusText}` 
                }));
                throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            return response.json();
        } catch (err: any) {
            // Si c'est une erreur de réseau, donner un message plus clair
            if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
                throw new Error('Impossible de se connecter au serveur. Vérifiez que le backend est démarré.');
            }
            throw err;
        }
    }

    // Auth
    async register(email: string, username: string, password: string): Promise<AuthResponse> {
        return this.request<AuthResponse>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, username, password }),
        });
    }

    async login(email: string, password: string): Promise<AuthResponse> {
        return this.request<AuthResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    // Posts
    async getPosts(): Promise<Post[]> {
        return this.request<Post[]>('/posts');
    }

    async createPost(content: string): Promise<Post> {
        return this.request<Post>('/posts', {
            method: 'POST',
            body: JSON.stringify({ content }),
        });
    }

    async deletePost(id: string): Promise<void> {
        return this.request<void>(`/posts/${id}`, {
            method: 'DELETE',
        });
    }
}

export const api = new ApiClient();


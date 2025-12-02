'use client';

import { api, User } from './api';

export function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
}

export function setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('token', token);
}

export function removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('token');
}

export function getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
        return JSON.parse(userStr);
    } catch {
        return null;
    }
}

export function setUser(user: User): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('user', JSON.stringify(user));
}

export function removeUser(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('user');
}

export function isAuthenticated(): boolean {
    return !!getToken();
}

export async function login(email: string, password: string) {
    const response = await api.login(email, password);
    setToken(response.token);
    setUser(response.user);
    return response;
}

export async function register(email: string, username: string, password: string) {
    const response = await api.register(email, username, password);
    setToken(response.token);
    setUser(response.user);
    return response;
}

export function logout() {
    removeToken();
    removeUser();
    window.location.href = '/login';
}


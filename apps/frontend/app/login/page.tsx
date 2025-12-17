'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login, getUser, isAuthenticated, logout } from '@/lib/auth';
import { Header } from '@/components/Header';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const user = getUser();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            router.push('/');
        } catch (err: any) {
            setError(err.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-cream-50 via-cream-100 to-green-50">
            <Header/>
            <div className="flex items-center justify-center min-h-[calc(100vh-80px)] py-6 sm:py-8 px-4">
            <div className="max-w-md w-full space-y-6 sm:space-y-8 p-6 sm:p-8 bg-cream-50 rounded-2xl shadow-xl border border-green-100">
                <div>
                    <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold text-green-darkest">
                        Connectez-vous à votre compte
                    </h2>
                    <p className="mt-2 text-center text-xs sm:text-sm text-green-darkest">
                        Ou{' '}
                        <Link href="/register" className="font-medium text-green-dark hover:text-green-darker focus:outline-none focus:ring-2 focus:ring-green-dark focus:ring-offset-1 rounded">
                            créez un nouveau compte
                        </Link>
                    </p>
                </div>
                <form className="mt-6 sm:mt-8 space-y-6" onSubmit={handleSubmit} aria-label="Formulaire de connexion">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" role="alert" aria-live="polite">
                            {error}
                        </div>
                    )}
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="email" className="sr-only">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-green-200 placeholder-green-dark text-green-darkest focus:outline-none focus:ring-2 focus:ring-green-dark focus:border-green-dark bg-white text-sm"
                                placeholder="Adresse email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                aria-required="true"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Mot de passe
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-green-200 placeholder-green-dark text-green-darkest focus:outline-none focus:ring-2 focus:ring-green-dark focus:border-green-dark bg-white text-sm"
                                placeholder="Mot de passe"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                aria-required="true"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-green-dark to-green-darker hover:from-green-darker hover:to-green-darkest focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            aria-label={loading ? 'Connexion en cours' : 'Se connecter'}
                        >
                            {loading ? 'Connexion...' : 'Se connecter'}
                        </button>
                    </div>
                </form>
            </div>
            </div>
        </div>
    );
}


'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { register, getUser, isAuthenticated, logout } from '@/lib/auth';

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const user = getUser();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await register(email, username, password);
            router.push('/');
        } catch (err: any) {
            setError(err.message || 'Failed to register');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-cream-50 via-cream-100 to-green-50">
            {/* Header */}
            <header className="bg-cream-50 shadow-sm border-b border-green-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <Link href="/" aria-label="Retour à l'accueil">
                        <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-dark to-green-darker bg-clip-text text-transparent cursor-pointer">
                            MicroBlogging
                        </h1>
                    </Link>
                    <nav className="flex items-center gap-2 sm:gap-4" aria-label="Navigation principale">
                        {user ? (
                            <>
                                <span className="text-green-darkest font-medium text-sm sm:text-base">
                                    {user.username}
                                </span>
                                <button
                                    onClick={logout}
                                    className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-green-darkest hover:text-green-darkest hover:bg-green-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-dark focus:ring-offset-2"
                                    aria-label="Se déconnecter"
                                >
                                    Déconnexion
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-green-dark hover:text-green-darker hover:bg-green-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-dark focus:ring-offset-2"
                                    aria-label="Se connecter"
                                >
                                    Connexion
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-green-dark to-green-darker hover:from-green-darker hover:to-green-darkest rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-green-dark focus:ring-offset-2"
                                    aria-label="Créer un compte"
                                >
                                    S'inscrire
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            </header>

            <div className="flex items-center justify-center min-h-[calc(100vh-80px)] py-6 sm:py-8 px-4">
            <div className="max-w-md w-full space-y-6 sm:space-y-8 p-6 sm:p-8 bg-cream-50 rounded-2xl shadow-xl border border-green-100">
                <div>
                    <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold text-green-darkest">
                        Créez votre compte
                    </h2>
                    <p className="mt-2 text-center text-xs sm:text-sm text-green-darkest">
                        Ou{' '}
                        <Link href="/login" className="font-medium text-green-dark hover:text-green-darker focus:outline-none focus:ring-2 focus:ring-green-dark focus:ring-offset-1 rounded">
                            connectez-vous
                        </Link>
                    </p>
                </div>
                <form className="mt-6 sm:mt-8 space-y-6" onSubmit={handleSubmit} aria-label="Formulaire d'inscription">
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
                            <label htmlFor="username" className="sr-only">
                                Nom d'utilisateur
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                minLength={3}
                                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-green-200 placeholder-green-dark text-green-darkest focus:outline-none focus:ring-2 focus:ring-green-dark focus:border-green-dark bg-white text-sm"
                                placeholder="Nom d'utilisateur"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                aria-required="true"
                                aria-describedby="username-help"
                            />
                            <p id="username-help" className="sr-only">Le nom d'utilisateur doit contenir au moins 3 caractères</p>
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Mot de passe
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                minLength={6}
                                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-green-200 placeholder-green-dark text-green-darkest focus:outline-none focus:ring-2 focus:ring-green-dark focus:border-green-dark bg-white text-sm"
                                placeholder="Mot de passe (min. 6 caractères)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                aria-required="true"
                                aria-describedby="password-help"
                            />
                            <p id="password-help" className="sr-only">Le mot de passe doit contenir au moins 6 caractères</p>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-green-dark to-green-darker hover:from-green-darker hover:to-green-darkest focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            aria-label={loading ? 'Inscription en cours' : "S'inscrire"}
                        >
                            {loading ? 'Inscription...' : "S'inscrire"}
                        </button>
                    </div>
                </form>
            </div>
            </div>
        </div>
    );
}


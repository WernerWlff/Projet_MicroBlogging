'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, UserListItem } from '@/lib/api';
import { getUser, logout, isAuthenticated } from '@/lib/auth';

export default function UsersListPage() {
    const router = useRouter();
    const [users, setUsers] = useState<UserListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const user = getUser();

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/');
            return;
        }

        const loadUsers = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await api.getUsers();
                setUsers(data);
            } catch (err: any) {
                console.error('Error loading users:', err);
                setError(err.message || 'Impossible de charger les utilisateurs. Vérifiez que le backend est démarré.');
                if (err.message?.includes('Unauthorized') || err.message?.includes('token')) {
                    router.push('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        loadUsers();
    }, [router]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (loading) {
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
                                    <Link
                                        href="/profile"
                                        className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-green-dark hover:text-green-darker hover:bg-green-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-dark focus:ring-offset-2"
                                        aria-label="Voir le profil"
                                    >
                                        Profil
                                    </Link>
                                    <Link
                                        href="/usersList"
                                        className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-green-dark hover:text-green-darker hover:bg-green-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-dark focus:ring-offset-2"
                                        aria-label="Voir la liste des utilisateurs"
                                    >
                                        Utilisateurs
                                    </Link>
                                    <Link
                                        href="/profile"
                                        className="text-green-darkest font-medium text-sm sm:text-base hover:text-green-darker hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-green-dark focus:ring-offset-2 rounded px-2 py-1"
                                        aria-label="Voir mon profil"
                                    >
                                        {user.username}
                                    </Link>
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
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-dark"></div>
                        <p className="mt-4 text-green-darkest">Chargement des utilisateurs...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error && users.length === 0) {
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
                                    <Link
                                        href="/profile"
                                        className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-green-dark hover:text-green-darker hover:bg-green-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-dark focus:ring-offset-2"
                                        aria-label="Voir le profil"
                                    >
                                        Profil
                                    </Link>
                                    <Link
                                        href="/usersList"
                                        className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-green-dark hover:text-green-darker hover:bg-green-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-dark focus:ring-offset-2"
                                        aria-label="Voir la liste des utilisateurs"
                                    >
                                        Utilisateurs
                                    </Link>
                                    <Link
                                        href="/profile"
                                        className="text-green-darkest font-medium text-sm sm:text-base hover:text-green-darker hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-green-dark focus:ring-offset-2 rounded px-2 py-1"
                                        aria-label="Voir mon profil"
                                    >
                                        {user.username}
                                    </Link>
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
                    <div className="max-w-2xl w-full p-6 sm:p-8 bg-cream-50 rounded-2xl shadow-xl border border-green-100">
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" role="alert">
                            {error}
                        </div>
                        <div className="mt-4 text-center">
                            <Link
                                href="/"
                                className="text-green-dark hover:text-green-darker font-medium"
                            >
                                Retour à l'accueil
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                                <Link
                                    href="/profile"
                                    className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-green-dark hover:text-green-darker hover:bg-green-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-dark focus:ring-offset-2"
                                    aria-label="Voir le profil"
                                >
                                    Profil
                                </Link>
                                <Link
                                    href="/usersList"
                                    className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-green-dark hover:text-green-darker hover:bg-green-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-dark focus:ring-offset-2"
                                    aria-label="Voir la liste des utilisateurs"
                                >
                                    Utilisateurs
                                </Link>
                                <Link
                                    href="/profile"
                                    className="text-green-darkest font-medium text-sm sm:text-base hover:text-green-darker hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-green-dark focus:ring-offset-2 rounded px-2 py-1"
                                    aria-label="Voir mon profil"
                                >
                                    {user.username}
                                </Link>
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

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" role="alert">
                        {error}
                    </div>
                )}

                {/* Section Liste des utilisateurs */}
                <div className="bg-cream-50 rounded-2xl shadow-xl border border-green-100 p-6 sm:p-8">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-green-darkest mb-6">
                        Liste des utilisateurs
                    </h2>
                    
                    {users.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-green-darkest text-lg mb-4">
                                Aucun utilisateur trouvé.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {users.map((userItem) => (
                                <div
                                    key={userItem.id}
                                    className="bg-white rounded-lg border border-green-200 p-4 sm:p-6 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-green-darkest text-base sm:text-lg mb-1">
                                                {userItem.username || 'Utilisateur sans nom'}
                                            </h3>
                                            <p className="text-sm text-green-dark mb-2">
                                                {userItem.email}
                                            </p>
                                        </div>
                                        <div className="bg-gradient-to-r from-green-dark to-green-darker rounded-lg px-3 py-1 text-center">
                                            <p className="text-xl font-bold text-white">
                                                {userItem._count.posts}
                                            </p>
                                            <p className="text-xs text-white/90">
                                                {userItem._count.posts === 1 ? 'Post' : 'Posts'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-xs sm:text-sm text-green-dark">
                                        <p>
                                            Inscrit le {formatDate(userItem.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

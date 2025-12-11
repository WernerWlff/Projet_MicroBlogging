'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, UserListItems } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import { Header } from '@/components/Header';

export default function UsersListPage() {
    const router = useRouter();
    const [users, setUsers] = useState<UserListItems[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/login');
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
                <Header />
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
                <Header />
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
            <Header />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" role="alert">
                        {error}
                    </div>
                )}

                <div className="bg-cream-50 rounded-2xl shadow-xl border border-green-100 p-6 sm:p-8">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-green-darkest mb-6">
                        Liste des utilisateurs
                    </h2>

                    {users.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-green-darkest text-lg">
                                Aucun utilisateur trouvé.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {users.map((user) => (
                                <div
                                    key={user.id}
                                    className="bg-white rounded-lg border border-green-200 p-4 sm:p-6 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg sm:text-xl font-semibold text-green-darkest mb-2">
                                                {user.username}
                                            </h3>
                                            <p className="text-sm text-green-dark mb-1">
                                                {user.email}
                                            </p>
                                            <p className="text-xs text-green-dark">
                                                Inscrit le {formatDate(user.createdAt)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-center">
                                                <p className="text-2xl sm:text-3xl font-bold text-green-dark">
                                                    {user._count.posts}
                                                </p>
                                                <p className="text-xs sm:text-sm text-green-dark">
                                                    {user._count.posts === 1 ? 'post' : 'posts'}
                                                </p>
                                            </div>
                                        </div>
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

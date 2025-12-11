'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, ProfileResponse } from '@/lib/api';
import { isAuthenticated, getUser, logout } from '@/lib/auth';
import { Header } from '@/components/Header';

export default function ProfilePage() {
    const router = useRouter();
    const [profile, setProfile] = useState<ProfileResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const user = getUser();

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/login');
            return;
        }

        const loadProfile = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await api.getProfile();
                setProfile(data);
            } catch (err: any) {
                console.error('Error loading profile:', err);
                setError(err.message || 'Impossible de charger le profil. Vérifiez que le backend est démarré.');
                if (err.message?.includes('Unauthorized') || err.message?.includes('token')) {
                    router.push('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [router]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // chargement
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-cream-50 via-cream-100 to-green-50">
                <Header/>
                <div className="flex items-center justify-center min-h-[calc(100vh-80px)] py-6 sm:py-8 px-4">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-dark"></div>
                        <p className="mt-4 text-green-darkest">Chargement du profil...</p>
                    </div>
                </div>
            </div>
        );
    }

    // si il y a une erreur et pas connecté
    if (error && !profile) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-cream-50 via-cream-100 to-green-50">
                <Header/>
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

    // rends le profil
    return (
        <div className="min-h-screen bg-gradient-to-br from-cream-50 via-cream-100 to-green-50">
            <Header/>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" role="alert">
                        {error}
                    </div>
                )}

                {profile && (
                    <div className="space-y-6">
                        <div className="bg-cream-50 rounded-2xl shadow-xl border border-green-100 p-6 sm:p-8">
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-green-darkest mb-6">
                                Informations du profil
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-green-darkest mb-1">
                                        Nom d'utilisateur
                                    </label>
                                    <p className="text-lg text-green-darkest bg-white px-4 py-2 rounded-lg border border-green-200">
                                        {profile.username || 'Non défini'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-green-darkest mb-1">
                                        Email
                                    </label>
                                    <p className="text-lg text-green-darkest bg-white px-4 py-2 rounded-lg border border-green-200">
                                        {profile.email}
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-green-darkest mb-1">
                                            Date de création
                                        </label>
                                        <p className="text-sm text-green-dark bg-white px-4 py-2 rounded-lg border border-green-200">
                                            {formatDate(profile.createdAt)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-green-darkest mb-1">
                                            Dernière mise à jour
                                        </label>
                                        <p className="text-sm text-green-dark bg-white px-4 py-2 rounded-lg border border-green-200">
                                            {formatDate(profile.updatedAt)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-cream-50 rounded-2xl shadow-xl border border-green-100 p-6 sm:p-8">
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-green-darkest mb-6">
                                Statistiques
                            </h2>
                            <div className="bg-gradient-to-r from-green-dark to-green-darker rounded-lg p-6 text-center">
                                <p className="text-4xl sm:text-5xl font-bold text-white mb-2">
                                    {profile.postsCount}
                                </p>
                                <p className="text-lg sm:text-xl text-white/90">
                                    {profile.postsCount === 1 ? 'Post publié' : 'Posts publiés'}
                                </p>
                            </div>
                        </div>

                        <div className="bg-cream-50 rounded-2xl shadow-xl border border-green-100 p-6 sm:p-8">
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-green-darkest mb-6">
                                Mes posts
                            </h2>
                            {profile.posts.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-green-darkest text-lg mb-4">
                                        Vous n'avez pas encore publié de post.
                                    </p>
                                    <Link
                                        href="/"
                                        className="inline-block px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-green-dark to-green-darker hover:from-green-darker hover:to-green-darkest rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-green-dark focus:ring-offset-2"
                                    >
                                        Créer votre premier post
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {profile.posts.map((post) => (
                                        <div
                                            key={post.id}
                                            className="bg-white rounded-lg border border-green-200 p-4 sm:p-6 hover:shadow-md transition-shadow"
                                        >
                                            <p className="text-green-darkest mb-3 whitespace-pre-wrap break-words">
                                                {post.content}
                                            </p>
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-sm text-green-dark">
                                                <span>
                                                    Publié le {formatDate(post.createdAt)}
                                                </span>
                                                {post.updatedAt !== post.createdAt && (
                                                    <span className="text-xs">
                                                        Modifié le {formatDate(post.updatedAt)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
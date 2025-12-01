'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, Post } from '@/lib/api';
import { isAuthenticated, getUser, logout } from '@/lib/auth';
import Link from 'next/link';

export default function Home() {
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [newPost, setNewPost] = useState('');
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);
    const [error, setError] = useState('');
    const user = getUser();

    useEffect(() => {
        // Charger les posts pour tous les utilisateurs (connectés ou non)
        const init = async () => {
            try {
                await loadPosts();
            } catch (err) {
                console.error('Error initializing:', err);
                setLoading(false);
            }
        };
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadPosts = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await api.getPosts();
            setPosts(data || []);
        } catch (err: any) {
            console.error('Error loading posts:', err);
            setError(err.message || 'Impossible de charger les posts. Vérifiez que le backend est démarré.');
            setPosts([]); // Initialiser avec un tableau vide en cas d'erreur
        } finally {
            setLoading(false);
        }
    };

    const handlePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPost.trim()) return;

        // Vérifier l'authentification avant de poster
        if (!isAuthenticated()) {
            setError('Vous devez être connecté pour publier un post');
            router.push('/login');
            return;
        }

        setPosting(true);
        setError('');

        try {
            const post = await api.createPost(newPost);
            setPosts([post, ...posts]);
            setNewPost('');
        } catch (err: any) {
            setError(err.message || 'Failed to create post');
            // Si l'erreur est liée à l'authentification, rediriger vers login
            if (err.message?.includes('Unauthorized') || err.message?.includes('token')) {
                router.push('/login');
            }
        } finally {
            setPosting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce post ?')) return;

        try {
            await api.deletePost(id);
            setPosts(posts.filter((p) => p.id !== id));
        } catch (err: any) {
            setError(err.message || 'Failed to delete post');
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) return 'À l\'instant';
        if (minutes < 60) return `Il y a ${minutes} min`;
        if (hours < 24) return `Il y a ${hours}h`;
        if (days < 7) return `Il y a ${days}j`;
        return date.toLocaleDateString('fr-FR');
    };

    // Ne bloquer l'affichage que si c'est le premier chargement et qu'il n'y a pas d'erreur
    if (loading && posts.length === 0 && !error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        MicroBlogging
                    </h1>
                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                <span className="text-gray-700 font-medium">
                                    {user.username}
                                </span>
                                <button
                                    onClick={logout}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Déconnexion
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    Connexion
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all"
                                >
                                    S'inscrire
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Create Post Form - Seulement si connecté */}
                {isAuthenticated() ? (
                    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Quoi de neuf ?
                        </h2>
                        {error && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}
                        <form onSubmit={handlePost} className="space-y-4">
                            <textarea
                                value={newPost}
                                onChange={(e) => setNewPost(e.target.value)}
                                placeholder="Partagez vos pensées..."
                                maxLength={500}
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            />
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">
                                    {newPost.length}/500
                                </span>
                                <button
                                    type="submit"
                                    disabled={!newPost.trim() || posting}
                                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {posting ? 'Publication...' : 'Publier'}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-md p-6 mb-8 text-center">
                        <p className="text-gray-600 mb-4">
                            Connectez-vous pour partager vos pensées avec la communauté !
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Link
                                href="/login"
                                className="px-6 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors border border-blue-600"
                            >
                                Se connecter
                            </Link>
                            <Link
                                href="/register"
                                className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all"
                            >
                                Créer un compte
                            </Link>
                        </div>
                    </div>
                )}

                {/* Posts List */}
                {error && (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-4">
                        <p className="font-medium">⚠️ {error}</p>
                        {error.includes('backend') || error.includes('serveur') || error.includes('connecter') ? (
                            <p className="text-sm mt-1">
                                Le backend n'est pas accessible. Vérifiez que le service backend est démarré.
                            </p>
                        ) : (
                            <p className="text-sm mt-1">Les posts existants sont affichés ci-dessous.</p>
                        )}
                    </div>
                )}
                {loading && posts.length > 0 && (
                    <div className="text-center text-gray-500 text-sm mb-4">
                        Actualisation...
                    </div>
                )}
                <div className="space-y-4">
                    {posts.length === 0 && !loading ? (
                        <div className="bg-white rounded-xl shadow-md p-12 text-center">
                            <p className="text-gray-500 text-lg">
                                Aucun post pour le moment. Soyez le premier à publier !
                            </p>
                        </div>
                    ) : (
                        posts.map((post) => (
                            <div
                                key={post.id}
                                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            {post.author.username}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {formatDate(post.createdAt)}
                                        </p>
                                    </div>
                                    {user && post.authorId === user.id && (
                                        <button
                                            onClick={() => handleDelete(post.id)}
                                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                                        >
                                            Supprimer
                                        </button>
                                    )}
                                </div>
                                <p className="text-gray-800 whitespace-pre-wrap">
                                    {post.content}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}

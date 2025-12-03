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
    const [editingPostId, setEditingPostId] = useState<string | null>(null);
    const [editingContent, setEditingContent] = useState('');
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

    const handleEdit = (post: Post) => {
        setEditingPostId(post.id);
        setEditingContent(post.content);
    };

    const handleCancelEdit = () => {
        setEditingPostId(null);
        setEditingContent('');
    };

    const handleUpdate = async (id: string) => {
        if (!editingContent.trim()) return;

        try {
            const updatedPost = await api.updatePost(id, editingContent);
            setPosts(posts.map((p) => (p.id === id ? updatedPost : p)));
            setEditingPostId(null);
            setEditingContent('');
        } catch (err: any) {
            setError(err.message || 'Failed to update post');
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

        if (minutes < 1) return "À l'instant";
        if (minutes < 60) return `Il y a ${minutes} min`;
        if (hours < 24) return `Il y a ${hours}h`;
        if (days < 7) return `Il y a ${days}j`;
        return date.toLocaleDateString('fr-FR');
    };

    // Ne bloquer l'affichage que si c'est le premier chargement et qu'il n'y a pas d'erreur
    if (loading && posts.length === 0 && !error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-50 via-cream-100 to-green-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-dark mx-auto"></div>
                    <p className="mt-4 text-green-darkest">Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-cream-50 via-cream-100 to-green-50">
            {/* Header */}
            <header className="bg-cream-50 shadow-sm border-b border-green-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-dark to-green-darker bg-clip-text text-transparent">
                        MicroBlogging
                    </h1>
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

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {/* Create Post Form - Seulement si connecté */}
                {isAuthenticated() && (
                    <div className="bg-cream-50 rounded-xl shadow-md p-4 sm:p-6 mb-6 sm:mb-8 border border-green-100">
                        <h2 className="text-lg sm:text-xl font-semibold text-green-darkest mb-4">
                            Quoi de neuf ?
                        </h2>
                        {error && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" role="alert" aria-live="polite">
                                {error}
                            </div>
                        )}
                        <form onSubmit={handlePost} className="space-y-4" aria-label="Formulaire de publication">
                            <label htmlFor="new-post" className="sr-only">
                                Contenu du post
                            </label>
                            <textarea
                                id="new-post"
                                value={newPost}
                                onChange={(e) => setNewPost(e.target.value)}
                                placeholder="Partagez vos pensées..."
                                maxLength={500}
                                rows={4}
                                className="w-full px-4 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-dark focus:border-green-dark resize-none bg-white text-green-darkest placeholder-green-dark"
                                aria-label="Zone de texte pour écrire votre post"
                                aria-describedby="char-count"
                            />
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <span id="char-count" className="text-xs sm:text-sm text-green-darkest">
                                    {newPost.length}/500
                                </span>
                                <button
                                    type="submit"
                                    disabled={!newPost.trim() || posting}
                                    className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-green-dark to-green-darker text-white font-medium rounded-lg hover:from-green-darker hover:to-green-darkest focus:outline-none focus:ring-2 focus:ring-green-dark focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    aria-label={posting ? 'Publication en cours' : 'Publier le post'}
                                >
                                    {posting ? 'Publication...' : 'Publier'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Posts List */}
                {error && (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-4" role="alert" aria-live="polite">
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
                    <div className="text-center text-green-darkest text-sm mb-4" aria-live="polite">
                        Actualisation...
                    </div>
                )}
                <div className="space-y-4" role="feed" aria-label="Liste des posts">
                    {posts.length === 0 && !loading ? (
                        <div className="bg-cream-50 rounded-xl shadow-md p-8 sm:p-12 text-center border border-green-100">
                            <p className="text-green-darkest text-base sm:text-lg">
                                Aucun post pour le moment. Soyez le premier à publier !
                            </p>
                        </div>
                    ) : (
                        posts.map((post) => (
                            <article
                                key={post.id}
                                className="bg-cream-50 rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow border border-green-100"
                                aria-label={`Post de ${post.author.username}`}
                            >
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start mb-3 gap-2">
                                    <div>
                                        <h3 className="font-semibold text-green-darkest text-base sm:text-lg">
                                            {post.author.username}
                                        </h3>
                                        <time className="text-xs sm:text-sm text-green-dark" dateTime={post.createdAt}>
                                            {formatDate(post.createdAt)}
                                        </time>
                                    </div>
                                    {user && post.authorId === user.id && (
                                        <div className="flex gap-2 flex-wrap">
                                            {editingPostId === post.id ? (
                                                <>
                                                    <button
                                                        onClick={() => handleUpdate(post.id)}
                                                        className="text-green-dark hover:text-green-darker text-xs sm:text-sm font-medium px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-green-dark focus:ring-offset-1"
                                                        aria-label="Enregistrer les modifications"
                                                    >
                                                        Enregistrer
                                                    </button>
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        className="text-green-darkest hover:text-green-darkest hover:bg-green-100 text-xs sm:text-sm font-medium px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-green-dark focus:ring-offset-1"
                                                        aria-label="Annuler les modifications"
                                                    >
                                                        Annuler
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleEdit(post)}
                                                        className="text-green-dark hover:text-green-darker text-xs sm:text-sm font-medium px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-green-dark focus:ring-offset-1"
                                                        aria-label={`Modifier le post de ${post.author.username}`}
                                                    >
                                                        Modifier
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(post.id)}
                                                        className="text-red-600 hover:text-red-700 text-xs sm:text-sm font-medium px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                                                        aria-label={`Supprimer le post de ${post.author.username}`}
                                                    >
                                                        Supprimer
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {editingPostId === post.id ? (
                                    <>
                                        <label htmlFor={`edit-post-${post.id}`} className="sr-only">
                                            Modifier le contenu du post
                                        </label>
                                        <textarea
                                            id={`edit-post-${post.id}`}
                                            value={editingContent}
                                            onChange={(e) => setEditingContent(e.target.value)}
                                            maxLength={500}
                                            rows={4}
                                            className="w-full px-4 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-dark focus:border-green-dark resize-none bg-white text-green-darkest"
                                            aria-label="Zone de texte pour modifier votre post"
                                        />
                                    </>
                                ) : (
                                    <p className="text-green-darkest whitespace-pre-wrap text-sm sm:text-base">
                                        {post.content}
                                    </p>
                                )}
                            </article>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}

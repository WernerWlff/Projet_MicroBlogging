"use client";

import Link from "next/link";
import { getUser, logout } from "@/lib/auth";

export function Header() {
  const user = getUser();

  return (
    <header className="bg-cream-50 shadow-sm border-b border-green-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <Link href="/" aria-label="Retour à l'accueil">
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-dark to-green-darker bg-clip-text text-transparent cursor-pointer">
            MicroBlogging
          </h1>
        </Link>
        <nav
          className="flex items-center gap-2 sm:gap-4"
          aria-label="Navigation principale"
        >
          {user ? (
            <>
              <Link
                href="/usersList"
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-green-dark hover:text-green-darker hover:bg-green-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-dark focus:ring-offset-2"
                aria-label="Voir la liste des utilisateurs"
              >
                Utilisateurs
              </Link>
              <Link
                href="/profile"
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-green-darkest hover:text-green-darker hover:bg-green-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-dark focus:ring-offset-2"
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
  );
}

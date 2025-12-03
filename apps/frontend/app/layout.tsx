import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'MicroBlogging - Partagez vos pensées',
    description: 'Une expérience de microblogging moderne et intuitive',
    viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
    themeColor: '#16a34a',
    robots: 'index, follow',
    openGraph: {
        type: 'website',
        locale: 'fr_FR',
        siteName: 'MicroBlogging',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="fr">
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
                <meta name="theme-color" content="#16a34a" />
            </head>
            <body className={inter.className}>{children}</body>
        </html>
    )
}

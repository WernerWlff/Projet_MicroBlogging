const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // Nettoyer les données existantes (optionnel - commentez si vous voulez garder les données)
    console.log('🧹 Cleaning existing data...');
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();

    // Créer des utilisateurs de test
    console.log('👤 Creating test users...');
    
    const hashedPassword = await bcrypt.hash('password123', 10);

    const user1 = await prisma.user.create({
        data: {
            email: 'alice@example.com',
            username: 'alice',
            password: hashedPassword,
        },
    });

    const user2 = await prisma.user.create({
        data: {
            email: 'bob@example.com',
            username: 'bob',
            password: hashedPassword,
        },
    });

    const user3 = await prisma.user.create({
        data: {
            email: 'charlie@example.com',
            username: 'charlie',
            password: hashedPassword,
        },
    });

    console.log('✅ Created users:', {
        alice: user1.id,
        bob: user2.id,
        charlie: user3.id,
    });

    // Créer des posts de test
    console.log('📝 Creating test posts...');

    const posts = [
        {
            content: 'Bonjour tout le monde ! C\'est mon premier post sur MicroBlogging. 🎉',
            authorId: user1.id,
        },
        {
            content: 'J\'adore cette nouvelle plateforme de microblogging ! Elle est vraiment intuitive.',
            authorId: user1.id,
        },
        {
            content: 'Salut ! Je suis nouveau ici. Quelqu\'un peut me donner des conseils ?',
            authorId: user2.id,
        },
        {
            content: 'Aujourd\'hui est une belle journée pour partager des pensées ! ☀️',
            authorId: user2.id,
        },
        {
            content: 'Test de modification de post - ce message peut être modifié ou supprimé.',
            authorId: user3.id,
        },
        {
            content: 'Les fonctionnalités de cette plateforme sont vraiment géniales !',
            authorId: user3.id,
        },
    ];

    const createdPosts = [];
    for (const postData of posts) {
        const post = await prisma.post.create({
            data: postData,
            include: {
                author: {
                    select: {
                        id: true,
                        email: true,
                        username: true,
                    },
                },
            },
        });
        createdPosts.push(post);
    }

    console.log('✅ Created', createdPosts.length, 'test posts');
    console.log('📋 Posts created:', createdPosts.map(p => ({ id: p.id, content: p.content.substring(0, 50) + '...', author: p.author.username })));

    console.log('🎉 Seed completed successfully!');
    console.log('\n📋 Test accounts:');
    console.log('  - alice@example.com / password123');
    console.log('  - bob@example.com / password123');
    console.log('  - charlie@example.com / password123');
}

main()
    .catch((e) => {
        console.error('❌ Error during seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });


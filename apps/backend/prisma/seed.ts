const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // Vérifier si les utilisateurs de test existent déjà
    const existingUser1 = await prisma.user.findUnique({
        where: { email: 'alice@example.com' },
    });
    const existingUser2 = await prisma.user.findUnique({
        where: { email: 'bob@example.com' },
    });
    const existingUser3 = await prisma.user.findUnique({
        where: { email: 'charlie@example.com' },
    });

    // Si tous les utilisateurs existent déjà, on skip le seed
    if (existingUser1 && existingUser2 && existingUser3) {
        console.log('✅ Seed data already exists. Skipping seed...');
        console.log('📋 Existing test accounts:');
        console.log('  - alice@example.com / password123');
        console.log('  - bob@example.com / password123');
        console.log('  - charlie@example.com / password123');
        return;
    }

    // Créer des utilisateurs de test seulement s'ils n'existent pas
    console.log('👤 Creating test users...');
    
    const hashedPassword = await bcrypt.hash('password123', 10);

    const user1 = existingUser1 || await prisma.user.create({
        data: {
            email: 'alice@example.com',
            username: 'alice',
            password: hashedPassword,
        },
    });

    const user2 = existingUser2 || await prisma.user.create({
        data: {
            email: 'bob@example.com',
            username: 'bob',
            password: hashedPassword,
        },
    });

    const user3 = existingUser3 || await prisma.user.create({
        data: {
            email: 'charlie@example.com',
            username: 'charlie',
            password: hashedPassword,
        },
    });

    if (!existingUser1 || !existingUser2 || !existingUser3) {
        console.log('✅ Created users:', {
            alice: user1.id,
            bob: user2.id,
            charlie: user3.id,
        });
    }

    // Vérifier si des posts de test existent déjà pour ces utilisateurs
    const existingPostsCount = await prisma.post.count({
        where: {
            authorId: {
                in: [user1.id, user2.id, user3.id],
            },
        },
    });

    // Si des posts existent déjà, on skip la création
    if (existingPostsCount > 0) {
        console.log(`✅ Test posts already exist (${existingPostsCount} posts found). Skipping post creation...`);
    } else {
        // Créer des posts de test seulement s'ils n'existent pas
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
    }

    console.log('🎉 Seed completed successfully!');
    console.log('\n📋 Test accounts (if created):');
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


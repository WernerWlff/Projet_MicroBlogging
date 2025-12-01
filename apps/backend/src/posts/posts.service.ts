import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
    constructor(private prisma: PrismaService) {}

    async create(userId: string, createPostDto: CreatePostDto) {
        return this.prisma.post.create({
            data: {
                content: createPostDto.content,
                authorId: userId,
            },
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
    }

    async findAll() {
        return this.prisma.post.findMany({
            orderBy: {
                createdAt: 'desc',
            },
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
    }

    async findOne(id: string) {
        const post = await this.prisma.post.findUnique({
            where: { id },
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

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        return post;
    }

    async remove(id: string, userId: string) {
        const post = await this.prisma.post.findUnique({
            where: { id },
        });

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        if (post.authorId !== userId) {
            throw new UnauthorizedException('You can only delete your own posts');
        }

        return this.prisma.post.delete({
            where: { id },
        });
    }
}


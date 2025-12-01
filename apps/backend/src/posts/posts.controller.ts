import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('posts')
export class PostsController {
    constructor(private postsService: PostsService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    create(@Request() req, @Body() createPostDto: CreatePostDto) {
        return this.postsService.create(req.user.id, createPostDto);
    }

    @Get()
    findAll() {
        return this.postsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.postsService.findOne(id);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    remove(@Param('id') id: string, @Request() req) {
        return this.postsService.remove(id, req.user.id);
    }
}


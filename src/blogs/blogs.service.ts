import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, In } from 'typeorm';
import { Blog } from './entity/blog.entity';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { QueryBlogDto } from './dto/query-blog.dto';

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(Blog)
    private blogRepository: Repository<Blog>,
  ) {}

  async create(createBlogDto: CreateBlogDto): Promise<Blog> {
    const blog = this.blogRepository.create(createBlogDto);
    return this.blogRepository.save(blog);
  }

  async update(id: number, updateBlogDto: UpdateBlogDto): Promise<Blog> {
    const blog = await this.findOne(id);
    this.blogRepository.merge(blog, updateBlogDto);
    return this.blogRepository.save(blog);
  }

  async findAll(
    queryParams: QueryBlogDto,
  ): Promise<{ posts: Blog[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, tag } = queryParams;

    const whereConditions: FindOptionsWhere<Blog> = {};

    if (tag) {
      whereConditions.tags = In([tag]);
    }

    const total = await this.blogRepository.count({
      where: whereConditions,
      select: ['id'],
    });

    const posts = await this.blogRepository.find({
      where: whereConditions,
      relations: ['author'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      posts,
      total,
      page,
      limit,
    };
  }

  async findAllByAuthor(
    authorId: number,
    queryParams: QueryBlogDto,
  ): Promise<{ posts: Blog[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, tag } = queryParams;

    const queryBuilder = this.blogRepository
      .createQueryBuilder('blog')
      .where('blog.authorId = :authorId', { authorId })
      .leftJoinAndSelect('blog.author', 'author');

    if (tag) {
      queryBuilder.andWhere(':tag = ANY(blog.tags)', { tag });
    }
    const total = await queryBuilder.getCount();

    const posts = await queryBuilder
      .orderBy('blog.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      posts,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<Blog> {
    const blog = await this.blogRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!blog) throw new NotFoundException(`Blog with ID ${id} not found`);
    return blog;
  }

  async remove(id: number): Promise<void> {
    const result = await this.blogRepository.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`Blog with ID ${id} not found`);
  }
}

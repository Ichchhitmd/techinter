import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogsService } from './blogs.service';
import { Blog } from './entity/blog.entity';
import { NotFoundException } from '@nestjs/common';

const mockBlogRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  count: jest.fn(),
  delete: jest.fn(),
  merge: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getCount: jest.fn(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  })),
});

describe('BlogsService', () => {
  let service: BlogsService;
  let repository: Repository<Blog>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogsService,
        {
          provide: getRepositoryToken(Blog),
          useFactory: mockBlogRepository,
        },
      ],
    }).compile();

    service = module.get<BlogsService>(BlogsService);
    repository = module.get<Repository<Blog>>(getRepositoryToken(Blog));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new blog post', async () => {
      const createBlogDto = {
        title: 'Test Blog',
        body: 'Test content',
        authorId: 1,
        tags: ['test', 'blog'],
      };
      const blog = { id: 1, ...createBlogDto } as Blog;
      
      jest.spyOn(repository, 'create').mockReturnValue(blog);
      jest.spyOn(repository, 'save').mockResolvedValue(blog);

      const result = await service.create(createBlogDto);
      
      expect(repository.create).toHaveBeenCalledWith(createBlogDto);
      expect(repository.save).toHaveBeenCalledWith(blog);
      expect(result).toEqual(blog);
    });
  });

  describe('findAll', () => {
    it('should return an array of blogs with pagination', async () => {
      const queryParams = { page: 1, limit: 10 };
      const blogs = [
        { id: 1, title: 'Test Blog 1', body: 'Content 1', authorId: 1, tags: ['test'] },
        { id: 2, title: 'Test Blog 2', body: 'Content 2', authorId: 2, tags: ['blog'] },
      ] as Blog[];
      const total = 2;
      
      jest.spyOn(repository, 'count').mockResolvedValue(total);
      jest.spyOn(repository, 'find').mockResolvedValue(blogs);

      const result = await service.findAll(queryParams);
      
      expect(repository.count).toHaveBeenCalled();
      expect(repository.find).toHaveBeenCalledWith({
        where: {},
        relations: ['author'],
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual({
        posts: blogs,
        total,
        page: 1,
        limit: 10,
      });
    });

    it('should filter blogs by tag', async () => {
      const queryParams = { page: 1, limit: 10, tag: 'test' };
      const blogs = [
        { id: 1, title: 'Test Blog 1', body: 'Content 1', authorId: 1, tags: ['test'] },
      ] as Blog[];
      const total = 1;
      
      jest.spyOn(repository, 'count').mockResolvedValue(total);
      jest.spyOn(repository, 'find').mockResolvedValue(blogs);

      const result = await service.findAll(queryParams);
      
      expect(repository.count).toHaveBeenCalledWith({
        where: { tags: expect.anything() },
      });
      expect(repository.find).toHaveBeenCalledWith({
        where: { tags: expect.anything() },
        relations: ['author'],
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual({
        posts: blogs,
        total,
        page: 1,
        limit: 10,
      });
    });
  });

  describe('findAllByAuthor', () => {
    it('should return blogs by author with pagination', async () => {
      const authorId = 1;
      const queryParams = { page: 1, limit: 10 };
      const blogs = [
        { id: 1, title: 'Test Blog 1', body: 'Content 1', authorId: 1, tags: ['test'] },
        { id: 3, title: 'Test Blog 3', body: 'Content 3', authorId: 1, tags: ['blog'] },
      ] as Blog[];
      const total = 2;
      
      const queryBuilder = repository.createQueryBuilder();
      jest.spyOn(queryBuilder, 'getCount').mockResolvedValue(total);
      jest.spyOn(queryBuilder, 'getMany').mockResolvedValue(blogs);

      const result = await service.findAllByAuthor(authorId, queryParams);
      
      expect(queryBuilder.where).toHaveBeenCalledWith('blog.authorId = :authorId', { authorId });
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('blog.author', 'author');
      expect(queryBuilder.getCount).toHaveBeenCalled();
      expect(queryBuilder.orderBy).toHaveBeenCalledWith('blog.createdAt', 'DESC');
      expect(queryBuilder.skip).toHaveBeenCalledWith(0);
      expect(queryBuilder.take).toHaveBeenCalledWith(10);
      expect(result).toEqual({
        posts: blogs,
        total,
        page: 1,
        limit: 10,
      });
    });

    it('should filter author blogs by tag', async () => {
      const authorId = 1;
      const queryParams = { page: 1, limit: 10, tag: 'test' };
      const blogs = [
        { id: 1, title: 'Test Blog 1', body: 'Content 1', authorId: 1, tags: ['test'] },
      ] as Blog[];
      const total = 1;
      
      const queryBuilder = repository.createQueryBuilder();
      jest.spyOn(queryBuilder, 'getCount').mockResolvedValue(total);
      jest.spyOn(queryBuilder, 'getMany').mockResolvedValue(blogs);

      const result = await service.findAllByAuthor(authorId, queryParams);
      
      expect(queryBuilder.where).toHaveBeenCalledWith('blog.authorId = :authorId', { authorId });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(':tag = ANY(blog.tags)', { tag: 'test' });
      expect(queryBuilder.getCount).toHaveBeenCalled();
      expect(result).toEqual({
        posts: blogs,
        total,
        page: 1,
        limit: 10,
      });
    });
  });

  describe('findOne', () => {
    it('should find a blog by id', async () => {
      const id = 1;
      const blog = { id, title: 'Test Blog', body: 'Content', authorId: 1 } as Blog;
      
      jest.spyOn(repository, 'findOne').mockResolvedValue(blog);

      const result = await service.findOne(id);
      
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id },
        relations: ['author'],
      });
      expect(result).toEqual(blog);
    });

    it('should throw NotFoundException if blog not found', async () => {
      const id = 999;
      
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id },
        relations: ['author'],
      });
    });
  });

  describe('update', () => {
    it('should update a blog', async () => {
      const id = 1;
      const updateBlogDto = { title: 'Updated Title' };
      const blog = { id, title: 'Test Blog', body: 'Content', authorId: 1 } as Blog;
      const updatedBlog = { ...blog, ...updateBlogDto };
      
      jest.spyOn(service, 'findOne').mockResolvedValue(blog);
      jest.spyOn(repository, 'merge').mockReturnValue(updatedBlog);
      jest.spyOn(repository, 'save').mockResolvedValue(updatedBlog);

      const result = await service.update(id, updateBlogDto);
      
      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(repository.merge).toHaveBeenCalledWith(blog, updateBlogDto);
      expect(repository.save).toHaveBeenCalledWith(updatedBlog);
      expect(result).toEqual(updatedBlog);
    });
  });

  describe('remove', () => {
    it('should delete a blog', async () => {
      const id = 1;
      
      jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 1, raw: {} });

      await service.remove(id);
      
      expect(repository.delete).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if blog not found during deletion', async () => {
      const id = 999;
      
      jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 0, raw: {} });

      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
      expect(repository.delete).toHaveBeenCalledWith(id);
    });
  });
});

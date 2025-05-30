import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BlogsController } from './blogs.controller';
import { BlogsService } from './blogs.service';
import { Blog } from './entity/blog.entity';
import { UserRole } from '../author/entity/author.entity';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

const mockBlogsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findAllByAuthor: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('BlogsController', () => {
  let controller: BlogsController;
  let service: BlogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlogsController],
      providers: [
        {
          provide: BlogsService,
          useValue: mockBlogsService,
        },
      ],
    }).compile();

    controller = module.get<BlogsController>(BlogsController);
    service = module.get<BlogsService>(BlogsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAllForAdmin', () => {
    it('should return all blogs including deleted ones for admin', async () => {
      const blogs = [
        { id: 1, title: 'Blog 1' },
        { id: 2, title: 'Blog 2' },
      ];
      const result = {
        posts: blogs,
        total: 2,
        page: 1,
        limit: 10,
      };
      
      jest.spyOn(service, 'findAll').mockResolvedValue(result);

      expect(await controller.findAllForAdmin()).toBe(result);
      expect(service.findAll).toHaveBeenCalledWith({ includeDeleted: true });
    });
  });

  describe('create', () => {
    it('should create a new blog post', async () => {
      const createBlogDto: CreateBlogDto = {
        title: 'New Blog',
        body: 'Blog content',
        tags: ['test'],
      };
      const req = {
        user: { id: 1, name: 'Test User', role: UserRole.AUTHOR },
      };
      const blog = {
        id: 1,
        ...createBlogDto,
        authorId: req.user.id,
      } as Blog;
      
      jest.spyOn(service, 'create').mockResolvedValue(blog);

      expect(await controller.create(createBlogDto, req as any)).toBe(blog);
      expect(service.create).toHaveBeenCalledWith({
        ...createBlogDto,
        authorId: req.user.id,
      });
    });
  });

  describe('findAll', () => {
    it('should return all blogs with pagination', async () => {
      const queryParams = { page: 1, limit: 10 };
      const blogs = [
        { id: 1, title: 'Blog 1' },
        { id: 2, title: 'Blog 2' },
      ];
      const result = {
        posts: blogs,
        total: 2,
        page: 1,
        limit: 10,
      };
      
      jest.spyOn(service, 'findAll').mockResolvedValue(result);

      expect(await controller.findAll(queryParams)).toBe(result);
      expect(service.findAll).toHaveBeenCalledWith(queryParams);
    });
  });

  describe('findByAuthor', () => {
    it('should return all blogs by an author with pagination', async () => {
      const authorId = 1;
      const queryParams = { page: 1, limit: 10 };
      const blogs = [
        { id: 1, title: 'Blog 1', authorId: 1 },
        { id: 3, title: 'Blog 3', authorId: 1 },
      ];
      const result = {
        posts: blogs,
        total: 2,
        page: 1,
        limit: 10,
      };
      
      jest.spyOn(service, 'findAllByAuthor').mockResolvedValue(result);

      expect(await controller.findByAuthor(authorId, queryParams)).toBe(result);
      expect(service.findAllByAuthor).toHaveBeenCalledWith(authorId, queryParams);
    });
  });

  describe('findOne', () => {
    it('should return a blog by id', async () => {
      const id = 1;
      const blog = { id, title: 'Test Blog' } as Blog;
      
      jest.spyOn(service, 'findOne').mockResolvedValue(blog);

      expect(await controller.findOne(id)).toBe(blog);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('should update a blog if user is the author', async () => {
      const id = 1;
      const updateBlogDto: UpdateBlogDto = { title: 'Updated Title' };
      const req = {
        user: { id: 1, role: UserRole.AUTHOR },
      };
      const blog = {
        id,
        title: 'Original Title',
        author: { id: 1 },
      } as unknown as Blog;
      const updatedBlog = { ...blog, title: 'Updated Title' } as Blog;
      
      jest.spyOn(service, 'findOne').mockResolvedValue(blog);
      jest.spyOn(service, 'update').mockResolvedValue(updatedBlog);

      expect(await controller.update(id, updateBlogDto, req as any)).toBe(updatedBlog);
      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(service.update).toHaveBeenCalledWith(id, updateBlogDto);
    });

    it('should update any blog if user is an admin', async () => {
      const id = 1;
      const updateBlogDto: UpdateBlogDto = { title: 'Updated Title' };
      const req = {
        user: { id: 2, role: UserRole.ADMIN },
      };
      const blog = {
        id,
        title: 'Original Title',
        author: { id: 1 },
      } as unknown as Blog;
      const updatedBlog = { ...blog, title: 'Updated Title' } as Blog;
      
      jest.spyOn(service, 'findOne').mockResolvedValue(blog);
      jest.spyOn(service, 'update').mockResolvedValue(updatedBlog);

      expect(await controller.update(id, updateBlogDto, req as any)).toBe(updatedBlog);
      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(service.update).toHaveBeenCalledWith(id, updateBlogDto);
    });

    it('should throw ForbiddenException if user is not the author or admin', async () => {
      const id = 1;
      const updateBlogDto: UpdateBlogDto = { title: 'Updated Title' };
      const req = {
        user: { id: 2, role: UserRole.AUTHOR },
      };
      const blog = {
        id,
        title: 'Original Title',
        author: { id: 1 },
      } as unknown as Blog;
      
      jest.spyOn(service, 'findOne').mockResolvedValue(blog);

      await expect(controller.update(id, updateBlogDto, req as any))
        .rejects.toThrow(ForbiddenException);
      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(service.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a blog if user is the author', async () => {
      const id = 1;
      const req = {
        user: { id: 1, role: UserRole.AUTHOR },
      };
      const blog = {
        id,
        author: { id: 1 },
      } as unknown as Blog;
      
      jest.spyOn(service, 'findOne').mockResolvedValue(blog);
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      await controller.remove(id, req as any);
      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(service.remove).toHaveBeenCalledWith(id);
    });

    it('should remove any blog if user is an admin', async () => {
      const id = 1;
      const req = {
        user: { id: 2, role: UserRole.ADMIN },
      };
      const blog = {
        id,
        author: { id: 1 },
      } as unknown as Blog;
      
      jest.spyOn(service, 'findOne').mockResolvedValue(blog);
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      await controller.remove(id, req as any);
      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(service.remove).toHaveBeenCalledWith(id);
    });

    it('should throw ForbiddenException if user is not the author or admin', async () => {
      const id = 1;
      const req = {
        user: { id: 2, role: UserRole.AUTHOR },
      };
      const blog = {
        id,
        author: { id: 1 },
      } as unknown as Blog;
      
      jest.spyOn(service, 'findOne').mockResolvedValue(blog);

      await expect(controller.remove(id, req as any))
        .rejects.toThrow(ForbiddenException);
      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(service.remove).not.toHaveBeenCalled();
    });
  });
});

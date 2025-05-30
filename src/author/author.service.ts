import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Author } from './entity/author.entity';
import { CreateAuthorDto } from './dto/create-author.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthorService {
  constructor(
    @InjectRepository(Author)
    private authorRepository: Repository<Author>,
  ) {}

  async create(createAuthorDto: CreateAuthorDto): Promise<Author> {
    const { password, ...authorData } = createAuthorDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const author = this.authorRepository.create({
      ...authorData,
      password: hashedPassword,
    });

    return this.authorRepository.save(author);
  }

  async findAll(): Promise<Author[]> {
    return this.authorRepository.find({ relations: ['blogs'] });
  }

  async findOne(id: number): Promise<Author> {
    const author = await this.authorRepository.findOne({
      where: { id },
      relations: ['blogs'],
    });
    if (!author) throw new NotFoundException(`Author with ID ${id} not found`);
    return author;
  }

  async remove(id: number): Promise<void> {
    const result = await this.authorRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Author with ID ${id} not found`);
    }
  }

  async findByEmail(email: string): Promise<Author | null> {
    return this.authorRepository.findOne({ where: { email } });
  }

  async updatePassword(id: number, password: string): Promise<void> {
    await this.findOne(id);

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    await this.authorRepository.update(id, { password: hashedPassword });
  }
}

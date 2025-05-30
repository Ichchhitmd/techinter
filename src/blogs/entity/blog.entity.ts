import { Author } from 'src/author/entity/author.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('blogs')
export class Blog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  body: string;

  @Column()
  authorId: number;

  @ManyToOne(() => Author, (author) => author.blogs)
  author: Author;

  @Column('text', { array: true })
  tags: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

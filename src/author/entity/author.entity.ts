import { Blog } from 'src/blogs/entity/blog.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  AUTHOR = 'author',
  ADMIN = 'admin',
}

@Entity('author')
export class Author {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.AUTHOR,
  })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Blog, (blog) => blog.author)
  blogs: Blog[];
}

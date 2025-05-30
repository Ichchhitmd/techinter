import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Author } from '../../author/entity/author.entity';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  authorId: number;

  @ManyToOne(() => Author)
  @JoinColumn({ name: 'authorId' })
  author: Author;

  @Column({ default: false })
  isRevoked: boolean;

  @Column()
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

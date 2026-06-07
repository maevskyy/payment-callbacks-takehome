import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
@Index('uq_users_brand_email', ['brandId', 'email'], { unique: true })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  brandId!: string;

  @Column({ type: 'varchar' })
  email!: string;

  @Column({ type: 'varchar' })
  passwordHash!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}

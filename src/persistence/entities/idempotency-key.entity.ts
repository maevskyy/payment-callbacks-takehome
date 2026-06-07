import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Records keys of already-processed callbacks for deduplication. The unique
 * constraint on (brandId, key) is the source of truth for idempotency: a repeat
 * insert fails at the DB level, even under concurrency.
 */
@Entity({ name: 'idempotency_keys' })
@Index('uq_idempotency_brand_key', ['brandId', 'key'], { unique: true })
export class IdempotencyKeyEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  brandId!: string;

  @Column({ type: 'varchar' })
  key!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}

import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Verbatim, unprocessed webhook payload (outbox-like). The intake path only
 * writes here; a future ledger process reads from here. No business meaning is
 * attached at write time.
 */
@Entity({ name: 'raw_events' })
export class RawEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_raw_events_brand')
  @Column({ type: 'varchar' })
  brandId!: string;

  @Column({ type: 'varchar' })
  provider!: string;

  @Column({ type: 'jsonb' })
  payload!: Record<string, unknown>;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  receivedAt!: Date;
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdempotencyKeyEntity } from './entities/idempotency-key.entity';
import { RawEventEntity } from './entities/raw-event.entity';
import { SessionEntity } from './entities/session.entity';
import { UserEntity } from './entities/user.entity';

/**
 * The only layer that talks to the database. Registers the four entities and
 * re-exports the TypeORM feature so feature modules can inject repositories
 * without re-declaring entities.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      SessionEntity,
      RawEventEntity,
      IdempotencyKeyEntity,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class PersistenceModule {}

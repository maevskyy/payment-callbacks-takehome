import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { CommonModule } from './common/common.module';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { IdentityModule } from './identity/identity.module';
import { PersistenceModule } from './persistence/persistence.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        // Dev convenience: create the four tables on boot. A real deployment
        // would switch to migrations (noted in ARCHITECTURE.md / ADR-2).
        synchronize: true,
      }),
    }),
    CommonModule,
    PersistenceModule,
    IdentityModule,
  ],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}

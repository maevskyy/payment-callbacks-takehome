import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupOpenApi(app: INestApplication): void {
  const openApiConfig = new DocumentBuilder()
    .setTitle('Payment Callbacks Service')
    .setDescription('Identity plus tenant-scoped PSP/GSP callback intake.')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const openApiDocument = SwaggerModule.createDocument(app, openApiConfig);
  SwaggerModule.setup('docs', app, openApiDocument);
}

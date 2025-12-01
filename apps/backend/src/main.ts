import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Security - Configurer Helmet pour ne pas bloquer les requêtes
    app.use(helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        contentSecurityPolicy: false, // Désactiver CSP pour le développement
    }));
    
    // CORS - Autoriser toutes les origines en développement
    app.enableCors({
        origin: true, // Autoriser toutes les origines
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });

    // Validation
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));

    // Écouter sur toutes les interfaces (0.0.0.0) pour Docker
    await app.listen(3001, '0.0.0.0');
    console.log(`Application is running on: http://0.0.0.0:3001`);
}
bootstrap();

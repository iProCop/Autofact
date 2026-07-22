"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const path_1 = require("path");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const config = app.get(config_1.ConfigService);
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.enableCors({
        origin: config.get('CORS_ORIGIN') ?? 'http://localhost:3000',
        credentials: true,
    });
    const uploadDir = config.get('UPLOAD_DIR') ?? 'uploads';
    app.useStaticAssets((0, path_1.join)(process.cwd(), uploadDir), { prefix: '/uploads' });
    const swagger = new swagger_1.DocumentBuilder()
        .setTitle('AutoInspect API')
        .setDescription('Marketplace of used-car inspection reports')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    swagger_1.SwaggerModule.setup('api/docs', app, swagger_1.SwaggerModule.createDocument(app, swagger));
    const port = config.get('PORT') ?? 3001;
    await app.listen(port);
    console.log(`API http://localhost:${port}/api/v1`);
    console.log(`Swagger http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map
import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { MediaType, Role } from '@prisma/client';
import { ReportsService } from './reports.service';
import { CreateReportDto, ListReportsQueryDto } from './dto/reports.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../common/guards/jwt-auth.guard';

const uploadPath = join(process.cwd(), process.env.UPLOAD_DIR ?? 'uploads');
if (!existsSync(uploadPath)) mkdirSync(uploadPath, { recursive: true });

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get()
  list(@Query() query: ListReportsQueryDto) {
    return this.reports.list(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EXPERT, Role.ADMIN)
  @Get('mine')
  mine(@CurrentUser() user: AuthUser) {
    return this.reports.myReports(user);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  getOne(
    @Param('id') id: string,
    @Req() req: { user?: AuthUser },
  ) {
    return this.reports.getOne(id, req.user ?? null);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EXPERT, Role.ADMIN)
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateReportDto) {
    return this.reports.createDraft(user, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EXPERT, Role.ADMIN)
  @Post(':id/publish')
  publish(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.reports.publish(user, id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EXPERT, Role.ADMIN)
  @Post(':id/media')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadPath,
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 25 * 1024 * 1024 },
    }),
  )
  uploadMedia(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new Error('Файл не передан');
    return this.reports.addMedia(user, id, file.filename, MediaType.PHOTO);
  }
}

import { ReportsService } from "./reports.service";
import { CreateReportDto, ListReportsQueryDto } from "./reports.dto";
import { JwtAuthGuard, OptionalJwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { CurrentUser, AuthUser } from "src/common/decorators/current-user.decorator";
import { Param, UseGuards } from "@nestjs/common";

@Get('mine')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.EXPERT, Role.ADMIN)
mine(@CurrentUser() user: AuthUser) {
  return this.reports.myReports(user);
}

@Get(':id')
@UseGuards(OptionalJwtAuthGuard)
getOne(@Param('id') id: string, @Req() req: { user?: AuthUser }) {
    return this.reports.getOne(id, req.user ?? null);
}
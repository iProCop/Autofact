import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { CurrentUser, AuthUser } from "src/common/decorators/current-user.decorator";

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private readonly users: UsersService) {}

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('me')
    me(@CurrentUser() user: AuthUser) {
        return this.users.getMe(user.userId);
    }

    @Get('experts')
    experts(@Query('region') region?: string) {
        return this.users.listExperts(region);
    }
}
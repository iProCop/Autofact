"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentUser = exports.AuthUser = void 0;
const common_1 = require("@nestjs/common");
class AuthUser {
    userId;
    email;
    role;
}
exports.AuthUser = AuthUser;
exports.CurrentUser = (0, common_1.createParamDecorator)((_data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
});
//# sourceMappingURL=current-user.decorator.js.map
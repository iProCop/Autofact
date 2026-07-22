"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchasesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
const purchases_service_1 = require("./purchases.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
class InitiatePurchaseDto {
    reportId;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InitiatePurchaseDto.prototype, "reportId", void 0);
class MockConfirmDto {
    paymentId;
    reportId;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MockConfirmDto.prototype, "paymentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MockConfirmDto.prototype, "reportId", void 0);
let PurchasesController = class PurchasesController {
    purchases;
    constructor(purchases) {
        this.purchases = purchases;
    }
    initiate(user, dto) {
        return this.purchases.initiate(user, dto.reportId);
    }
    history(user) {
        return this.purchases.history(user);
    }
    mockConfirm(dto) {
        return this.purchases.confirmMock(dto.paymentId, dto.reportId);
    }
};
exports.PurchasesController = PurchasesController;
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.CLIENT, client_1.Role.ADMIN),
    (0, common_1.Post)('initiate'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [current_user_decorator_1.AuthUser, InitiatePurchaseDto]),
    __metadata("design:returntype", void 0)
], PurchasesController.prototype, "initiate", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.CLIENT, client_1.Role.ADMIN),
    (0, common_1.Get)('history'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [current_user_decorator_1.AuthUser]),
    __metadata("design:returntype", void 0)
], PurchasesController.prototype, "history", null);
__decorate([
    (0, common_1.Post)('mock/confirm'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [MockConfirmDto]),
    __metadata("design:returntype", void 0)
], PurchasesController.prototype, "mockConfirm", null);
exports.PurchasesController = PurchasesController = __decorate([
    (0, swagger_1.ApiTags)('purchases'),
    (0, common_1.Controller)('purchases'),
    __metadata("design:paramtypes", [purchases_service_1.PurchasesService])
], PurchasesController);
//# sourceMappingURL=purchases.controller.js.map
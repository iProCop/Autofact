"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockYooKassaProvider = void 0;
const common_1 = require("@nestjs/common");
let MockYooKassaProvider = class MockYooKassaProvider {
    async createPayment(input) {
        const paymentId = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        return {
            paymentId,
            status: 'pending',
            confirmationUrl: `http://localhost:3000/payments/mock?paymentId=${paymentId}&amount=${input.amountKopecks}&reportId=${input.metadata.reportId ?? ""}`,
        };
    }
    async confirmMock(paymentId) {
        return {
            paymentId,
            status: 'succeeded',
            confirmationUrl: null,
        };
    }
};
exports.MockYooKassaProvider = MockYooKassaProvider;
exports.MockYooKassaProvider = MockYooKassaProvider = __decorate([
    (0, common_1.Injectable)()
], MockYooKassaProvider);
//# sourceMappingURL=mock-yookassa.provider.js.map
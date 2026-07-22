"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingService = void 0;
const common_1 = require("@nestjs/common");
let PricingService = class PricingService {
    getPriceKopecks(basePriceKopecks, createdAt, now = new Date()) {
        const ageDays = this.ageInDays(createdAt, now);
        if (ageDays > 60) {
            return { priceKopecks: 0, multiplier: 0, archived: true, ageDays };
        }
        const multiplier = this.multiplierForAge(ageDays);
        return {
            priceKopecks: Math.round(basePriceKopecks * multiplier),
            multiplier,
            archived: false,
            ageDays,
        };
    }
    multiplierForAge(ageDays) {
        if (ageDays <= 3)
            return 1;
        if (ageDays <= 10)
            return 0.8;
        if (ageDays <= 30)
            return 0.5;
        if (ageDays <= 60)
            return 0.2;
        return 0;
    }
    ageInDays(createdAt, now = new Date()) {
        const ms = now.getTime() - createdAt.getTime();
        return Math.floor(ms / (1000 * 60 * 60 * 24));
    }
};
exports.PricingService = PricingService;
exports.PricingService = PricingService = __decorate([
    (0, common_1.Injectable)()
], PricingService);
//# sourceMappingURL=pricing.service.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformScoreService = void 0;
const common_1 = require("@nestjs/common");
let PlatformScoreService = class PlatformScoreService {
    calculate(scores) {
        const unique = this.uniqueByExpert(scores);
        if (unique.length < 3) {
            return { platformScore: null, disputed: false, sampleSize: unique.length };
        }
        const values = unique.map((s) => s.overallScore);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const disputed = max - min > 2.0;
        let weightSum = 0;
        let weighted = 0;
        for (const item of unique) {
            const w = Math.max(Number(item.expertRating), 0.1);
            weighted += item.overallScore * w;
            weightSum += w;
        }
        const platformScore = Math.round((weighted / weightSum) * 100) / 100;
        return { platformScore, disputed, sampleSize: unique.length };
    }
    uniqueByExpert(scores) {
        const map = new Map();
        for (const s of scores) {
            if (!map.has(s.expertId))
                map.set(s.expertId, s);
        }
        return [...map.values()];
    }
};
exports.PlatformScoreService = PlatformScoreService;
exports.PlatformScoreService = PlatformScoreService = __decorate([
    (0, common_1.Injectable)()
], PlatformScoreService);
//# sourceMappingURL=platform-score.service.js.map
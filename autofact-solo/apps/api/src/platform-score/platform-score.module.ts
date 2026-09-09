import { Module } from "@nestjs/common";
import { PlatformScoreService } from "./platform-score.service";

@Module({
    providers: [PlatformScoreService],
    exports: [PlatformScoreService],
})
export class PlatformScoreModule {}
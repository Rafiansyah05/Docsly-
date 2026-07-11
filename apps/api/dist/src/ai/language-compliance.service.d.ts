import { ConfigService } from '@nestjs/config';
import { BlockOperation } from './executor.service';
export declare class LanguageComplianceService {
    private configService;
    private anthropic;
    constructor(configService: ConfigService);
    verify(operations: BlockOperation[]): Promise<BlockOperation[]>;
}

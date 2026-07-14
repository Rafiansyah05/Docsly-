import { ConfigService } from '@nestjs/config';
import { UserIntent } from './intent.service';
export interface ProseMirrorTextNode {
    type: 'text';
    text: string;
    marks?: Array<{
        type: 'bold' | 'italic' | 'underline' | 'strike';
    }>;
}
export interface ProseMirrorBlockNode {
    type: 'paragraph' | 'heading' | 'bulletList' | 'orderedList' | 'listItem';
    attrs?: {
        level?: number;
        indent?: number;
    };
    content?: Array<ProseMirrorTextNode | ProseMirrorBlockNode>;
}
export interface BlockOperation {
    op: 'insert' | 'replace' | 'delete';
    index: number;
    node?: ProseMirrorBlockNode;
}
export declare class TaskExecutor {
    private configService;
    private anthropic;
    constructor(configService: ConfigService);
    execute(intent: UserIntent, prompt: string, documentContext: string, isAssuming?: boolean, attachments?: any[]): Promise<{
        operations: BlockOperation[];
        explanation?: string;
    }>;
    private executeWithClaude;
    private parseAttachments;
    private getSystemPrompt;
    private getMockResponse;
}

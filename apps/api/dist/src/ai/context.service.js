"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextBuilder = void 0;
const common_1 = require("@nestjs/common");
let ContextBuilder = class ContextBuilder {
    build(documentJson, activeBlockIndex) {
        if (!documentJson || !documentJson.content) {
            return 'Dokumen Kosong.';
        }
        const blocks = documentJson.content;
        let result = '';
        const limit = 50;
        const shouldCompress = blocks.length > limit && activeBlockIndex !== undefined;
        for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i];
            if (shouldCompress) {
                const isFar = Math.abs(i - (activeBlockIndex ?? 0)) > 5;
                const isHeading = block.type === 'heading';
                if (isFar && !isHeading) {
                    if (!result.endsWith('...\n')) {
                        result += `[Blocks ${i} terkompresi untuk efisiensi token]\n`;
                    }
                    continue;
                }
            }
            const text = this.getNodeText(block);
            result += `[Block ${i}] ${block.type}: ${text}\n`;
        }
        return result;
    }
    getNodeText(node) {
        if (!node)
            return '';
        if (node.text)
            return node.text;
        if (node.content) {
            return node.content.map((child) => this.getNodeText(child)).join('');
        }
        return '';
    }
};
exports.ContextBuilder = ContextBuilder;
exports.ContextBuilder = ContextBuilder = __decorate([
    (0, common_1.Injectable)()
], ContextBuilder);
//# sourceMappingURL=context.service.js.map
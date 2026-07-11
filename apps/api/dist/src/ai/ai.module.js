"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiAgentModule = void 0;
const common_1 = require("@nestjs/common");
const ai_controller_1 = require("./ai.controller");
const intent_service_1 = require("./intent.service");
const context_service_1 = require("./context.service");
const executor_service_1 = require("./executor.service");
const smart_question_service_1 = require("./smart-question.service");
const language_compliance_service_1 = require("./language-compliance.service");
let AiAgentModule = class AiAgentModule {
};
exports.AiAgentModule = AiAgentModule;
exports.AiAgentModule = AiAgentModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [ai_controller_1.AiController],
        providers: [
            intent_service_1.IntentClassifier,
            context_service_1.ContextBuilder,
            executor_service_1.TaskExecutor,
            smart_question_service_1.SmartQuestionService,
            language_compliance_service_1.LanguageComplianceService,
        ],
        exports: [
            intent_service_1.IntentClassifier,
            context_service_1.ContextBuilder,
            executor_service_1.TaskExecutor,
            smart_question_service_1.SmartQuestionService,
            language_compliance_service_1.LanguageComplianceService,
        ],
    })
], AiAgentModule);
//# sourceMappingURL=ai.module.js.map
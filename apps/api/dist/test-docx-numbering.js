"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const docx_1 = require("docx");
const doc = new docx_1.Document({
    numbering: {
        config: [
            {
                reference: "my-list",
                levels: [
                    {
                        level: 0,
                        format: docx_1.LevelFormat.LOWER_LETTER,
                        text: "%1.",
                        alignment: docx_1.AlignmentType.LEFT,
                        style: { paragraph: { indent: { left: 720, hanging: 360 } } }
                    },
                    {
                        level: 1,
                        format: docx_1.LevelFormat.LOWER_ROMAN,
                        text: "%2.",
                        alignment: docx_1.AlignmentType.LEFT,
                        style: { paragraph: { indent: { left: 1440, hanging: 360 } } }
                    }
                ]
            }
        ]
    },
    sections: [
        {
            children: [
                new docx_1.Paragraph({
                    children: [new docx_1.TextRun("Item A")],
                    numbering: { reference: "my-list", level: 0 }
                }),
                new docx_1.Paragraph({
                    children: [new docx_1.TextRun("Item B")],
                    numbering: { reference: "my-list", level: 0 }
                }),
                new docx_1.Paragraph({
                    children: [new docx_1.TextRun("Item i (nested)")],
                    numbering: { reference: "my-list", level: 1 }
                })
            ]
        }
    ]
});
docx_1.Packer.toBuffer(doc).then(buf => {
    console.log("Success! Buffer length:", buf.length);
}).catch(console.error);
//# sourceMappingURL=test-docx-numbering.js.map
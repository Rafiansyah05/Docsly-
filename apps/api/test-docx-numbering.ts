import { Document, Packer, Paragraph, LevelFormat, AlignmentType, TextRun } from 'docx';
import * as fs from 'fs';

const doc = new Document({
  numbering: {
    config: [
      {
        reference: "my-list",
        levels: [
          {
            level: 0,
            format: LevelFormat.LOWER_LETTER,
            text: "%1.",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } }
          },
          {
            level: 1,
            format: LevelFormat.LOWER_ROMAN,
            text: "%2.",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 1440, hanging: 360 } } }
          }
        ]
      }
    ]
  },
  sections: [
    {
      children: [
        new Paragraph({
          children: [new TextRun("Item A")],
          numbering: { reference: "my-list", level: 0 }
        }),
        new Paragraph({
          children: [new TextRun("Item B")],
          numbering: { reference: "my-list", level: 0 }
        }),
        new Paragraph({
          children: [new TextRun("Item i (nested)")],
          numbering: { reference: "my-list", level: 1 }
        })
      ]
    }
  ]
});

Packer.toBuffer(doc).then(buf => {
  console.log("Success! Buffer length:", buf.length);
}).catch(console.error);

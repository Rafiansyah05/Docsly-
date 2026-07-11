const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const key = env.match(/ANTHROPIC_API_KEY=(.*)/)[1];

const Anthropic = require('@anthropic-ai/sdk');
const anthropic = new Anthropic({ apiKey: key });

const systemPrompt = `# ROLE
You are Docsly AI, an autonomous Document AI Agent.
Your primary responsibility is executing document editing tasks inside the editor.
You always think in terms of actions, not conversations.
Your goal is helping users produce high quality documents while keeping the user fully in control.
You NEVER modify the document directly.
Instead, you always generate a proposed patch (operations) that the user can Review -> Accept -> Reject.

# DOCUMENT PERMISSION
You have full permission to inspect the document. You may read, search, replace, rewrite, delete, insert, create new sections, rename headings, fix formatting, etc.
But every modification MUST become a proposed change. Never silently change the document.

# EDITING PRINCIPLE
Every user request should become an executable editing task.
Example: 'Tambahkan abstrak.' -> Action: Insert new Abstract section.
Never answer with instructions explaining how. Always perform the requested operation.

# OUTPUT MODE (JSON STRUCTURE)
You never output the final document directly. Instead generate structured editing operations in JSON format.
Each operation MUST follow this JSON schema exactly:

{
  "operations": [
    {
      "op": "insert" | "replace" | "delete",
      "index": number, // 0-indexed position in the document content array
      "node": { // Required for "insert" and "replace"
        "type": "paragraph" | "heading" | "bulletList" | "orderedList" | "listItem",
        "attrs": { "level": number, "indent": number }, // Optional
        "content": [
          {
            "type": "text",
            "text": "The text content",
            "marks": [ { "type": "bold" | "italic" | "underline" | "strike" } ]
          }
        ]
      }
    }
  ],
  "explanation": "Pesan balasan ke user."
}

CRITICAL RULES:
1. Output ONLY the valid JSON object. Do NOT wrap it in markdown block like \`\`\`json.
2. Escape all newlines as \\n inside strings to ensure valid JSON!
3. For the 'explanation', gunakan gaya bahasa santai, natural, seperti manusia biasa dengan sedikit lelucon lucu atau witty, namun tetap menunjukkan kinerja serius dan profesional.
4. Gunakan formatting (bold, bulletList, orderedList) jika struktur konten membutuhkannya. (For lists, 'bulletList' contains 'listItem' which contains 'paragraph').
5. The document text color must be default black. Do not add any text color to the nodes.
6. Use Indonesian language for all text content you generate.
7. Generate minimal patches. Never rewrite the whole document if only one section changes.`;

async function test() {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 4000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Document Current State:\n[Block 0] type: paragraph\n  Text: Document body here\n\nUser Request: Tolong buatkan saya Bagian Abstrak dibagian atas BAB 1, sesuai dengan isi document ini`
        }
      ]
    });

    console.log('RAW OUTPUT FROM CLAUDE:');
    console.log(response.content[0].text);
  } catch (err) {
    console.error("API ERROR:", err.message);
  }
}
test();

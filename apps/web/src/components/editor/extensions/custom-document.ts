import Document from '@tiptap/extension-document';
import { defaultPageSettings } from '@/lib/page-numbers';

export const CustomDocument = Document.extend({
  addAttributes() {
    return {
      pageSettings: {
        default: defaultPageSettings,
        parseHTML: element => {
          const settingsStr = element.getAttribute('data-page-settings');
          if (settingsStr) {
            try {
              return JSON.parse(settingsStr);
            } catch (e) {
              return defaultPageSettings;
            }
          }
          return defaultPageSettings;
        },
        renderHTML: attributes => {
          if (!attributes.pageSettings) {
            return {};
          }
          return {
            'data-page-settings': JSON.stringify(attributes.pageSettings)
          };
        }
      }
    };
  }
});

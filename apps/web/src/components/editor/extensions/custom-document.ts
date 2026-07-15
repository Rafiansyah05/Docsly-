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
      },
      layout: {
        default: { top: 96, bottom: 96, left: 96, right: 96 },
        parseHTML: element => {
          const layoutStr = element.getAttribute('data-layout');
          if (layoutStr) {
            try {
              return JSON.parse(layoutStr);
            } catch (e) {
              return { top: 96, bottom: 96, left: 96, right: 96 };
            }
          }
          return { top: 96, bottom: 96, left: 96, right: 96 };
        },
        renderHTML: attributes => {
          if (!attributes.layout) {
            return {};
          }
          return {
            'data-layout': JSON.stringify(attributes.layout)
          };
        }
      }
    };
  }
});

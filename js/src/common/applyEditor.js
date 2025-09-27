import { extend, override } from 'flarum/common/extend';

import Button from 'flarum/common/components/Button';
import TextEditor from 'flarum/common/components/TextEditor';
import Tooltip from 'flarum/common/components/Tooltip';
import classList from 'flarum/common/utils/classList';

import ProseMirrorEditorDriver from './proseMirror/ProseMirrorEditorDriver';
import ProseMirrorMenu from './components/ProseMirrorMenu';
import MenuState from './states/MenuState';

export default function applyEditor() {
  extend(TextEditor.prototype, 'controlItems', function (items) {
    if (!app.forum.attribute('toggleRichTextEditorButton')) return;

    const buttonOnClick = () => {
      app.session.user.savePreferences({ useRichTextEditor: !app.session.user.preferences().useRichTextEditor }).then(() => {
        app.composer.editor.destroy();
        this.attrs.composer.editor = this.buildEditor(this.$('.TextEditor-editorContainer')[0]);
        m.redraw.sync();
        app.composer.editor.focus();
      });
    };

    items.add(
      'rich-text',
      <Tooltip text={app.translator.trans('askvortsov-rich-text.lib.composer.toggle_button')}>
        <Button
          icon="fas fa-pen-fancy"
          className={classList({ Button: true, 'Button--icon': true, active: app.session.user.preferences().useRichTextEditor })}
          onclick={buttonOnClick}
        />
      </Tooltip>,
      -10
    );
  });

  extend(TextEditor.prototype, 'toolbarItems', function (items) {
    console.log('[DEBUG] TextEditor toolbarItems called, rich text enabled:', app.session.user?.preferences?.()?.useRichTextEditor);
    console.log('[DEBUG] Available toolbar items:', Object.keys(items.items));
    
    if (app.session.user?.preferences?.()?.useRichTextEditor) {
      // When rich text is active, completely replace the toolbar
      // Ensure menuState exists before creating the menu
      if (!this.menuState) {
        console.log('[DEBUG] Creating new MenuState');
        this.menuState = new MenuState();
      }
      
      console.log('[DEBUG] Adding ProseMirror menu, menuState:', this.menuState);
      
      // Add only the ProseMirror menu first
      items.add('prosemirror-menu', <ProseMirrorMenu state={this.menuState} />, 100);
      
      // Store all other items before we clear them
      const otherItems = {};
      Object.keys(items.items).forEach(key => {
        if (key !== 'prosemirror-menu') {
          otherItems[key] = items.items[key];
        }
      });
      
      console.log('[DEBUG] Other items to preserve:', Object.keys(otherItems));
      
      // Override the toArray method to return only ProseMirror menu (no separate buttons)
      const originalToArray = items.toArray.bind(items);
      items.toArray = function() {
        console.log('[DEBUG] Custom toArray called, returning only ProseMirror menu');
        const proseMirrorItem = items.items['prosemirror-menu'];
        console.log('[DEBUG] ProseMirror item:', proseMirrorItem);
        
        if (proseMirrorItem && proseMirrorItem.content) {
          // Return only the ProseMirror menu (extension buttons are now inline)
          const result = [proseMirrorItem.content];
          console.log('[DEBUG] Final toolbar items:', result.length, result);
          return result;
        } else {
          console.log('[DEBUG] ProseMirror item not ready, returning empty array');
          return [];
        }
      };
      
      return;
    }
    
    // In markdown mode, the GIF picker button should be handled by forum/index.tsx
    console.log('[DEBUG] Markdown mode, items:', items.toArray().map(item => item.key));
  });

  extend(TextEditor.prototype, 'buildEditorParams', function (items) {
    console.log('[DEBUG] buildEditorParams called, rich text enabled:', app.session.user.preferences().useRichTextEditor);
    
    if (!app.session.user.preferences().useRichTextEditor) return;

    items.menuState = this.menuState = new MenuState();
    items.classNames.push('Post-body');
    items.escape = () => app.composer.close();
    m.redraw();
  });

  override(TextEditor.prototype, 'buildEditor', function (original, dom) {
    console.log('[DEBUG] buildEditor called, rich text enabled:', app.session.user.preferences().useRichTextEditor);
    
    if (app.session.user.preferences().useRichTextEditor) {
      return new ProseMirrorEditorDriver(dom, this.buildEditorParams());
    }

    return original(dom);
  });
}

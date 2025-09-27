import { toggleBlockType, toggleWrap, wrapIn } from 'tiptap-commands';

import Component from 'flarum/common/Component';
import ItemList from 'flarum/common/utils/ItemList';
import Button from 'flarum/common/components/Button';

import CommandButton from './CommandButton';
import MarkButton from './MarkButton';
import NodeTypeDropdown from './NodeTypeDropdown';
import InsertImageDropdown from './InsertImageDropdown';
import InsertLinkDropdown from './InsertLinkDropdown';
import ListButton from './ListButton';
import insertHr from '../proseMirror/commands/insertHr';
import HiddenItemsDropdown from './HiddenItemsDropdown';

export default class ProseMirrorMenu extends Component {
  oninit(vnode) {
    super.oninit(vnode);

    this.modifierKey = navigator.userAgent.match(/Macintosh/) ? '⌘' : 'ctrl';
  }
  view(vnode) {
    console.log('[DEBUG] ProseMirrorMenu view() called');
    console.log('[DEBUG] ProseMirrorMenu this.attrs:', this.attrs);
    
    // Multiple levels of safety checks
    if (!this.attrs || !this.attrs.state) {
      console.log('[ProseMirror] No state provided to menu');
      return <div class="ProseMirrorMenu">No state</div>;
    }
    
    const state = this.attrs.state;
    console.log('[DEBUG] ProseMirrorMenu state:', state);
    
    // Check if the state has an editorView before rendering
    if (!state.editorView) {
      console.log('[ProseMirror] Editor view not ready yet');
      return <div class="ProseMirrorMenu">Loading editor...</div>;
    }

    console.log('[DEBUG] ProseMirrorMenu rendering items');
    const itemsArray = this.items().toArray();
    console.log('[DEBUG] ProseMirrorMenu items array:', itemsArray);
    console.log('[DEBUG] ProseMirrorMenu items details:', itemsArray.map((item, index) => ({
      index,
      item: item,
      type: typeof item,
      constructor: item ? item.constructor.name : 'null'
    })));
    
    return <div class="ProseMirrorMenu">{itemsArray}</div>;
  }

  items() {
    const items = new ItemList();
    const state = this.attrs.state;
    const modifierKey = this.modifierKey;
    
    console.log('[ProseMirror] Building menu items, state:', state);
    
    // Get schema safely
    const schema = state.getSchema();
    console.log('[ProseMirror] Schema:', schema);
    
    if (!schema) {
      console.log('[ProseMirror] No schema available, returning empty items');
      // If schema is not available yet, return empty items
      return items;
    }

    console.log('[DEBUG] ProseMirrorMenu building individual items...');
    
    // Text type dropdown
    console.log('[DEBUG] Adding text_type dropdown');
    items.add(
      'text_type',
      NodeTypeDropdown.component({
        type: 'text_type',
        tooltip: app.translator.trans('askvortsov-rich-text.lib.composer.text_type_tooltip'),
        state: state,
        options: [
          {
            title: 'H1',
            type: schema.nodes.heading,
            attrs: { level: 1 },
            tooltip: app.translator.trans('askvortsov-rich-text.lib.composer.header_tooltip', { modifierKey, level: 1 }),
          },
          {
            title: 'H2',
            type: schema.nodes.heading,
            attrs: { level: 2 },
            tooltip: app.translator.trans('askvortsov-rich-text.lib.composer.header_tooltip', { modifierKey, level: 2 }),
          },
          {
            title: 'H3',
            type: schema.nodes.heading,
            attrs: { level: 3 },
            tooltip: app.translator.trans('askvortsov-rich-text.lib.composer.header_tooltip', { modifierKey, level: 3 }),
          },
          {
            title: 'H4',
            type: schema.nodes.heading,
            attrs: { level: 4 },
            tooltip: app.translator.trans('askvortsov-rich-text.lib.composer.header_tooltip', { modifierKey, level: 4 }),
          },
          {
            title: 'H5',
            type: schema.nodes.heading,
            attrs: { level: 5 },
            tooltip: app.translator.trans('askvortsov-rich-text.lib.composer.header_tooltip', { modifierKey, level: 5 }),
          },
          {
            title: 'H6',
            type: schema.nodes.heading,
            attrs: { level: 6 },
            tooltip: app.translator.trans('askvortsov-rich-text.lib.composer.header_tooltip', { modifierKey, level: 6 }),
          },
          {
            title: 'P',
            type: schema.nodes.paragraph,
            tooltip: app.translator.trans('askvortsov-rich-text.lib.composer.paragraph_tooltip', { modifierKey }),
          },
        ],
      }),
      100
    );
    console.log('[DEBUG] Added text_type, current items:', items.toArray().length);

    // Bold button
    console.log('[DEBUG] Adding bold button');
    const boldButton = MarkButton.component({
      type: 'bold',
      icon: 'fas fa-bold',
      tooltip: app.translator.trans('askvortsov-rich-text.lib.composer.bold_tooltip', { modifierKey }),
      state: state,
      mark: schema.marks.strong,
    });
    console.log('[DEBUG] Bold button created:', boldButton);
    items.add('bold', boldButton, 90);
    console.log('[DEBUG] Added bold, current items:', items.toArray().length);

    items.add(
      'italic',
      MarkButton.component({
        type: 'italic',
        icon: 'fas fa-italic',
        tooltip: app.translator.trans('askvortsov-rich-text.lib.composer.italic_tooltip', { modifierKey }),
        state: state,
        mark: schema.marks.em,
      }),
      80
    );

    items.add(
      'code',
      MarkButton.component({
        type: 'code',
        icon: 'fas fa-code',
        tooltip: app.translator.trans('askvortsov-rich-text.lib.composer.code_tooltip', { modifierKey }),
        state: state,
        mark: schema.marks.code,
      }),
      70
    );

    items.add(
      'quote',
      CommandButton.component({
        type: 'quote',
        icon: 'fas fa-quote-left',
        tooltip: app.translator.trans('askvortsov-rich-text.lib.composer.quote_tooltip', { modifierKey }),
        state: state,
        command: wrapIn(schema.nodes.blockquote),
      }),
      60
    );

    items.add(
      'link',
      InsertLinkDropdown.component({
        type: 'link',
        icon: 'fas fa-link',
        tooltip: app.translator.trans('askvortsov-rich-text.lib.composer.link_tooltip'),
        state: state,
        mark: schema.marks.link,
      }),
      50
    );

    items.add(
      'image',
      InsertImageDropdown.component({
        type: 'image',
        icon: 'fas fa-image',
        tooltip: app.translator.trans('askvortsov-rich-text.lib.composer.image_tooltip'),
        state: state,
        node: schema.nodes.image,
      }),
      40
    );

    console.log('[DEBUG] Adding GIF picker button');
    const gifButton = <Button
      className="Button Button--icon Button--link"
      icon="fas fa-icons"
      onclick={() => {
        import('../../forum/components/GifPickerModal').then(({ default: GifPickerModal }) => {
          app.modal.show(GifPickerModal, {
            onSelect: (url) => {
              console.log('[GIF Picker] Attempting to insert GIF as image:', url);
              
              // Get the editor view from the menu state
              const editorView = state.editorView;
              console.log('[GIF Picker] Editor view:', editorView);
              
              if (editorView && editorView.state && editorView.dispatch) {
                try {
                  // Get current selection
                  const { from, to } = editorView.state.selection;
                  console.log('[GIF Picker] Current selection:', { from, to });
                  
                  // Verify schema has image node
                  if (!schema.nodes.image) {
                    console.error('[GIF Picker] Schema does not have image node');
                    throw new Error('Image node not available in schema');
                  }
                  
                  // Create an image node instead of plain text
                  const imageNode = schema.nodes.image.create({
                    src: url,
                    alt: 'GIF',
                    title: 'Animated GIF'
                  });
                  
                  console.log('[GIF Picker] Created image node:', imageNode);
                  
                  // Create transaction to insert the image node
                  const transaction = editorView.state.tr
                    .replaceRangeWith(from, to, imageNode)
                    .scrollIntoView();
                  
                  console.log('[GIF Picker] Created transaction:', transaction);
                  
                  // Dispatch the transaction
                  editorView.dispatch(transaction);
                  
                  // Focus the editor
                  editorView.focus();
                  
                  console.log('[GIF Picker] GIF image inserted successfully');
                  
                  // Modal will close itself via this.hide()
                  
                } catch (error) {
                  console.error('[GIF Picker] Error inserting GIF as image:', error);
                  console.log('[GIF Picker] Falling back to text insertion');
                  
                  // Fallback to text insertion if image insertion fails
                  try {
                    const { from, to } = editorView.state.selection;
                    const transaction = editorView.state.tr
                      .insertText(url + '\n', from, to)
                      .scrollIntoView();
                    editorView.dispatch(transaction);
                    editorView.focus();
                    console.log('[GIF Picker] GIF URL inserted as text (fallback)');
                    
                    // Modal will close itself via this.hide()
                    
                  } catch (fallbackError) {
                    console.error('[GIF Picker] Fallback text insertion also failed:', fallbackError);
                    // Modal will close itself via this.hide()
                  }
                }
              } else {
                console.error('[GIF Picker] Editor view not available:', {
                  state: state,
                  editorView: editorView,
                  hasState: editorView && editorView.state,
                  hasDispatch: editorView && editorView.dispatch
                });
                
                // Modal will close itself via this.hide()
              }
            }
          });
        }).catch(e => {
          console.error('Failed to load GIF picker:', e);
        });
      }}
      title="Insert a GIF"
    />;
    console.log('[DEBUG] GIF button created:', gifButton);
    items.add('gif_picker', gifButton, 35);
    console.log('[DEBUG] Added GIF picker, current items:', items.toArray().length);

    // Add mentions button inline if available
    if (typeof app !== 'undefined' && app.forum && app.forum.attribute('flarum-mentions.enabled')) {
      console.log('[DEBUG] Adding mentions button inline');
      items.add('mentions_inline', 
        <Button
          className="Button Button--icon Button--link"
          icon="fas fa-at"
          onclick={() => {
            // Try to trigger mentions functionality
            const composer = app.composer;
            if (composer && composer.editor) {
              composer.editor.insertAtCursor('@');
            }
          }}
          title="Mention someone"
        />, 34);
    }

    // Add emoji button inline if available  
    if (typeof app !== 'undefined' && app.forum && app.forum.attribute('flarum-emoji.enabled')) {
      console.log('[DEBUG] Adding emoji button inline');
      items.add('emoji_inline',
        <Button
          className="Button Button--icon Button--link"
          icon="far fa-grin"
          onclick={() => {
            // Try to show emoji picker or insert basic emoji
            const composer = app.composer;
            if (composer && composer.editor) {
              composer.editor.insertAtCursor('😊 ');
            }
          }}
          title="Insert emoji"
        />, 33);
    }

    items.add(
      'unordered_list',
      ListButton.component({
        type: 'unordered_list',
        icon: 'fas fa-list-ul',
        tooltip: app.translator.trans('askvortsov-rich-text.lib.composer.unordered_list_tooltip', { modifierKey }),
        state: state,
        listType: schema.nodes.bullet_list,
      }),
      30
    );

    items.add(
      'ordered_list',
      ListButton.component({
        type: 'ordered_list',
        icon: 'fas fa-list-ol',
        tooltip: app.translator.trans('askvortsov-rich-text.lib.composer.ordered_list_tooltip', { modifierKey }),
        state: state,
        listType: schema.nodes.ordered_list,
      }),
      20
    );

    items.add(
      'additional_items',
      HiddenItemsDropdown.component({
        type: 'additional_items',
        icon: 'fas fa-plus',
        tooltip: app.translator.trans('askvortsov-rich-text.lib.composer.additional_items_tooltip'),
        state: state,
        buttons: this.hiddenItems().toArray(),
      })
    );

    return items;
  }

  hiddenItems() {
    const items = new ItemList();
    const state = this.attrs.state;
    const modifierKey = this.modifierKey;
    
    // Get schema safely
    const schema = state.getSchema();
    if (!schema) {
      // If schema is not available yet, return empty items
      return items;
    }

    items.add(
      'strike',
      MarkButton.component({
        type: 'strike',
        icon: 'fas fa-strikethrough',
        tooltip: app.translator.trans('askvortsov-rich-text.lib.composer.strike_tooltip'),
        state: state,
        mark: schema.marks.strike,
      })
    );

    items.add(
      'sub',
      MarkButton.component({
        type: 'sub',
        icon: 'fas fa-subscript',
        tooltip: app.translator.trans('askvortsov-rich-text.lib.composer.sub_tooltip', { modifierKey }),
        state: state,
        mark: schema.marks.sub,
      })
    );

    items.add(
      'sup',
      MarkButton.component({
        type: 'sup',
        icon: 'fas fa-superscript',
        tooltip: app.translator.trans('askvortsov-rich-text.lib.composer.sup_tooltip', { modifierKey }),
        state: state,
        mark: schema.marks.sup,
      })
    );

    items.add(
      'spoiler_inline',
      MarkButton.component({
        type: 'spoiler_inline',
        icon: 'fas fa-eye-slash',
        tooltip: app.translator.trans('askvortsov-rich-text.lib.composer.spoiler_inline_tooltip', { modifierKey }),
        state: state,
        mark: schema.marks.spoiler_inline,
      })
    );

    items.add(
      'code_block',
      CommandButton.component({
        type: 'code_block',
        icon: 'fas fa-terminal',
        tooltip: app.translator.trans('askvortsov-rich-text.lib.composer.code_block_tooltip', { modifierKey }),
        state: state,
        command: toggleBlockType(schema.nodes.code_block, schema.nodes.paragraph),
      })
    );

    items.add(
      'spoiler_block',
      CommandButton.component({
        type: 'spoiler_block',
        icon: 'fas fa-caret-square-right',
        tooltip: app.translator.trans('askvortsov-rich-text.lib.composer.spoiler_block_tooltip', { modifierKey }),
        state: state,
        command: toggleWrap(schema.nodes.spoiler),
      })
    );

    items.add(
      'horizontal_rule',
      CommandButton.component({
        type: 'horizontal_rule',
        icon: 'fas fa-minus',
        tooltip: app.translator.trans('askvortsov-rich-text.lib.composer.horizontal_rule_tooltip'),
        state: state,
        command: insertHr(schema.nodes.horizontal_rule),
      })
    );

    return items;
  }
}

import { extend } from 'flarum/common/extend';
import app from 'flarum/forum/app';
import TextEditor from 'flarum/common/components/TextEditor';
import ComposerBody from 'flarum/forum/components/ComposerBody';
import GifPickerButton from './components/GifPickerButton';
import GifPreview from './components/GifPreview';
import GlobalGif from '../common/models/GlobalGif';
import PersonalGif from '../common/models/PersonalGif';
import applyEditor from '../common/applyEditor';
import addPreferences from './addPreferences';
import GifContextMenu from './components/GifContextMenu';

app.initializers.add('fw27-gif-pocket', () => {
  console.log('[fw27/gif-pocket] Forum initializer started');
  
  app.store.models['global-gifs'] = GlobalGif;
  app.store.models['personal-gifs'] = PersonalGif;
  
  console.log('[fw27/gif-pocket] Models registered');

  // Apply rich text editor functionality
  addPreferences();
  applyEditor();

  // Add GIF picker button to text editor toolbar (for non-rich text mode)
  extend(TextEditor.prototype, 'toolbarItems', function (items) {
    console.log('[DEBUG] Forum index.tsx - Adding GIF picker, rich text enabled:', app.session.user?.preferences?.()?.useRichTextEditor);
    console.log('[DEBUG] Forum index.tsx - Composer:', (this as any).attrs.composer);
    console.log('[DEBUG] Forum index.tsx - Items before:', items.toArray().map(item => item && item.key));
    
    // Check if this is a composer text editor
    if (!(this as any).attrs.composer) {
      console.log('[DEBUG] Forum index.tsx - Not a composer text editor, skipping');
      return;
    }
    
    // Only add for non-rich text editor mode (when ProseMirror is not active)
    if (app.session.user?.preferences?.()?.useRichTextEditor) {
      console.log('[DEBUG] Forum index.tsx - Rich text enabled, skipping GIF picker (should be in ProseMirror menu)');
      return;
    }
    
    // Check if button already exists to prevent duplicates
    if (items.toArray().some(item => item && item.key === 'fw27-gif-pocket')) {
      console.log('[DEBUG] Forum index.tsx - GIF picker already exists, skipping');
      return;
    }
    
    console.log('[DEBUG] Forum index.tsx - Adding GIF picker button');
    items.add(
      'fw27-gif-pocket',
      <GifPickerButton composer={(this as any).attrs.composer} />
    );
    
    console.log('[DEBUG] Forum index.tsx - Items after:', items.toArray().map(item => item && item.key));
  });

  // Add support for rich text editor (ProseMirror) if available
  // This will be handled by the GifPickerButton component itself
  // when it detects rich text mode is active

  // Add enhanced GIF preview to ComposerBody instead of TextEditor
  extend(ComposerBody.prototype, 'view', function (vnode) {
    const content = vnode.children;
    
    if (Array.isArray(content) && this.composer && this.composer.fields && this.composer.fields.content) {
      // Add our enhanced GIF preview after the main content
      content.push(
        <GifPreview text={this.composer.fields.content()} />
      );
    }
    
    return vnode;
  });
  
  // Add GIF context menu functionality
  setupGifContextMenu();
  
  console.log('[fw27/gif-pocket] Forum initialization complete');
});

// Function to set up GIF context menu
function setupGifContextMenu() {
  let contextMenu: any = null;
  let isMenuOpen = false;
  
  // Function to close any open context menu
  function closeContextMenu() {
    if (contextMenu) {
      try {
        // Unmount the component
        m.mount(contextMenu, null);
        // Remove the container from DOM
        if (contextMenu.parentNode) {
          contextMenu.parentNode.removeChild(contextMenu);
        }
        console.log('[GIF Context] Context menu closed and removed');
      } catch (error) {
        console.error('[GIF Context] Error closing menu:', error);
      }
      contextMenu = null;
      isMenuOpen = false;
    }
  }
  
  // Close menu when clicking elsewhere
  document.addEventListener('click', closeContextMenu);
  
  // Function to check if an image is a GIF
  function isGifImage(img: HTMLImageElement): boolean {
    const src = img.src.toLowerCase();
    return (
      src.includes('.gif') ||
      src.includes('giphy.com') ||
      src.includes('tenor.com') ||
      src.includes('imgur.com')
    );
  }
  
  // Add context menu to all GIF images
  function attachContextMenuToGifs() {
    const images = document.querySelectorAll('img');
    
    images.forEach((img: HTMLImageElement) => {
      if (isGifImage(img) && !img.hasAttribute('data-gif-context-attached')) {
        img.setAttribute('data-gif-context-attached', 'true');
        
        img.addEventListener('click', (e: MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          
          console.log('[GIF Context] Click on GIF:', img.src);
          
          // Prevent menu spam - close any existing menu first
          if (isMenuOpen) {
            closeContextMenu();
            return;
          }
          
          // Create new context menu
          const menuComponent = {
            view: () => m(GifContextMenu, {
              gifUrl: img.src,
              x: e.clientX,
              y: e.clientY,
              onClose: closeContextMenu
            })
          };
          
          // Mount the context menu
          const menuContainer = document.createElement('div');
          document.body.appendChild(menuContainer);
          m.mount(menuContainer, menuComponent);
          
          contextMenu = menuContainer;
          isMenuOpen = true;
          
          console.log('[GIF Context] Context menu opened');
        });
        
        console.log('[GIF Context] Attached context menu to GIF:', img.src);
      }
    });
  }
  
  // Initial attachment
  attachContextMenuToGifs();
  
  // Re-attach when new content is loaded (for infinite scroll, etc.)
  const observer = new MutationObserver(() => {
    setTimeout(attachContextMenuToGifs, 100);
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  console.log('[GIF Context] Context menu system initialized');
}
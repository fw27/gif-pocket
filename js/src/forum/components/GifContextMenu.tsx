import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import app from 'flarum/forum/app';
import type Mithril from 'mithril';

interface IGifContextMenuAttrs {
  gifUrl: string;
  x: number;
  y: number;
  onClose: () => void;
}

export default class GifContextMenu extends Component<IGifContextMenuAttrs> {
  view(vnode: Mithril.Vnode<IGifContextMenuAttrs, this>) {
    const { gifUrl, x, y, onClose } = this.attrs;

    return (
      <div 
        className="GifContextMenu"
        style={{
          position: 'fixed',
          left: `${x}px`,
          top: `${y}px`,
          zIndex: 1000,
          backgroundColor: 'var(--body-bg)',
          border: '1px solid var(--control-bg)',
          borderRadius: '6px',
          padding: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          minWidth: '150px'
        }}
        onclick={(e: Event) => e.stopPropagation()}
      >
        <Button
          className="Button Button--block"
          icon="fas fa-reply"
          onclick={() => {
            this.repostGif(gifUrl);
            // Small delay to ensure repost completes before closing
            setTimeout(() => onClose(), 50);
          }}
        >
          Repostar
        </Button>
        
        <Button
          className="Button Button--block"
          icon="fas fa-copy"
          onclick={() => {
            this.copyGifUrl(gifUrl);
            // Small delay to show the success message before closing
            setTimeout(() => onClose(), 100);
          }}
        >
          Copiar Gif
        </Button>
      </div>
    );
  }

  repostGif(gifUrl: string) {
    console.log('[GIF Context] Reposting GIF:', gifUrl);
    
    try {
      // Get the composer
      const composer = (app as any).composer;
      
      // Function to insert the GIF
      const insertGif = () => {
        const editor = composer?.editor;
        if (editor) {
          // Check if this is a ProseMirror editor (has view property)
          if ((editor as any).view && (editor as any).view.state && (editor as any).view.dispatch) {
            // ProseMirror editor - insert as image node
            try {
              const view = (editor as any).view;
              const schema = view.state.schema;
              
              if (schema.nodes.image) {
                const imageNode = schema.nodes.image.create({
                  src: gifUrl,
                  alt: 'GIF',
                  title: 'Reposted GIF'
                });
                
                const { from, to } = view.state.selection;
                const transaction = view.state.tr
                  .replaceRangeWith(from, to, imageNode)
                  .scrollIntoView();
                
                view.dispatch(transaction);
                view.focus();
                
                console.log('[GIF Context] GIF inserted as image node into ProseMirror editor');
                return;
              }
            } catch (error) {
              console.error('[GIF Context] Error inserting into ProseMirror:', error);
            }
          }
          
          // Fallback: insert URL and let the paste plugin handle conversion
          if (editor.insertAtCursor) {
            editor.insertAtCursor(gifUrl + '\n', true);
            console.log('[GIF Context] GIF URL inserted, should be auto-converted by paste plugin');
          }
        }
      };
      
      // Check if composer is open
      if (!composer || !composer.isVisible()) {
        console.log('[GIF Context] Composer not open, opening composer first');
        
        // Try different methods to open the composer
        try {
          // Check current path to determine composer type  
          const currentPath = window.location.pathname;
          console.log('[GIF Context] Current path:', currentPath);
          
          // Check if we're in a discussion (path contains /d/)
          const isInDiscussion = currentPath.includes('/d/');
          
          if (!isInDiscussion) {
            // We're on the index page or similar, can start a new discussion
            console.log('[GIF Context] Opening new discussion composer');
            
            // Import and load DiscussionComposer
            import('flarum/forum/components/DiscussionComposer').then(({ default: DiscussionComposer }) => {
              composer.load(DiscussionComposer, {
                user: app.session.user,
              });
              
              // Wait for composer to be ready
              setTimeout(() => {
                console.log('[GIF Context] Discussion composer opened, inserting GIF');
                insertGif();
              }, 500);
            }).catch((error) => {
              console.error('[GIF Context] Failed to load DiscussionComposer:', error);
              this.tryComposerFallback(insertGif);
            });
          } else {
            // We're likely in a discussion, try to load reply composer
            console.log('[GIF Context] Trying to open reply composer');
            
            // Try to find discussion data safely
            let discussion = null;
            
            // Method 1: Try app.current.data.discussion
            if (app.current && app.current.data && app.current.data.discussion) {
              discussion = app.current.data.discussion;
            }
            // Method 2: Try alternative path
            else if ((app as any).current && (app as any).current.discussion) {
              discussion = (app as any).current.discussion;
            }
            
            if (discussion) {
              import('flarum/forum/components/ReplyComposer').then(({ default: ReplyComposer }) => {
                composer.load(ReplyComposer, {
                  user: app.session.user,
                  discussion: discussion,
                });
                
                setTimeout(() => {
                  console.log('[GIF Context] Reply composer opened, inserting GIF');
                  insertGif();
                }, 500);
              }).catch((error) => {
                console.error('[GIF Context] Failed to load ReplyComposer:', error);
                this.tryComposerFallback(insertGif);
              });
            } else {
              console.log('[GIF Context] No discussion found, using fallback');
              this.tryComposerFallback(insertGif);
            }
          }
        } catch (error) {
          console.error('[GIF Context] Error determining composer type:', error);
          this.tryComposerFallback(insertGif);
        }
      } else {
        console.log('[GIF Context] Composer already open, inserting GIF directly');
        // Composer is already open, insert immediately
        setTimeout(() => {
          insertGif();
        }, 50);
      }
      
    } catch (error) {
      console.error('[GIF Context] Error reposting GIF:', error);
      alert('Error al repostar el GIF');
    }
  }

  tryComposerFallback(insertGif: () => void) {
    console.log('[GIF Context] Using fallback composer opening method');
    
    // Try to trigger composer show directly
    try {
      const composer = (app as any).composer;
      if (composer && composer.show) {
        composer.show();
        setTimeout(() => {
          insertGif();
        }, 500);
      } else {
        console.error('[GIF Context] No fallback method available');
        alert('No se pudo abrir el compositor. Por favor, abre el compositor manualmente e inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('[GIF Context] Fallback failed:', error);
      alert('No se pudo abrir el compositor. Por favor, abre el compositor manualmente e inténtalo de nuevo.');
    }
  }

  copyGifUrl(gifUrl: string) {
    console.log('[GIF Context] Copying GIF URL:', gifUrl);
    
    try {
      // Use the Clipboard API if available
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(gifUrl).then(() => {
          console.log('[GIF Context] GIF URL copied to clipboard');
          // Show success message
          (app as any).alerts?.show({ type: 'success' }, 'URL del GIF copiada al portapapeles');
        }).catch((error) => {
          console.error('[GIF Context] Failed to copy with Clipboard API:', error);
          this.fallbackCopy(gifUrl);
        });
      } else {
        // Fallback for older browsers
        this.fallbackCopy(gifUrl);
      }
    } catch (error) {
      console.error('[GIF Context] Error copying GIF URL:', error);
      alert('Error al copiar la URL del GIF');
    }
  }

  fallbackCopy(text: string) {
    try {
      // Create temporary textarea
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        console.log('[GIF Context] GIF URL copied using fallback method');
        (app as any).alerts?.show({ type: 'success' }, 'URL do GIF copiada com sucesso!');
      } else {
        throw new Error('execCommand failed');
      }
    } catch (error) {
      console.error('[GIF Context] Fallback copy failed:', error);
      alert('Error ao copiar a URL do GIF');
    }
  }
}
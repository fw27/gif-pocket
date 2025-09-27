import { Plugin } from 'prosemirror-state';

// Helper function to detect if a URL is a GIF
function isGifUrl(url) {
  if (!url || typeof url !== 'string') return false;
  
  // Clean the URL
  const cleanUrl = url.trim().toLowerCase();
  
  // Check for common GIF URL patterns
  return (
    cleanUrl.endsWith('.gif') ||
    cleanUrl.includes('.gif?') ||
    cleanUrl.includes('.gif#') ||
    cleanUrl.includes('giphy.com') ||
    cleanUrl.includes('tenor.com') ||
    cleanUrl.includes('imgur.com') && cleanUrl.includes('.gif')
  );
}

export default function gifUrlPastePlugin(schema) {
  return new Plugin({
    props: {
      handlePaste(view, event, slice) {
        console.log('[GIF Paste] Paste event detected');
        
        // Get the pasted text
        const clipboardData = event.clipboardData;
        if (!clipboardData) {
          console.log('[GIF Paste] No clipboard data');
          return false;
        }
        
        const pastedText = clipboardData.getData('text/plain');
        console.log('[GIF Paste] Pasted text:', pastedText);
        
        // Check if the pasted text is a GIF URL
        if (!isGifUrl(pastedText)) {
          console.log('[GIF Paste] Not a GIF URL, allowing default paste');
          return false; // Let default paste handling take over
        }
        
        console.log('[GIF Paste] Detected GIF URL, converting to image node');
        
        // Verify schema has image node
        if (!schema.nodes.image) {
          console.error('[GIF Paste] Schema does not have image node');
          return false;
        }
        
        try {
          // Create an image node for the GIF
          const imageNode = schema.nodes.image.create({
            src: pastedText.trim(),
            alt: 'GIF',
            title: 'Animated GIF'
          });
          
          console.log('[GIF Paste] Created image node:', imageNode);
          
          // Get current selection
          const { from, to } = view.state.selection;
          
          // Create transaction to insert the image node
          const transaction = view.state.tr
            .replaceRangeWith(from, to, imageNode)
            .scrollIntoView();
          
          console.log('[GIF Paste] Created transaction:', transaction);
          
          // Dispatch the transaction
          view.dispatch(transaction);
          
          console.log('[GIF Paste] GIF image inserted successfully');
          
          // Prevent default paste behavior
          return true;
        } catch (error) {
          console.error('[GIF Paste] Error converting GIF URL to image:', error);
          return false; // Fall back to default paste
        }
      }
    }
  });
}
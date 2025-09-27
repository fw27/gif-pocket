import { Plugin } from 'prosemirror-state';

// Cache for GIFs to avoid repeated API calls
let gifCache = {
  global: [],
  personal: [],
  lastUpdate: 0,
  cacheTimeout: 5 * 60 * 1000 // 5 minutes
};

// Helper function to load GIFs from API
async function loadGifs() {
  const now = Date.now();
  if (now - gifCache.lastUpdate < gifCache.cacheTimeout && gifCache.global.length > 0) {
    return gifCache;
  }

  try {
    // Load global GIFs
    const globalResponse = await app.request({
      method: 'GET',
      url: app.forum.attribute('apiUrl') + '/global-gifs'
    });
    
    // Load personal GIFs
    const personalResponse = await app.request({
      method: 'GET',
      url: app.forum.attribute('apiUrl') + '/personal-gifs'
    });

    gifCache.global = globalResponse.data.map(item => app.store.pushPayload({ data: item })).filter(gif => gif);
    gifCache.personal = personalResponse.data.map(item => app.store.pushPayload({ data: item })).filter(gif => gif);
    gifCache.lastUpdate = now;

    console.log('[GIF Title] Cache updated:', gifCache);
    return gifCache;
  } catch (error) {
    console.error('[GIF Title] Failed to load GIFs:', error);
    return gifCache;
  }
}

// Helper function to find GIF by title
function findGifByTitle(title, gifs) {
  if (!title || !gifs) return null;
  
  const searchTitle = title.toLowerCase().trim();
  console.log('[GIF Title] Searching for:', searchTitle);
  
  // Search in both global and personal GIFs
  const allGifs = [...gifs.global, ...gifs.personal];
  
  for (const gif of allGifs) {
    if (gif && gif.title) {
      const gifTitle = String(gif.title()).toLowerCase().trim();
      console.log('[GIF Title] Comparing with:', gifTitle);
      
      if (gifTitle === searchTitle || gifTitle.includes(searchTitle)) {
        console.log('[GIF Title] Found matching GIF:', gif);
        return gif;
      }
    }
  }
  
  console.log('[GIF Title] No matching GIF found');
  return null;
}

export default function gifTitlePlugin(schema) {
  return new Plugin({
    props: {
      handleTextInput(view, from, to, text) {
        // Check if the typed text completes a :title: pattern
        if (text === ':') {
          const doc = view.state.doc;
          const $from = doc.resolve(from);
          
          // Get text before cursor
          const textBefore = $from.parent.textBetween(
            Math.max(0, $from.parentOffset - 20),
            $from.parentOffset,
            null,
            '\ufffc'
          );
          
          // Look for pattern like ":something" at the end
          const match = textBefore.match(/:([a-zA-Z0-9_\-\s]+)$/);
          
          if (match && match[1]) {
            const title = match[1];
            const startPos = from - match[1].length - 1; // -1 for the first :
            
            console.log('[GIF Title] Detected complete pattern:', title);
            
            // Load GIFs and check for match
            loadGifs().then(gifs => {
              const gif = findGifByTitle(title, gifs);
              if (gif && gif.url) {
                const gifUrl = String(gif.url());
                console.log('[GIF Title] Found GIF, replacing text with image');
                
                try {
                  // Create image node
                  const imageNode = schema.nodes.image.create({
                    src: gifUrl,
                    alt: title,
                    title: `GIF: ${title}`
                  });
                  
                  // Replace the :title: with the image
                  const transaction = view.state.tr
                    .replaceRangeWith(startPos, to + 1, imageNode)
                    .scrollIntoView();
                  
                  view.dispatch(transaction);
                  console.log('[GIF Title] GIF inserted successfully');
                } catch (error) {
                  console.error('[GIF Title] Error inserting GIF:', error);
                }
              } else {
                console.log('[GIF Title] No GIF found for title:', title);
              }
            }).catch(error => {
              console.error('[GIF Title] Error loading GIFs:', error);
            });
          }
        }
        
        // Return false to allow normal text input
        return false;
      }
    }
  });
}
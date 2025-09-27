import Component from 'flarum/common/Component';
import type Mithril from 'mithril';

interface IGifPreviewAttrs {
  text: string;
}

export default class GifPreview extends Component<IGifPreviewAttrs> {
  view() {
    const { text } = this.attrs;
    
    // Find GIF URLs in the text (HTTP/HTTPS URLs ending in gif or common GIF hosting patterns)
    const gifUrls = text.match(/https?:\/\/[^\s]+(?:\.gif|giphy\.com\/media\/[^\/]+\/[^\s]*|imgur\.com\/[^\s]*|tenor\.com\/[^\s]*)(?:\?[^\s]*)?/gi) || [];
    
    if (gifUrls.length === 0) {
      return null;
    }
    
    return (
      <div className="GifPreview">
        <div className="GifPreview-label">
          <i className="fas fa-eye"></i> GIF Preview:
        </div>
        <div className="GifPreview-grid">
          {gifUrls.map((url, index) => (
            <div key={index} className="GifPreview-item">
              <img 
                src={url} 
                alt="GIF Preview" 
                className="GifPreview-thumbnail"
                loading="lazy"
                onload={(e: Event) => {
                  const img = e.target as HTMLImageElement;
                  img.classList.add('loaded');
                }}
                onerror={(e: Event) => {
                  const img = e.target as HTMLImageElement;
                  img.style.display = 'none';
                }}
              />
              <div className="GifPreview-url">{url.length > 40 ? url.substring(0, 40) + '...' : url}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}
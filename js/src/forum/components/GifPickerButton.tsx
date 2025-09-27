import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import GifPickerModal from './GifPickerModal';

interface IGifPickerButtonAttrs {
  composer?: any;
  onGifSelect?: (url: string) => void;
}

const TOOLTIP_TEXT = 'GIF Pocket';

export default class GifPickerButton extends Component<IGifPickerButtonAttrs> {
  view() {
    console.debug('[fw-ext/gif-picker] Rendering GIF Pocket button with tooltip', {
      tooltip: TOOLTIP_TEXT,
    });

    return (
      <Button
        className="Button Button--icon Button--link fw-ext-gif-picker"
        icon="fas fa-icons"
        onclick={() => this.openGifPicker()}
        title={TOOLTIP_TEXT}
        aria-label={TOOLTIP_TEXT}
      >
        <span
          className="Button-label"
          title=""
          aria-label={TOOLTIP_TEXT}
          data-original-title={TOOLTIP_TEXT}
        >
          <i className="icon fas fa-icons" aria-hidden="true"></i>
        </span>
        <div className="GifPickerButton-tooltip" role="status" aria-hidden="true">
          {TOOLTIP_TEXT}
        </div>
      </Button>
    );
  }

  openGifPicker() {
    console.debug('[fw-ext/gif-picker] Opening GIF picker modal from toolbar');

    const { composer, onGifSelect } = this.attrs;

    app.modal.show(GifPickerModal, {
      onSelect: (url: string) => {
        if (typeof onGifSelect === 'function') {
          onGifSelect(url);
        }

        if (composer && composer.editor) {
          const editor = composer.editor;

          if (typeof editor.insertText === 'function') {
            editor.insertText(url);
          } else if (typeof editor.insertAtCursor === 'function') {
            editor.insertAtCursor(url);
          }
        }

        app.modal.close();
      },
    });
  }
}

import app from 'flarum/forum/app';
import Modal, { IInternalModalAttrs } from 'flarum/common/components/Modal';
import Button from 'flarum/common/components/Button';
import Stream from 'flarum/common/utils/Stream';
import GlobalGif from '../../common/models/GlobalGif';
import PersonalGif from '../../common/models/PersonalGif';
import type Mithril from 'mithril';

declare global {
  interface Window {
    m: Mithril.Static;
  }
}

const m = window.m;

type GifCategoryOption = {
  value: string;
  label: string;
};

interface IGifPickerModalAttrs extends IInternalModalAttrs {
  onSelect: (url: string) => void;
}

const ALL_CATEGORIES_VALUE = '__all__';
const UNCATEGORIZED_VALUE = '__uncategorized__';

export default class GifPickerModal extends Modal<IGifPickerModalAttrs> {
  globalGifs!: GlobalGif[];
  personalGifs!: PersonalGif[];
  activeTab!: 'global' | 'personal';
  newPersonalGif!: { title: Stream<string>; url: Stream<string>; category: Stream<string> };
  editingGif!: any | null;
  loading: boolean = false;
  globalCategoryFilter!: Stream<string>;
  personalCategoryFilter!: Stream<string>;

  oninit(vnode: Mithril.Vnode<IGifPickerModalAttrs, this>) {
    super.oninit(vnode);
    this.globalGifs = [];
    this.personalGifs = [];
    this.activeTab = 'global';
    this.newPersonalGif = {
      title: Stream(''),
      url: Stream(''),
      category: Stream(''),
    };
    this.editingGif = null;
    this.loading = false;
    this.globalCategoryFilter = Stream(ALL_CATEGORIES_VALUE);
    this.personalCategoryFilter = Stream(ALL_CATEGORIES_VALUE);
    this.loadGifs();
  }

  className() {
    return 'GifPickerModal';
  }

  title() {
    return String(app.translator.trans('fw27-gif-pocket.forum.gif_picker_modal.title'));
  }

  content() {
    return (
      <div className="Modal-body">
        <div className="Tabs">
          <Button
            className={`TabButton ${this.activeTab === 'global' ? 'active' : ''}`}
            onclick={() => this.switchTab('global')}
            aria-controls="global-gif-panel"
          >
            {String(app.translator.trans('fw27-gif-pocket.forum.gif_picker_modal.global_gifs_tab'))}
          </Button>
          <Button
            className={`TabButton ${this.activeTab === 'personal' ? 'active' : ''}`}
            onclick={() => this.switchTab('personal')}
            aria-controls="personal-gif-panel"
          >
            {String(app.translator.trans('fw27-gif-pocket.forum.gif_picker_modal.personal_gifs_tab'))}
          </Button>
        </div>
        <div className="TabContent">
          {this.activeTab === 'global' ? this.globalGifList() : this.personalGifManager()}
        </div>
      </div>
    );
  }

  globalGifList() {
    if (this.loading && !this.globalGifs.length) {
      return <div className="GifLoading">{String(app.translator.trans('fw27-gif-pocket.forum.gif_picker_modal.loading'))}</div>;
    }

    const gifs = this.globalGifs;

    return (
      <div id="global-gif-panel" className="GifPanel" role="tabpanel" aria-labelledby="global-gifs-tab">
        {this.renderCategoryFilters('global')}
        {gifs.length === 0 ? (
          this.renderEmptyState('global')
        ) : (
          <div className="GifList">
            {gifs.map((gif, index) => (
              <div key={index} className="GifItem">
                <img
                  src={String(gif.url())}
                  onclick={() => this.selectGif(String(gif.url()))}
                  alt={String(app.translator.trans('fw27-gif-pocket.forum.gif_picker_modal.image_alt_global'))}
                  className="GifThumbnail"
                  loading="lazy"
                />
                <div className="GifTitle">{gif.title ? String(gif.title()) : String(app.translator.trans('fw27-gif-pocket.forum.gif_picker_modal.form.untitled'))}</div>
                <div className="GifCategoryLabel">{this.getCategoryLabel(gif)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  personalGifManager() {
    if (this.loading && !this.personalGifs.length) {
      return <div className="GifLoading">{app.translator.trans('fw27-gif-pocket.forum.gif_picker_modal.loading')}</div>;
    }

    return (
      <div id="personal-gif-panel" className="PersonalGifManager" role="tabpanel" aria-labelledby="personal-gifs-tab">
        <div className="Form-group">
          <input
            className="FormControl"
            placeholder={String(app.translator.trans('fw27-gif-pocket.forum.gif_picker_modal.form.title_placeholder'))}
            value={this.newPersonalGif.title()}
            oninput={(e: Event) => this.newPersonalGif.title((e.target as HTMLInputElement).value)}
          />
          <input
            className="FormControl"
            placeholder={String(app.translator.trans('fw27-gif-pocket.forum.gif_picker_modal.form.category_placeholder'))}
            value={this.newPersonalGif.category()}
            oninput={(e: Event) => this.newPersonalGif.category((e.target as HTMLInputElement).value)}
          />
          <input
            className="FormControl"
            placeholder={String(app.translator.trans('fw27-gif-pocket.forum.gif_picker_modal.form.url_placeholder'))}
            value={this.newPersonalGif.url()}
            oninput={(e: Event) => this.newPersonalGif.url((e.target as HTMLInputElement).value)}
          />
          <div className="ButtonGroup">
            {this.editingGif ? (
              <>
                <Button
                  className="Button Button--primary"
                  onclick={() => this.updatePersonalGif()}
                  loading={this.loading}
                >
                  {String(app.translator.trans('fw27-gif-pocket.forum.gif_picker_modal.form.update_button'))}
                </Button>
                <Button
                  className="Button"
                  onclick={() => this.cancelEdit()}
                >
                  {String(app.translator.trans('fw27-gif-pocket.forum.gif_picker_modal.form.cancel_button'))}
                </Button>
              </>
            ) : (
              <Button
                className="Button Button--primary"
                onclick={() => this.addPersonalGif()}
                loading={this.loading}
              >
                {String(app.translator.trans('fw27-gif-pocket.forum.gif_picker_modal.form.add_button'))}
              </Button>
            )}
          </div>
        </div>
        {this.renderCategoryFilters('personal')}
        {this.personalGifs.length === 0 ? (
          this.renderEmptyState('personal')
        ) : (
          <div className="GifList">
            {this.personalGifs.map((gif, index) => (
              <div key={index} className="GifItem">
                <img
                  src={String(gif.url())}
                  onclick={() => this.selectGif(String(gif.url()))}
                  alt={String(app.translator.trans('fw27-gif-pocket.forum.gif_picker_modal.image_alt_personal'))}
                  className="GifThumbnail"
                  loading="lazy"
                />
                <div className="GifTitle">{gif.title ? String(gif.title()) : app.translator.trans('fw27-gif-pocket.forum.gif_picker_modal.form.untitled')}</div>
                <div className="GifCategoryLabel">{this.getCategoryLabel(gif)}</div>
                <div className="GifActions">
                  <Button
                    className="Button Button--icon Button--link"
                    icon="fas fa-edit"
                    onclick={() => this.editPersonalGif(gif)}
                    title={String(app.translator.trans('fw27-gif-pocket.forum.gif_picker_modal.actions.edit'))}
                  />
                  <Button
                    className="Button Button--icon Button--link Button--danger"
                    icon="fas fa-trash"
                    onclick={() => this.deletePersonalGif(String(gif.id() || ''))}
                    title={String(app.translator.trans('fw27-gif-pocket.forum.gif_picker_modal.actions.delete'))}
                    loading={this.loading}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  loadGifs() {
    this.loading = true;
    m.redraw();

    Promise.all([
      this.loadGlobalGifs(),
      this.loadPersonalGifs(),
    ])
      .then(([globalGifs, personalGifs]) => {
        this.globalGifs = globalGifs;
        this.personalGifs = personalGifs;
      })
      .finally(() => {
        this.loading = false;
        m.redraw();
      });
  }

  loadGlobalGifs() {
    const filter = this.globalCategoryFilter();

    return app
      .request({
        method: 'GET',
        url: app.forum.attribute('apiUrl') + '/global-gifs',
        params: this.buildCategoryFilterParams(filter),
      })
      .then((response: any) =>
        response.data
          .map((item: any) => app.store.pushPayload({ data: item }))
          .filter((gif: any) => gif)
      )
      .catch((error) => {
        console.error('Failed to load global gifs:', error);
        return [];
      });
  }

  loadPersonalGifs() {
    const filter = this.personalCategoryFilter();

    return app
      .request({
        method: 'GET',
        url: app.forum.attribute('apiUrl') + '/personal-gifs',
        params: this.buildCategoryFilterParams(filter),
      })
      .then((response: any) =>
        response.data
          .map((item: any) => app.store.pushPayload({ data: item }))
          .filter((gif: any) => gif)
      )
      .catch((error) => {
        console.error('Failed to load personal gifs:', error);
        return [];
      });
  }

  addPersonalGif() {
    if (!this.newPersonalGif.url()) {
      alert('Please enter a GIF URL');
      return;
    }

    this.loading = true;

    app.store
      .createRecord('personal-gifs')
      .save({
        title: this.newPersonalGif.title(),
        url: this.newPersonalGif.url(),
        category: this.normalizeCategory(this.newPersonalGif.category()),
      })
      .then(() => {
        this.newPersonalGif.title('');
        this.newPersonalGif.url('');
        this.newPersonalGif.category('');
        return this.loadPersonalGifs();
      })
      .then((personalGifs) => {
        this.personalGifs = personalGifs;
        m.redraw();
      })
      .catch((error) => {
        console.error('Failed to add personal gif:', error);
        alert('Failed to add GIF. Please try again.');
      })
      .finally(() => {
        this.loading = false;
      });
  }

  deletePersonalGif(id: string) {
    this.loading = true;

    // Use direct API call instead of store.find since DELETE method is not allowed on single resource endpoint
    app.request({
      method: 'DELETE',
      url: `${app.forum.attribute('apiUrl')}/personal-gifs/${id}`
    }).then(() => {
      this.loadPersonalGifs().then((personalGifs) => {
        this.personalGifs = personalGifs;
        m.redraw();
      });
    }).catch((error) => {
      console.error('Failed to delete personal gif:', error);
      alert('Failed to delete GIF. Please try again.');
    }).finally(() => {
      this.loading = false;
    });
  }

  editPersonalGif(gif: any) {
    this.editingGif = gif;
    this.newPersonalGif.title(String(gif.title ? gif.title() : ''));
    this.newPersonalGif.url(String(gif.url ? gif.url() : ''));
    this.newPersonalGif.category(String(gif.category ? gif.category() || '' : ''));
  }

  cancelEdit() {
    this.editingGif = null;
    this.newPersonalGif.title('');
    this.newPersonalGif.url('');
    this.newPersonalGif.category('');
  }

  updatePersonalGif() {
    if (!this.editingGif) return;
    
    this.loading = true;

    // Use Flarum's store approach for better compatibility
    const gif = this.editingGif;
    gif.save({
      title: this.newPersonalGif.title(),
      url: this.newPersonalGif.url(),
      category: this.normalizeCategory(this.newPersonalGif.category()),
    }).then(() => {
      console.log('[fw27/gif-pocket] Successfully updated personal GIF');
      this.cancelEdit();
      this.loadPersonalGifs().then((personalGifs) => {
        this.personalGifs = personalGifs;
        m.redraw();
      });
    }).catch((error: any) => {
      console.error('Failed to update personal gif with store approach, trying manual request:', error);
      
      // Fallback to manual request with different approach
      return app.request({
        url: `${app.forum.attribute('apiUrl')}/personal-gifs/${this.editingGif!.id()}`,
        method: 'PATCH', // Direct PATCH instead of POST with override
        body: {
          data: {
            type: 'personal-gifs',
            id: String(this.editingGif!.id()),
            attributes: {
              title: this.newPersonalGif.title(),
              url: this.newPersonalGif.url(),
              category: this.normalizeCategory(this.newPersonalGif.category()),
            }
          }
        }
      });
    }).then(() => {
      if (this.editingGif) { // Only if not already handled above
        console.log('[fw27/gif-pocket] Successfully updated personal GIF with manual request');
        this.cancelEdit();
        this.loadPersonalGifs().then((personalGifs) => {
          this.personalGifs = personalGifs;
          m.redraw();
        });
      }
    }).catch((error: any) => {
      console.error('Failed to update personal gif:', error);
      console.error('Error details:', error.responseText || error.response);
      
      // Try to extract specific error from response
      let errorMessage = 'Failed to update GIF. Please try again.';
      try {
        const errorData = error.responseText ? JSON.parse(error.responseText) : error.response;
        if (errorData && errorData.errors && errorData.errors[0] && errorData.errors[0].detail) {
          errorMessage = `Update failed: ${errorData.errors[0].detail}`;
        }
      } catch (e) {
        // Use default message
      }
      
      alert(errorMessage);
    }).finally(() => {
      this.loading = false;
    });
  }

  switchTab(tab: 'global' | 'personal') {
    this.activeTab = tab;
  }

  selectGif(url: string) {
    console.log('[GIF Modal] selectGif called with URL:', url);
    console.log('[GIF Modal] onSelect callback:', this.attrs.onSelect);
    this.attrs.onSelect(url);
    console.log('[GIF Modal] Hiding modal');
    this.hide();
  }

  buildCategoryFilterParams(filterValue: string) {
    if (!filterValue || filterValue === ALL_CATEGORIES_VALUE) {
      return {};
    }

    if (filterValue === UNCATEGORIZED_VALUE) {
      return { 'filter[category]': UNCATEGORIZED_VALUE };
    }

    return { 'filter[category]': filterValue };
  }

  onGlobalCategoryChange(value: string) {
    this.globalCategoryFilter(value);
    this.loading = true;
    m.redraw();

    this.loadGlobalGifs()
      .then((gifs) => {
        this.globalGifs = gifs;
      })
      .finally(() => {
        this.loading = false;
        m.redraw();
      });
  }

  onPersonalCategoryChange(value: string) {
    this.personalCategoryFilter(value);
    this.loading = true;
    m.redraw();

    this.loadPersonalGifs()
      .then((gifs) => {
        this.personalGifs = gifs;
      })
      .finally(() => {
        this.loading = false;
        m.redraw();
      });
  }

  renderCategoryFilters(type: 'global' | 'personal') {
    const activeFilter = type === 'global' ? this.globalCategoryFilter() : this.personalCategoryFilter();
    const options = this.getCategoryOptions(type, activeFilter);

    if (options.length === 0) {
      return null;
    }

    const onChange = type === 'global' ? this.onGlobalCategoryChange.bind(this) : this.onPersonalCategoryChange.bind(this);

    return (
      <div
        className="GifCategoryFilters"
        role="toolbar"
        aria-label={String(app.translator.trans('fw27-gif-pocket.forum.gif_picker_modal.filters.aria_label'))}
      >
        {options.map((option) => {
          const isActive = option.value === activeFilter;

          return (
            <Button
              type="button"
              key={option.value}
              className={`Button Button--secondary GifCategoryButton ${isActive ? 'active' : ''}`}
              onclick={() => onChange(option.value)}
              aria-pressed={isActive}
              disabled={this.loading && isActive}
            >
              {option.label}
            </Button>
          );
        })}
      </div>
    );
  }

  getCategoryOptions(type: 'global' | 'personal', activeFilter: string): GifCategoryOption[] {
    const gifs = type === 'global' ? this.globalGifs : this.personalGifs;
    const categories = new Set<string>();
    let hasUncategorized = false;

    gifs.forEach((gif) => {
      const rawValue = gif.category ? gif.category() : null;

      if (typeof rawValue === 'string') {
        const normalized = rawValue.trim();

        if (normalized.length > 0) {
          categories.add(normalized);
        } else {
          hasUncategorized = true;
        }
      } else {
        hasUncategorized = true;
      }
    });

    const options: { value: string; label: string }[] = [
      {
        value: ALL_CATEGORIES_VALUE,
        label: String(app.translator.trans('fw27-gif-pocket.forum.gif_picker_modal.filters.show_everything')),
      },
    ];

    if (hasUncategorized || activeFilter === UNCATEGORIZED_VALUE) {
      options.push({
        value: UNCATEGORIZED_VALUE,
        label: String(app.translator.trans('fw27-gif-pocket.forum.gif_picker_modal.filters.uncategorized')),
      });
    }

    options.push(
      ...Array.from(categories)
        .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
        .map((category) => ({ value: category, label: category }))
    );

    return options;
  }

  renderEmptyState(scope: 'global' | 'personal') {
    const key =
      scope === 'global'
        ? 'fw27-gif-pocket.forum.gif_picker_modal.empty.global'
        : 'fw27-gif-pocket.forum.gif_picker_modal.empty.personal';

    return (
      <div className="GifEmptyState">
        <i className="fas fa-folder-open" aria-hidden="true"></i>
        <span>{String(app.translator.trans(key))}</span>
      </div>
    );
  }

  getCategoryLabel(gif: GlobalGif | PersonalGif) {
    const value = gif.category ? gif.category() : null;

    if (typeof value === 'string') {
      const normalized = value.trim();

      if (normalized !== '') {
        return String(
          app.translator.trans('fw27-gif-pocket.forum.gif_picker_modal.category_label', {
            category: normalized,
          })
        );
      }
    }

    return String(app.translator.trans('fw27-gif-pocket.forum.gif_picker_modal.filters.uncategorized'));
  }

  normalizeCategory(category: string | null | undefined) {
    if (!category) {
      return null;
    }

    const normalized = category.trim();
    return normalized === '' ? null : normalized;
  }
}

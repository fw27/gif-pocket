import app from 'flarum/admin/app';
import ExtensionPage from 'flarum/admin/components/ExtensionPage';
import Button from 'flarum/common/components/Button';
import type Mithril from 'mithril';

declare global {
  interface Window {
    m: Mithril.Static;
  }
}

const m = window.m;

export default class GifManagementPage extends ExtensionPage {
  loading!: boolean;
  gifs!: any[];
  newGif!: { title: string; url: string; category: string };
  editingId!: string | null;

  oninit(vnode: Mithril.Vnode) {
    super.oninit(vnode);
    this.loading = false;
    this.gifs = [];
    this.newGif = {
      title: '',
      url: '',
      category: ''
    };
    this.editingId = null;
    this.loadGifs();
  }

  content() {
    const translator = app.translator;
    const loadingInitial = this.loading && this.gifs.length === 0;
    const isEmpty = !this.loading && this.gifs.length === 0;

    return (
      <div className="GifPickerAdminPage container">
        <div className="GifPickerAdminPage-section">
          <h2 className="GifPickerAdminPage-heading">
            {String(translator.trans('fw27-gif-pocket.admin.management.add_heading'))}
          </h2>

          <div className="GifPickerAdminPage-fields">
            <div className="Form-group">
              <label className="Form-label">
                {String(translator.trans('fw27-gif-pocket.admin.management.fields.title_label'))}
              </label>
              <input
                className="FormControl"
                placeholder={String(translator.trans('fw27-gif-pocket.admin.management.fields.title_placeholder'))}
                value={this.newGif.title}
                oninput={(e: Event) => (this.newGif.title = (e.target as HTMLInputElement).value)}
              />
            </div>

            <div className="Form-group">
              <label className="Form-label">
                {String(translator.trans('fw27-gif-pocket.admin.management.fields.category_label'))}
              </label>
              <input
                className="FormControl"
                placeholder={String(translator.trans('fw27-gif-pocket.admin.management.fields.category_placeholder'))}
                value={this.newGif.category}
                oninput={(e: Event) => (this.newGif.category = (e.target as HTMLInputElement).value)}
              />
            </div>

            <div className="Form-group">
              <label className="Form-label">
                {String(translator.trans('fw27-gif-pocket.admin.management.fields.url_label'))}
              </label>
              <input
                className="FormControl"
                placeholder={String(translator.trans('fw27-gif-pocket.admin.management.fields.url_placeholder'))}
                value={this.newGif.url}
                oninput={(e: Event) => (this.newGif.url = (e.target as HTMLInputElement).value)}
              />
            </div>
          </div>

          <div className="GifPickerAdminPage-actionButtons">
            <Button className="Button Button--primary" onclick={() => this.submitGif()} loading={this.loading}>
              {String(
                translator.trans(
                  this.editingId
                    ? 'fw27-gif-pocket.admin.management.fields.update_button'
                    : 'fw27-gif-pocket.admin.management.fields.submit_button'
                )
              )}
            </Button>

            {this.editingId ? (
              <Button
                className="Button"
                onclick={() => this.cancelEditing()}
                disabled={this.loading}
              >
                {String(translator.trans('fw27-gif-pocket.admin.management.fields.cancel_button'))}
              </Button>
            ) : null}
          </div>
        </div>

        <div className="GifPickerAdminPage-section">
          <h2 className="GifPickerAdminPage-heading">
            {String(translator.trans('fw27-gif-pocket.admin.management.list_heading'))}
          </h2>

          {loadingInitial ? (
            <div className="GifPickerAdminPage-status GifPickerAdminPage-status--loading">
              {String(translator.trans('fw27-gif-pocket.admin.management.loading'))}
            </div>
          ) : isEmpty ? (
            <div className="GifPickerAdminPage-status GifPickerAdminPage-status--empty">
              {String(translator.trans('fw27-gif-pocket.admin.management.empty'))}
            </div>
          ) : (
            <div className="GifPickerAdminPage-tableWrapper">
              <table className="Table GifPickerAdminPage-table">
                <thead>
                  <tr>
                    <th>{String(translator.trans('fw27-gif-pocket.admin.management.table.title'))}</th>
                    <th>{String(translator.trans('fw27-gif-pocket.admin.management.table.category'))}</th>
                    <th>{String(translator.trans('fw27-gif-pocket.admin.management.table.preview'))}</th>
                    <th>{String(translator.trans('fw27-gif-pocket.admin.management.table.actions'))}</th>
                  </tr>
                </thead>
                <tbody>
                  {this.gifs.map((gif, index) => {
                    const id = gif && typeof gif.id === 'function' ? String(gif.id()) : String(index);
                    const title = gif && typeof gif.title === 'function' ? String(gif.title() || '') : '';
                    const category = gif && typeof gif.category === 'function' ? String(gif.category() || '') : '';
                    const url = gif && typeof gif.url === 'function' ? String(gif.url() || '') : '';

                    return (
                      <tr key={id || index}>
                        <td>{title || String(translator.trans('fw27-gif-pocket.admin.management.table.untitled'))}</td>
                        <td>{category || String(translator.trans('fw27-gif-pocket.admin.management.table.category_empty'))}</td>
                        <td className="GifPickerAdminPage-tablePreviewCell">
                          {url ? (
                            <img
                              className="GifPickerAdminPage-thumb"
                              src={url}
                              alt={title || String(translator.trans('fw27-gif-pocket.admin.management.table.preview'))}
                            />
                          ) : (
                            <span className="GifPickerAdminPage-noPreview">—</span>
                          )}
                        </td>
                        <td className="GifPickerAdminPage-tableActions">
                          <Button
                            className="Button"
                            onclick={() => this.startEditing(gif, id)}
                            disabled={this.loading && this.editingId !== id}
                          >
                            {String(translator.trans('fw27-gif-pocket.admin.management.actions.edit'))}
                          </Button>
                          <Button
                            className="Button Button--danger"
                            onclick={() => this.deleteGif(id)}
                            loading={this.loading && this.editingId === id}
                          >
                            {String(translator.trans('fw27-gif-pocket.admin.management.actions.delete'))}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  loadGifs() {
    this.loading = true;
    m.redraw();

    app
      .request({
        method: 'GET',
        url: this.apiUrl('/global-gifs'),
      })
      .then((response: any) => {
        this.gifs = response.data
          .map((item: any) => app.store.pushPayload({ data: item }))
          .filter((gif: any) => gif);
      })
      .catch((error) => {
        console.error('[fw27/gif-pocket] Failed to load global GIFs', error);
        this.gifs = [];
        app.alerts.show({
          type: 'error',
          content: app.translator.trans('fw27-gif-pocket.admin.management.load_error'),
        });
      })
      .finally(() => {
        this.loading = false;
        m.redraw();
      });
  }

  submitGif() {
    const translator = app.translator;

    if (!this.newGif.url.trim()) {
      alert(String(translator.trans('fw27-gif-pocket.admin.management.fields.url_required')));
      return;
    }

    if (this.editingId) {
      this.updateGif();
    } else {
      this.createGif();
    }
  }

  createGif() {
    this.loading = true;

    app.store
      .createRecord('global-gifs')
      .save({
        title: this.newGif.title,
        url: this.newGif.url,
        category: this.newGif.category || null,
      })
      .then(() => {
        this.resetForm();
        this.loadGifs();
      })
      .finally(() => {
        this.loading = false;
      });
  }

  updateGif() {
    if (!this.editingId) {
      return;
    }

    this.loading = true;

    app
      .request({
        method: 'PATCH',
        url: this.apiUrl(`/global-gifs/${this.editingId}`),
        body: {
          data: {
            type: 'global-gifs',
            id: this.editingId,
            attributes: {
              title: this.newGif.title,
              url: this.newGif.url,
              category: this.newGif.category || null,
            },
          },
        },
      })
      .then(() => {
        this.loadGifs();
        this.resetForm();
      })
      .catch((error) => {
        console.error('[fw27/gif-pocket] Failed to update global GIF', error);
        app.alerts.show({
          type: 'error',
          content: app.translator.trans('fw27-gif-pocket.admin.management.update_error'),
        });
      })
      .finally(() => {
        this.loading = false;
        m.redraw();
      });
  }

  deleteGif(id: string) {
    this.loading = true;

    app
      .request({
        method: 'DELETE',
        url: this.apiUrl(`/global-gifs/${id}`),
      })
      .then(() => {
        if (this.editingId === id) {
          this.resetForm();
        }

        this.loadGifs();
      })
      .catch((error) => {
        console.error('[fw27/gif-pocket] Failed to delete global GIF', error);
        app.alerts.show({
          type: 'error',
          content: app.translator.trans('fw27-gif-pocket.admin.management.delete_error'),
        });
      })
      .finally(() => {
        this.loading = false;
        m.redraw();
      });
  }

  startEditing(gif: any, id: string) {
    this.editingId = id;
    this.newGif = {
      title: gif && typeof gif.title === 'function' ? String(gif.title() || '') : '',
      url: gif && typeof gif.url === 'function' ? String(gif.url() || '') : '',
      category: gif && typeof gif.category === 'function' ? String(gif.category() || '') : '',
    };
  }

  cancelEditing() {
    this.resetForm();
  }

  resetForm() {
    this.editingId = null;
    this.newGif = { title: '', url: '', category: '' };
  }

  private apiUrl(path: string): string {
    const base = (app.data && app.data.apiUrl) || (app.forum && typeof app.forum.attribute === 'function' ? app.forum.attribute('apiUrl') : undefined);

    if (!base) {
      throw new Error('[fw27/gif-pocket] Unable to determine API URL in admin context');
    }

    return `${base}${path}`;
  }
}
import app from 'flarum/admin/app';
import GifManagementPage from './components/GifManagementPage';
import GlobalGif from '../common/models/GlobalGif';
import PersonalGif from '../common/models/PersonalGif';

app.initializers.add('fw-ext-gif-picker', () => {
  app.store.models['global-gifs'] = GlobalGif;
  app.store.models['personal-gifs'] = PersonalGif;

  (app as any).extensionData
    .for('fw-ext-gif-picker')
    .registerPage(GifManagementPage);
});

export { default as extend } from './extend';

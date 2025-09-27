import app from 'flarum/admin/app';
import GifManagementPage from './components/GifManagementPage';
import GlobalGif from '../common/models/GlobalGif';
import PersonalGif from '../common/models/PersonalGif';

app.initializers.add('fw27-gif-pocket', () => {
  app.store.models['global-gifs'] = GlobalGif;
  app.store.models['personal-gifs'] = PersonalGif;

  (app as any).extensionData
    .for('fw27-gif-pocket')
    .registerPage(GifManagementPage);
});

export { default as extend } from './extend';
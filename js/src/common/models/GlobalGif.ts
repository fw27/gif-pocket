import Model from 'flarum/common/Model';

export default class GlobalGif extends Model {
  title = Model.attribute<string | null>('title');
  url = Model.attribute<string>('url');
  category = Model.attribute<string | null>('category');
}
import Model from 'flarum/common/Model';

export default class PersonalGif extends Model {
  title = Model.attribute<string | null>('title');
  url = Model.attribute<string>('url');
  userId = Model.attribute<number>('userId');
  category = Model.attribute<string | null>('category');
}
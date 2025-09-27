<?php

namespace FwExt\GifPicker;

use Flarum\Database\AbstractModel;
use Flarum\User\User;

class PersonalGif extends AbstractModel
{
    protected $table = 'personal_gifs';

    protected $fillable = ['user_id', 'title', 'url', 'category'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
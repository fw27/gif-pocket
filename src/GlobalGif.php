<?php

namespace FwExt\GifPicker;

use Flarum\Database\AbstractModel;

class GlobalGif extends AbstractModel
{
    protected $table = 'global_gifs';

    protected $fillable = ['title', 'url', 'category'];
}
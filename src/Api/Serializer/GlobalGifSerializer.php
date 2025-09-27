<?php

namespace FwExt\GifPicker\Api\Serializer;

use Flarum\Api\Serializer\AbstractSerializer;
use FwExt\GifPicker\GlobalGif;

class GlobalGifSerializer extends AbstractSerializer
{
    protected $type = 'global-gifs';

    protected function getDefaultAttributes($model)
    {
        return [
            'title' => $model->title,
            'url' => $model->url,
            'category' => $model->category,
        ];
    }

    public function getId($model)
    {
        return $model->id;
    }
}
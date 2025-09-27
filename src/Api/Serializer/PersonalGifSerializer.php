<?php

namespace FwExt\GifPicker\Api\Serializer;

use Flarum\Api\Serializer\AbstractSerializer;
use FwExt\GifPicker\PersonalGif;

class PersonalGifSerializer extends AbstractSerializer
{
    protected $type = 'personal-gifs';

    protected function getDefaultAttributes($model)
    {
        return [
            'title' => $model->title,
            'url' => $model->url,
            'userId' => $model->user_id,
            'category' => $model->category,
        ];
    }

    public function getId($model)
    {
        return $model->id;
    }
}
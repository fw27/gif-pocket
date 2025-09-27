<?php

namespace FwExt\GifPicker\Api\Controller;

use Flarum\Api\Controller\AbstractShowController;
use Flarum\Http\RequestUtil;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use FwExt\GifPicker\GlobalGif;

class UpdateGlobalGifController extends AbstractShowController
{
    public $serializer = \FwExt\GifPicker\Api\Serializer\GlobalGifSerializer::class;

    protected function data(ServerRequestInterface $request, Document $document)
    {
        RequestUtil::getActor($request)->assertAdmin();

        $id = Arr::get($request->getQueryParams(), 'id');
        $attributes = Arr::get($request->getParsedBody(), 'data.attributes', []);

        $gif = GlobalGif::findOrFail($id);

        $gif->title = Arr::get($attributes, 'title', $gif->title);
        $gif->url = Arr::get($attributes, 'url', $gif->url);
        if (array_key_exists('category', $attributes)) {
            $category = Arr::get($attributes, 'category');
            $category = is_string($category) ? trim($category) : null;
            $gif->category = $category === '' ? null : $category;
        }

        $gif->save();

        return $gif;
    }
}
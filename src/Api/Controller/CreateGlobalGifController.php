<?php

namespace FwExt\GifPicker\Api\Controller;

use Flarum\Api\Controller\AbstractCreateController;
use Flarum\Http\RequestUtil;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use FwExt\GifPicker\GlobalGif;

class CreateGlobalGifController extends AbstractCreateController
{
    public $serializer = \FwExt\GifPicker\Api\Serializer\GlobalGifSerializer::class;

    protected function data(ServerRequestInterface $request, Document $document)
    {
        RequestUtil::getActor($request)->assertAdmin();

        $attributes = Arr::get($request->getParsedBody(), 'data.attributes', []);
        $category = Arr::get($attributes, 'category');
        $category = is_string($category) ? trim($category) : null;
        $category = $category === '' ? null : $category;

        return GlobalGif::create([
            'title' => Arr::get($attributes, 'title'),
            'url' => Arr::get($attributes, 'url'),
            'category' => $category,
        ]);
    }
}
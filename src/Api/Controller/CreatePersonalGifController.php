<?php

namespace FwExt\GifPicker\Api\Controller;

use Flarum\Api\Controller\AbstractCreateController;
use Flarum\Http\RequestUtil;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use FwExt\GifPicker\PersonalGif;

class CreatePersonalGifController extends AbstractCreateController
{
    public $serializer = \FwExt\GifPicker\Api\Serializer\PersonalGifSerializer::class;

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);
        $actor->assertRegistered();

        $attributes = Arr::get($request->getParsedBody(), 'data.attributes', []);
        
        // Validate required fields
        $url = Arr::get($attributes, 'url');
        if (empty($url)) {
            throw new \Flarum\Foundation\ValidationException(['url' => 'URL is required']);
        }

        $category = Arr::get($attributes, 'category');
        $category = is_string($category) ? trim($category) : null;
        $category = $category === '' ? null : $category;

        return PersonalGif::create([
            'user_id' => $actor->id,
            'title' => Arr::get($attributes, 'title'),
            'url' => $url,
            'category' => $category,
        ]);
    }
}
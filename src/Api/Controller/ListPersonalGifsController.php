<?php

namespace FwExt\GifPicker\Api\Controller;

use Flarum\Api\Controller\AbstractListController;
use Flarum\Http\RequestUtil;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use FwExt\GifPicker\PersonalGif;

class ListPersonalGifsController extends AbstractListController
{
    public $serializer = \FwExt\GifPicker\Api\Serializer\PersonalGifSerializer::class;

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);
        $actor->assertRegistered();

        $query = PersonalGif::where('user_id', $actor->id);

        $categoryFilter = Arr::get($request->getQueryParams(), 'filter.category');
        if (is_string($categoryFilter)) {
            $normalized = trim($categoryFilter);
            $normalizedLower = strtolower($normalized);

            if ($normalized !== '' && $normalizedLower !== 'all' && $normalizedLower !== 'show everything') {
                if ($normalizedLower === 'uncategorized' || $normalizedLower === '__uncategorized__') {
                    $query->where(function ($q) {
                        $q->whereNull('category')->orWhere('category', '');
                    });
                } else {
                    $query->where('category', $normalized);
                }
            }
        }

        return $query->get();
    }
}
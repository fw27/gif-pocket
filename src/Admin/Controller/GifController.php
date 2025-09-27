<?php

namespace FwExt\GifPicker\Admin\Controller;

use Flarum\Admin\Content\AdminPayload;
use Flarum\Api\Controller\AbstractListController;
use Flarum\Http\RequestUtil;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use FwExt\GifPicker\GlobalGif;

class GifController extends AbstractListController
{
    public $serializer = \FwExt\GifPicker\Api\Serializer\GlobalGifSerializer::class;

    protected function data(ServerRequestInterface $request, Document $document)
    {
        RequestUtil::getActor($request)->assertAdmin();

        return GlobalGif::all();
    }
}
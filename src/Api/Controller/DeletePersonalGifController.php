<?php

namespace FwExt\GifPicker\Api\Controller;

use Flarum\Api\Controller\AbstractDeleteController;
use Flarum\Http\RequestUtil;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use FwExt\GifPicker\PersonalGif;

class DeletePersonalGifController extends AbstractDeleteController
{
    protected function delete(ServerRequestInterface $request)
    {
        $actor = RequestUtil::getActor($request);
        $actor->assertRegistered();

        $id = Arr::get($request->getQueryParams(), 'id');
        $gif = PersonalGif::where('id', $id)->where('user_id', $actor->id)->firstOrFail();

        $gif->delete();
    }
}
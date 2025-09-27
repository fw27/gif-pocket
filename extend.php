<?php

/*
 * This file is part of fw-ext/gif-picker.
 *
 * Copyright (c) 2025 .
 *
 * For the full copyright and license information, please view the LICENSE.md
 * file that was distributed with this source code.
 */

namespace FwExt\GifPicker;

use Flarum\Extend;
use FwExt\GifPicker\Api\Controller\ListGlobalGifsController;
use FwExt\GifPicker\Api\Controller\ListPersonalGifsController;
use FwExt\GifPicker\Api\Controller\CreateGlobalGifController;
use FwExt\GifPicker\Api\Controller\UpdateGlobalGifController;
use FwExt\GifPicker\Api\Controller\DeleteGlobalGifController;
use FwExt\GifPicker\Api\Controller\CreatePersonalGifController;
use FwExt\GifPicker\Api\Controller\UpdatePersonalGifController;
use FwExt\GifPicker\Api\Controller\DeletePersonalGifController;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/resources/less/forum.less'),
    (new Extend\Frontend('admin'))
        ->js(__DIR__.'/js/dist/admin.js')
        ->css(__DIR__.'/resources/less/admin.less'),
    new Extend\Locales(__DIR__.'/locale'),

    (new Extend\Routes('api'))
        ->get('/global-gifs', 'global-gifs.index', ListGlobalGifsController::class)
        ->post('/global-gifs', 'global-gifs.create', CreateGlobalGifController::class)
        ->patch('/global-gifs/{id}', 'global-gifs.update', UpdateGlobalGifController::class)
        ->delete('/global-gifs/{id}', 'global-gifs.delete', DeleteGlobalGifController::class)
        ->get('/personal-gifs', 'personal-gifs.index', ListPersonalGifsController::class)
        ->post('/personal-gifs', 'personal-gifs.create', CreatePersonalGifController::class)
        ->patch('/personal-gifs/{id}', 'personal-gifs.update', UpdatePersonalGifController::class)
        ->delete('/personal-gifs/{id}', 'personal-gifs.delete', DeletePersonalGifController::class),

    // Rich text functionality - User preferences
    (new Extend\User())->registerPreference('useRichTextEditor', 'boolval', true),
    (new Extend\User())->registerPreference('richTextCompactParagraphs', 'boolval', false),

    // Rich text functionality - Settings
    (new Extend\Settings())
        ->serializeToForum('toggleRichTextEditorButton', 'askvortsov-rich-text.toggle_on_editor', 'boolval', false),
];

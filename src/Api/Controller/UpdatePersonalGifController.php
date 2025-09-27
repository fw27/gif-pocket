<?php

namespace FwExt\GifPicker\Api\Controller;

use Flarum\Api\Controller\AbstractShowController;
use Flarum\Http\RequestUtil;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use FwExt\GifPicker\PersonalGif;
use Flarum\Foundation\ValidationException;

class UpdatePersonalGifController extends AbstractShowController
{
    public $serializer = \FwExt\GifPicker\Api\Serializer\PersonalGifSerializer::class;

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);
        $actor->assertRegistered();

        // Get ID from query params (standard Flarum way)
        $id = Arr::get($request->getQueryParams(), 'id');
        
        if (!$id) {
            error_log("[GIF Update] No ID provided. URI: " . $request->getUri()->getPath());
            error_log("[GIF Update] Query params: " . json_encode($request->getQueryParams()));
            throw new \InvalidArgumentException('GIF ID is required');
        }
        
        error_log("[GIF Update] Updating personal GIF ID: $id for user: {$actor->id}");
        
        // Find the GIF and ensure ownership
        $gif = PersonalGif::where('id', $id)->where('user_id', $actor->id)->first();
        if (!$gif) {
            error_log("[GIF Update] GIF not found. ID: $id, User: {$actor->id}");
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('Personal GIF not found');
        }

        // Get attributes from request body
        $body = $request->getParsedBody();
        error_log("[GIF Update] Request body: " . json_encode($body));
        
        $attributes = Arr::get($body, 'data.attributes', []);
        error_log("[GIF Update] Update attributes: " . json_encode($attributes));
        
        // Validate required fields
        $errors = [];
        if (empty($attributes['title'])) {
            $errors['title'] = 'Title is required';
        }
        if (empty($attributes['url'])) {
            $errors['url'] = 'URL is required';
        }
        
        if (!empty($errors)) {
            error_log("[GIF Update] Validation errors: " . json_encode($errors));
            throw new ValidationException($errors);
        }

        // Update the GIF
        try {
            $gif->title = $attributes['title'];
            $gif->url = $attributes['url'];
            if (array_key_exists('category', $attributes)) {
                $category = $attributes['category'];
                if (is_string($category)) {
                    $category = trim($category);
                } else {
                    $category = null;
                }
                $gif->category = $category === '' ? null : $category;
            }
            $gif->save();
            
            error_log("[GIF Update] Successfully updated GIF ID: $id");
            
            return $gif;
        } catch (\Exception $e) {
            error_log("[GIF Update] Failed to save GIF: " . $e->getMessage());
            error_log("[GIF Update] Stack trace: " . $e->getTraceAsString());
            throw $e;
        }
    }
}
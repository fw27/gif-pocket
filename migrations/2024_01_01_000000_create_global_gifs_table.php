<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        if (!$schema->hasTable('global_gifs')) {
            $schema->create('global_gifs', function (Blueprint $table) {
                $table->increments('id');
                $table->string('title');
                $table->string('category', 100)->nullable();
                $table->string('url');
                $table->timestamps();
            });
        }
    },
    'down' => function (Builder $schema) {
        $schema->dropIfExists('global_gifs');
    },
];
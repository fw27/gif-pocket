<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        if (!$schema->hasColumn('global_gifs', 'category')) {
            $schema->table('global_gifs', function (Blueprint $table) {
                $table->string('category', 100)->nullable()->after('title');
            });
        }
    },
    'down' => function (Builder $schema) {
        if ($schema->hasColumn('global_gifs', 'category')) {
            $schema->table('global_gifs', function (Blueprint $table) {
                $table->dropColumn('category');
            });
        }
    }
];

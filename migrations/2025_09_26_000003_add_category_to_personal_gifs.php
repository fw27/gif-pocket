<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        if (!$schema->hasColumn('personal_gifs', 'category')) {
            $schema->table('personal_gifs', function (Blueprint $table) {
                $table->string('category', 100)->nullable()->after('title');
            });
        }
    },
    'down' => function (Builder $schema) {
        if ($schema->hasColumn('personal_gifs', 'category')) {
            $schema->table('personal_gifs', function (Blueprint $table) {
                $table->dropColumn('category');
            });
        }
    }
];

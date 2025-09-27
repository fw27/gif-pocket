<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        $schema->table('global_gifs', function (Blueprint $table) {
            $table->string('title', 255)->nullable()->after('id');
        });
    },
    'down' => function (Builder $schema) {
        $schema->table('global_gifs', function (Blueprint $table) {
            $table->dropColumn('title');
        });
    }
];
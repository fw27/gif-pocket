<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        $schema->table('personal_gifs', function (Blueprint $table) {
            $table->string('title', 255)->nullable()->after('user_id');
        });
    },
    'down' => function (Builder $schema) {
        $schema->table('personal_gifs', function (Blueprint $table) {
            $table->dropColumn('title');
        });
    }
];
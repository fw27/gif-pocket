<?php

use Illuminate\Database\Schema\Blueprint;

use Flarum\Database\Migration;

return Migration::createTable(
    'global_gifs',
    function (Blueprint $table) {
        $table->increments('id');
        $table->string('url');

        // created_at & updated_at
        $table->timestamps();
    }
);


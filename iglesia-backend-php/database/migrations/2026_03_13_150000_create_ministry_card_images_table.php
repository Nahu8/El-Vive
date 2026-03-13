<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ministry_card_images', function (Blueprint $table) {
            $table->id();
            $table->string('ministryId', 100)->unique()->index();
            $table->string('imageMime', 50)->nullable();
            $table->string('imageName', 255)->nullable();
            $table->timestamps();
        });

        $driver = Schema::getConnection()->getDriverName();
        $table = Schema::getConnection()->getTablePrefix() . 'ministry_card_images';
        if ($driver === 'mysql' || $driver === 'mariadb') {
            DB::statement("ALTER TABLE {$table} ADD COLUMN imageData LONGBLOB NULL AFTER ministryId");
        } else {
            DB::statement("ALTER TABLE {$table} ADD COLUMN imageData BLOB NULL");
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('ministry_card_images');
    }
};

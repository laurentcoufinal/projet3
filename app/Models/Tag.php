<?php

namespace App\Models;

<<<<<<< HEAD
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
=======
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
>>>>>>> a8db11e320cb4c920879e8c7d0a67f63e2dd730b

class Tag extends Model
{
    use HasFactory;

<<<<<<< HEAD
=======
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
>>>>>>> a8db11e320cb4c920879e8c7d0a67f63e2dd730b
    protected $fillable = [
        'name',
    ];

<<<<<<< HEAD
    public function notes()
=======
    /**
     * Get the notes for the tag.
     */
    public function notes(): HasMany
>>>>>>> a8db11e320cb4c920879e8c7d0a67f63e2dd730b
    {
        return $this->hasMany(Note::class);
    }
}

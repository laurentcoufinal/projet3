<?php

namespace App\Models;

<<<<<<< HEAD
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
=======
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
>>>>>>> a8db11e320cb4c920879e8c7d0a67f63e2dd730b

class Note extends Model
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
        'user_id',
        'tag_id',
        'text',
    ];

<<<<<<< HEAD
    public function user()
=======
    /**
     * Get the user that owns the note.
     */
    public function user(): BelongsTo
>>>>>>> a8db11e320cb4c920879e8c7d0a67f63e2dd730b
    {
        return $this->belongsTo(User::class);
    }

<<<<<<< HEAD
    public function tag()
=======
    /**
     * Get the tag that owns the note.
     */
    public function tag(): BelongsTo
>>>>>>> a8db11e320cb4c920879e8c7d0a67f63e2dd730b
    {
        return $this->belongsTo(Tag::class);
    }
}

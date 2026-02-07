<?php

namespace ArchitectureCible\Infrastructure\Persistence;

use App\Models\Tag;
use App\Models\User;
use ArchitectureCible\Application\Ports\TagRepositoryInterface;
use Illuminate\Support\Collection;

class EloquentTagRepository implements TagRepositoryInterface
{
    /**
     * Tags are global: return all tags, they do not belong to a user.
     */
    public function getAllTags(): Collection
    {
        return Tag::orderBy('name')->get();
    }

    public function getTagsForUser(User $user): Collection
    {
        return Tag::whereHas('notes', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
            ->orderBy('name')
            ->get();
    }

    public function create(array $data): Tag
    {
        return Tag::create($data);
    }
}

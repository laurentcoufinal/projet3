<?php

namespace ArchitectureCible\Application\Ports;

use App\Models\Tag;
use App\Models\User;
use Illuminate\Support\Collection;

interface TagRepositoryInterface
{
    /**
     * Get all tags (tags are global, they do not belong to a user).
     *
     * @return Collection<int, Tag>
     */
    public function getAllTags(): Collection;

    /**
     * Get tags used by the given user's notes (legacy / alternative).
     *
     * @return Collection<int, Tag>
     */
    public function getTagsForUser(User $user): Collection;

    /**
     * Create a tag.
     */
    public function create(array $data): Tag;
}

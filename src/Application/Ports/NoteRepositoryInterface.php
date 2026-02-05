<?php

namespace ArchitectureCible\Application\Ports;

use App\Models\Note;
use App\Models\User;
use Illuminate\Support\Collection;

interface NoteRepositoryInterface
{
    /**
     * Get all notes for the given user.
     *
     * @return Collection<int, Note>
     */
    public function getNotesForUser(User $user): Collection;

    /**
     * Create a note for the given user (tag_id must exist).
     */
    public function create(array $data, User $user): Note;

    /**
     * Find a note by id for the given user, or null if not found / not owned.
     */
    public function findByIdForUser(int $noteId, User $user): ?Note;

    /**
     * Update a note.
     */
    public function update(Note $note, array $data): Note;

    /**
     * Delete a note.
     */
    public function delete(Note $note): void;
}

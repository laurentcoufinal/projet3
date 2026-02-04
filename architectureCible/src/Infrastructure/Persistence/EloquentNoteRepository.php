<?php

namespace ArchitectureCible\Infrastructure\Persistence;

use App\Models\Note;
use App\Models\User;
use ArchitectureCible\Application\Ports\NoteRepositoryInterface;
use Illuminate\Support\Collection;

class EloquentNoteRepository implements NoteRepositoryInterface
{
    public function getNotesForUser(User $user): Collection
    {
        return Note::where('user_id', $user->id)
            ->with('tag')
            ->orderBy('updated_at', 'desc')
            ->get();
    }

    public function create(array $data, User $user): Note
    {
        $data['user_id'] = $user->id;
        $note = Note::create($data);
        $note->load('tag');

        return $note;
    }

    public function findByIdForUser(int $noteId, User $user): ?Note
    {
        return Note::where('id', $noteId)
            ->where('user_id', $user->id)
            ->with('tag')
            ->first();
    }

    public function update(Note $note, array $data): Note
    {
        $note->update($data);
        $note->load('tag');

        return $note;
    }

    public function delete(Note $note): void
    {
        $note->delete();
    }
}

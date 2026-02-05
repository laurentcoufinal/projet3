<?php

namespace ArchitectureCible\Presentation\Http\Controllers\Api;

use ArchitectureCible\Application\Ports\NoteRepositoryInterface;
use ArchitectureCible\Presentation\Http\Requests\CreateNoteRequest;
use ArchitectureCible\Presentation\Http\Requests\UpdateNoteRequest;
use ArchitectureCible\Presentation\Http\Resources\NoteResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NoteController
{
    public function __construct(
        private NoteRepositoryInterface $noteRepository
    ) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user === null) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $notes = $this->noteRepository->getNotesForUser($user);

        $payload = [
            'data' => NoteResource::collection($notes),
        ];
        if ($notes->isEmpty()) {
            $payload['message'] = 'Aucune note.';
        }

        return response()->json($payload, 200);
    }

    public function store(CreateNoteRequest $request): JsonResponse
    {
        $user = $request->user();
        if ($user === null) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $note = $this->noteRepository->create($request->validated(), $user);

        return response()->json([
            'data' => new NoteResource($note),
        ], 201);
    }

    public function update(UpdateNoteRequest $request, int $noteId): JsonResponse
    {
        $user = $request->user();
        if ($user === null) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $note = $this->noteRepository->findByIdForUser($noteId, $user);
        if ($note === null) {
            return response()->json(['message' => 'Note not found.'], 404);
        }

        $note = $this->noteRepository->update($note, $request->validated());

        return response()->json([
            'data' => new NoteResource($note),
            'message' => 'Note mise à jour.',
        ], 200);
    }

    public function destroy(Request $request, int $noteId): JsonResponse
    {
        $user = $request->user();
        if ($user === null) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $note = $this->noteRepository->findByIdForUser($noteId, $user);
        if ($note === null) {
            return response()->json(['message' => 'Note not found.'], 404);
        }

        $this->noteRepository->delete($note);

        return response()->json([
            'message' => 'Note supprimée.',
        ], 200);
    }
}

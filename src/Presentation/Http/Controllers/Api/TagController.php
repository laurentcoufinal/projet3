<?php

namespace ArchitectureCible\Presentation\Http\Controllers\Api;

use ArchitectureCible\Application\Ports\TagRepositoryInterface;
use ArchitectureCible\Presentation\Http\Requests\CreateTagRequest;
use ArchitectureCible\Presentation\Http\Resources\TagResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TagController
{
    public function __construct(
        private TagRepositoryInterface $tagRepository
    ) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user === null) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $tags = $this->tagRepository->getAllTags();

        $payload = [
            'data' => TagResource::collection($tags),
        ];
        if ($tags->isEmpty()) {
            $payload['message'] = 'Aucun tag.';
        }

        return response()->json($payload, 200);
    }

    public function store(CreateTagRequest $request): JsonResponse
    {
        $user = $request->user();
        if ($user === null) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $tag = $this->tagRepository->create($request->validated());

        return response()->json([
            'data' => new TagResource($tag),
        ], 201);
    }
}

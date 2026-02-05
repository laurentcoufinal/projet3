<?php

namespace ArchitectureCible\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Note */
class NoteResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'tag_id' => $this->tag_id,
            'tag' => $this->whenLoaded('tag', fn () => [
                'id' => $this->tag->id,
                'name' => $this->tag->name,
            ]),
            'text' => $this->text,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

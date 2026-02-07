<?php

namespace ArchitectureCible\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateNoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'text' => ['sometimes', 'string', 'nullable', 'max:65535'],
            'tag_id' => ['sometimes', 'integer', 'exists:tags,id', 'nullable'],
        ];
    }
}

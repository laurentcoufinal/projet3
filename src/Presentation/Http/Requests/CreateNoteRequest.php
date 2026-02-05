<?php

namespace ArchitectureCible\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateNoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Contrainte : toute note doit choisir un tag existant.
     *
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'text' => ['nullable', 'string', 'max:65535'],
            'tag_id' => ['required', 'integer', 'exists:tags,id'],
        ];
    }

    /**
     * Messages d'erreur personnalisés.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'tag_id.required' => 'Un tag doit être associé à la note.',
            'tag_id.exists' => 'Le tag associé à la création de la note n\'existe pas.',
            'text.max' => 'Le texte de la note ne peut pas dépasser 65535 caractères.',
        ];
    }
}

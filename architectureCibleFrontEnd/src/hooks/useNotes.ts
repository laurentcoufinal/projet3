import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { getNotes, createNote, deleteNote } from '@/api/client';

export const notesQueryKey = ['notes'] as const;

export function useNotes() {
  const token = useAuthStore((state) => state.token);
  return useQuery({
    queryKey: [...notesQueryKey, token ?? ''],
    queryFn: () => getNotes(token ?? null),
    enabled: !!token,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  return useMutation({
    mutationFn: ({ text, tag_id }: { text: string; tag_id: number }) =>
      createNote(text, tag_id, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notesQueryKey });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  return useMutation({
    mutationFn: (id: number) => deleteNote(id, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notesQueryKey });
    },
  });
}

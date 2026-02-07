import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { getTags, createTag } from '@/api/client';

export const tagsQueryKey = ['tags'] as const;

export function useTags() {
  const token = useAuthStore((state) => state.token);
  return useQuery({
    queryKey: [...tagsQueryKey, token ?? ''],
    queryFn: () => getTags(token ?? null),
    enabled: !!token,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => {
      const token = useAuthStore.getState().token;
      if (!token) return Promise.reject(new Error('Non authentifié'));
      return createTag(name, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagsQueryKey });
    },
  });
}

'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchFavoriteIds, postFavorite } from '../api-client';

export function useFavorites() {
  const queryClient = useQueryClient();

  const favoritesQuery = useQuery({
    queryKey: ['favorites'],
    queryFn: fetchFavoriteIds,
    initialData: [] as string[],
  });
  const favoriteIds = useMemo(
    () => new Set(favoritesQuery.data),
    [favoritesQuery.data],
  );

  const [favoriteError, setFavoriteError] = useState<string | null>(null);

  const toggleFavoriteMutation = useMutation({
    mutationFn: ({
      offerId,
      favorited,
    }: {
      offerId: string;
      favorited: boolean;
    }) => postFavorite(offerId, favorited),
    onMutate: async ({ offerId, favorited }) => {
      await queryClient.cancelQueries({ queryKey: ['favorites'] });
      const previous = queryClient.getQueryData<string[]>(['favorites']) ?? [];
      const next = favorited
        ? [...previous, offerId]
        : previous.filter((id) => id !== offerId);

      queryClient.setQueryData(['favorites'], next);
      setFavoriteError(null);

      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context) {
        queryClient.setQueryData(['favorites'], context.previous);
      }

      setFavoriteError(
        error instanceof Error ? error.message : 'Failed to save favorite.',
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  return {
    favoriteIds,
    favoriteError,
    toggleFavorite: (offerId: string, favorited: boolean) =>
      toggleFavoriteMutation.mutate({ offerId, favorited }),
  };
}

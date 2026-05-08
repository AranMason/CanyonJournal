import { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';

interface UseFavouriteOptions {
  canyonId?: number;
  userCanyonId?: number;
}

interface UseFavouriteResult {
  isFavourite: boolean;
  toggleFavourite: () => Promise<void>;
}

export function useFavourite({ canyonId, userCanyonId }: UseFavouriteOptions): UseFavouriteResult {
  const [isFavourite, setIsFavourite] = useState(false);

  useEffect(() => {
    if (!canyonId && !userCanyonId) return;
    apiFetch<{ CanyonId: number | null; UserCanyonId: number | null }[]>('/api/favourites')
      .then(favs => {
        if (canyonId) {
          setIsFavourite(favs.some(f => f.CanyonId === canyonId));
        } else {
          setIsFavourite(favs.some(f => f.UserCanyonId === userCanyonId));
        }
      });
  }, [canyonId, userCanyonId]);

  const toggleFavourite = async () => {
    const next = !isFavourite;
    setIsFavourite(next);
    try {
      await apiFetch('/api/favourites', {
        method: next ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          canyonId ? { CanyonId: canyonId } : { UserCanyonId: userCanyonId }
        ),
      });
    } catch {
      setIsFavourite(!next);
    }
  };

  return { isFavourite, toggleFavourite };
}

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Charity {
  name: string;
  url: string;
  cause: string;
}

interface FavoritesContextData {
  favorites: Charity[];
  toggleFavorite: (charity: Charity) => void;
  isFavorite: (name: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextData>({
  favorites: [],
  toggleFavorite: () => {},
  isFavorite: () => false,
});

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<Charity[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem('favorites');
        if (saved) {
          setFavorites(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Failed to load favorites', e);
      }
    };
    load();
  }, []);

  const toggleFavorite = (charity: Charity) => {
    setFavorites((prev) => {
      const exists = prev.find((c) => c.name === charity.name);
      const updated = exists
        ? prev.filter((c) => c.name !== charity.name)
        : [...prev, charity];
      AsyncStorage.setItem('favorites', JSON.stringify(updated)).catch((e) =>
        console.error('Failed to save favorites', e)
      );
      return updated;
    });
  };

  const isFavorite = (name: string) => favorites.some((c) => c.name === name);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);

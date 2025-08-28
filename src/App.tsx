// src/App.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { getNewMovieList, MovieData } from './api';
import VideoItem from './components/VideoItem'; // VideoItemコンポーネントは以前のものを使用
import './App.css';

const App: React.FC = () => {
  const [movies, setMovies] = useState<MovieData[]>([]);
  const [nextCursor, setNextCursor] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMoreLoading, setIsMoreLoading] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // (useEffectや他のロジックは以前のものと同じなので省略)
  useEffect(() => {
    chrome.storage.local.get(['movies', 'nextCursor'], (result) => {
      if (result.movies && result.movies.length > 0) {
        setMovies(result.movies);
        setNextCursor(result.nextCursor || '');
      }
      setIsLoading(false);
      setIsInitialized(true);
    });
  }, []);
  
  useEffect(() => {
    if (isInitialized) {
      chrome.storage.local.set({ movies, nextCursor });
    }
  }, [movies, nextCursor, isInitialized]);
  
  const fetchMovies = useCallback(async (cursor: string) => {
    try {
      const response = await getNewMovieList(cursor);
      setMovies((prevMovies) => cursor ? [...prevMovies, ...response.activities] : response.activities);
      setNextCursor(response.nextCursor);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  }, []);
  
  const handleReload = async () => {
    setIsLoading(true);
    setMovies([]);
    setNextCursor('');
    await fetchMovies('');
    setIsLoading(false);
  };
  
  const handleLoadMore = async () => {
    if (isMoreLoading || !nextCursor) return;
    setIsMoreLoading(true);
    await fetchMovies(nextCursor);
    setIsMoreLoading(false);
  };
  
  useEffect(() => {
    if (isInitialized && movies.length === 0) {
      handleReload();
    }
  }, [isInitialized]);


  return (
    <div className="app-container">
      <header>
        <button className="button button-primary" onClick={handleReload} disabled={isLoading}>
          {isLoading ? '読込中...' : 'リロード'}
        </button>
      </header>

      <main>
        {isLoading && movies.length === 0 ? (
          <div className="loading-indicator">データを読み込んでいます...</div>
        ) : (
          movies.map((movie) => (
            // VideoItemコンポーネントのルート要素のクラス名を 'video-card' に変更してください
            <VideoItem key={movie.content.id} movie={movie} />
          ))
        )}
      </main>

      {movies.length > 0 && nextCursor && (
        <footer>
          <button className="button" onClick={handleLoadMore} disabled={isMoreLoading}>
            {isMoreLoading ? '読込中...' : 'もっと読み込む'}
          </button>
        </footer>
      )}
    </div>
  );
};

export default App;
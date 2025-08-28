// src/App.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { getNewMovieList, MovieData } from './api';
import VideoItem from './components/VideoItem'; // VideoItemコンポーネントは以前のものを使用
import './App.css';


const ReloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z" />
    <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" />
  </svg>
);

const MoreIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
  </svg>
);

const App: React.FC = () => {
  const [movies, setMovies] = useState<MovieData[]>([]);
  const [nextCursor, setNextCursor] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMoreLoading, setIsMoreLoading] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

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
          <ReloadIcon />
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
          <button className="button button-secondary" onClick={handleLoadMore} disabled={isMoreLoading}>
            {isMoreLoading ? '読込中...' : 'もっと読み込む'}
            <MoreIcon />
          </button>
        </footer>
      )}
    </div>
  );
};

export default App;
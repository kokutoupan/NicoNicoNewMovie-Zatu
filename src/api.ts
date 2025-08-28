// src/api.ts

// APIからのレスポンスの型を定義
export interface MovieData {
  content: {
    id: string;
    title: string;
    startedAt: string;
    video: { duration: number; };
  };
  actor: {
    id: string;
    name: string;
    iconUrl: string;
  };
  thumbnailUrl: string;
}

export interface ApiResponse {
  activities: MovieData[];
  nextCursor: string;
}

export const getNewMovieList = async (cursor: string = ''): Promise<ApiResponse> => {
  const url = `https://api.feed.nicovideo.jp/v1/activities/followings/video?cursor=${cursor}&context=my_timeline`;
  const headers = {
    'x-frontend-id': '6',
    'x-frontend-version': '0',
  };

  const response = await fetch(url, {
    method: 'GET',
    headers: headers,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('API fetch failed');
  }
    
  console.log('API response received');

  return response.json();
};
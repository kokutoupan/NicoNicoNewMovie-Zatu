// src/components/VideoItem.tsx

import React, { useRef, useEffect } from 'react';
import { MovieData } from '../api';

interface VideoItemProps {
    movie: MovieData;
}

const VideoItem: React.FC<VideoItemProps> = ({ movie }) => {
    const imgRef = useRef<HTMLImageElement>(null);
    const actorImgRef = useRef<HTMLImageElement>(null);

    // IntersectionObserverを使った画像の遅延読み込み
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const lazyImage = entry.target as HTMLImageElement;
                        lazyImage.src = lazyImage.dataset.src || '';
                        observer.unobserve(lazyImage);
                    }
                });
            },
            { rootMargin: '0px 0px 200px 0px' } // 画面に近づいたら読み込む
        );

        if (imgRef.current) observer.observe(imgRef.current);
        if (actorImgRef.current) observer.observe(actorImgRef.current);

        return () => observer.disconnect();
    }, []);

    // リンククリック時にContent Scriptへメッセージを送信
    const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        if (event.ctrlKey || event.metaKey || event.button === 1) {
            return;
        }

        event.preventDefault();
        const href = event.currentTarget.href;
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
                chrome.tabs.sendMessage(tabs[0].id, { action: href });
            }
        });
    };

    const {
        content: { id, title, startedAt, video: { duration } },
        actor: { id: userId, name: userName, iconUrl: userIconUrl },
        thumbnailUrl,
    } = movie;

    const movieLength = `${Math.floor(duration / 60)}分${duration % 60}秒`;

    return (
        <div className="video-card">
            <h2 className="video-title">
                <a href={`https://www.nicovideo.jp/watch/${id}`} onClick={handleLinkClick}>
                    {title}
                </a>
            </h2>
            <div className="video-content">
                <a href={`https://www.nicovideo.jp/watch/${id}`} onClick={handleLinkClick} className="video-thumbnail">
                    <img ref={imgRef} data-src={thumbnailUrl} alt={title} className="lazy" />
                </a>
                <div className="video-details">
                    <a href={`https://www.nicovideo.jp/user/${userId}`} onClick={handleLinkClick}>
                        <div className="actor">
                            <img ref={actorImgRef} data-src={userIconUrl} alt={userName} className="lazy" />
                            <p>{userName}</p>
                        </div>
                    </a>
                    <p><strong>登録日:</strong> {new Date(startedAt).toLocaleString()}</p>
                    <p><strong>長さ:</strong> {movieLength}</p>
                </div>
            </div>
        </div>
    );
};

export default VideoItem;
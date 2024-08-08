"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
let outputDiv;
document.addEventListener('DOMContentLoaded', () => {
    outputDiv = document.getElementById('video-list');
    // 状態を復元する
    chrome.storage.local.get(['outputHTML'], (result) => {
        if (result.outputHTML) {
            outputDiv.innerHTML = result.outputHTML;
            const myButton = document.getElementById('myButton');
            if (myButton !== null) {
                myButton.innerText = "リロード";
            }
            lazyLoadImage();
        }
    });
});
(_a = document.getElementById('myButton')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
    // alert('Button clicked!');
    // chrome.runtime.sendMessage({ action: 'openPopup' });
    const myButton = document.getElementById('myButton');
    if (myButton !== null) {
        myButton.innerText = "読み込み中...";
        myButton.disabled = true;
    }
    chrome.storage.local.remove('outputHTML', function () {
        console.log('outputHTML has been removed');
    });
    while (outputDiv.firstChild) {
        outputDiv.removeChild(outputDiv.firstChild); // 最初の子要素を削除
    }
    console.log('Button clicked!');
    try {
        const items = yield getUserList();
        // console.log(response);
        //　動画IDのリストを取得
        const MovieIdList = yield processItems(items);
        // registeredAtでソートする関数
        MovieIdList.sort((a, b) => {
            const dateA = new Date(a.registeredAt);
            const dateB = new Date(b.registeredAt);
            // return dateA.getTime() - dateB.getTime(); // 昇順
            return dateB.getTime() - dateA.getTime(); // 降順
        });
        console.log(MovieIdList);
        for (let i = 0; i < 100 || i < MovieIdList.length; i++) {
            const movieId = MovieIdList[i].id;
            const movieUserName = MovieIdList[i].owner.name;
            const movieUserId = MovieIdList[i].owner.id;
            const movieTitle = MovieIdList[i].title;
            const movieRegisteredAt = MovieIdList[i].registeredAt;
            const movieThumbnailUrl = MovieIdList[i].thumbnail.url;
            const movieViewCounter = MovieIdList[i].count.view;
            const movieCommentCounter = MovieIdList[i].count.comment;
            const movieMylistCounter = MovieIdList[i].count.mylist;
            const movieLength = MovieIdList[i].duration;
            const movieDescription = MovieIdList[i].shortDescription;
            const movieElement = document.createElement('div');
            movieElement.innerHTML = `
            <div class="video-container">
                <h2 class="video-title"><a href="https://www.nicovideo.jp/watch/${movieId}" target="_blank">${movieTitle}</a></h2>
                <div class="video-content">
                    <a href="https://www.nicovideo.jp/watch/${movieId}" target="_blank" class="video-thumbnail">
                        <img class="lazy" data-src="${movieThumbnailUrl}" alt="${movieTitle}">
                    </a>
                    <div class="video-details">
                        <a href="https://www.nicovideo.jp/user/${movieUserId}" target="_blank"><p><strong>投稿者:</strong> ${movieUserName}</p></a>
                        <p><strong>登録日:</strong> ${movieRegisteredAt}</p>
                        <p><strong>再生数:</strong> ${movieViewCounter}</p>
                        <p><strong>コメント数:</strong> ${movieCommentCounter}</p>
                        <p><strong>マイリスト数:</strong> ${movieMylistCounter}</p>
                        <p><strong>長さ:</strong> ${movieLength}</p>
                        <p>${movieDescription}</p>
                    </div>
                </div>
            </div>
        `;
            movieElement.className = 'video-container';
            // movieElement.innerText = movieTitle;
            outputDiv.appendChild(movieElement);
        }
        document.getElementById('myButton').innerText = "リロード";
    }
    catch (error) {
        console.error('Fetch error: ', error);
    }
    lazyLoadImage();
    chrome.storage.local.set({ outputHTML: outputDiv.innerHTML });
    myButton.disabled = false;
    // console.log('Button clicked! end');
}));
function getUserList() {
    return __awaiter(this, void 0, void 0, function* () {
        // フォローしているユーザーの情報を取得
        const url = 'https://nvapi.nicovideo.jp/v1/users/me/following/users?pageSize=';
        const headers = {
            'x-frontend-id': '6',
            'x-frontend-version': '0',
            'Content-Type': 'application/json' // 非標準のコンテンツタイプ
        };
        let response = yield fetch(url + "1", {
            method: 'GET', // GETメソッドを使用
            headers: headers,
            credentials: 'include' // クッキーを送信
        }).then(response => response.json());
        // console.log(response.data);
        const followeesCount = response.data.summary.followees;
        response = yield fetch(url + String(followeesCount), {
            method: 'GET', // GETメソッドを使用
            headers: headers,
            credentials: 'include' // クッキーを送信
        }).then(response => response.json());
        return response.data.items;
    });
}
function getMovieIdList(userID) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `https://nvapi.nicovideo.jp/v3/users/${userID}/videos?sortKey=registeredAt&sortOrder=desc&sensitiveContents=mask&pageSize=10&page=1`;
        const headers = {
            'x-frontend-id': '6',
            'x-frontend-version': '0',
            'Content-Type': 'application/json' // 非標準のコンテンツタイプ
        };
        const res = yield fetch(url, {
            method: 'GET', // GETメソッドを使用
            headers: headers,
            credentials: 'include' // クッキーを送信
        })
            .then(response => response.json())
            .then(data => data.data.items);
        const MovieIdList = new Array();
        res.forEach((elem) => {
            MovieIdList.push(elem.essential);
        });
        return MovieIdList;
    });
}
function processItems(items) {
    return __awaiter(this, void 0, void 0, function* () {
        // itemsの各要素に対して非同期処理を行い、その結果をPromiseとして取得
        const promises = items.map((elem) => __awaiter(this, void 0, void 0, function* () {
            console.log(elem.id);
            // getMovieIdListの結果をMovieIdListに追加
            return yield getMovieIdList(elem.id);
        }));
        // 全てのPromiseが解決するのを待つ
        // 二次元配列をフラット化するために reduce を使用
        const results = (yield Promise.all(promises)).reduce((acc, val) => acc.concat(val), []);
        // 全ての結果を結合してMovieIdListに設定
        return results;
    });
}
function lazyLoadImage() {
    const lazyImages = document.querySelectorAll('img.lazy');
    if ("IntersectionObserver" in Window) {
        const lazyImageObserver = new IntersectionObserver(function (entries, observer) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    const lazyImage = entry.target;
                    if (lazyImage.dataset.src === undefined) {
                        return;
                    }
                    lazyImage.src = lazyImage.dataset.src;
                    lazyImage.classList.remove("lazy");
                    lazyImageObserver.unobserve(lazyImage);
                }
            });
        });
        lazyImages.forEach(function (lazyImage) {
            lazyImageObserver.observe(lazyImage);
        });
    }
    else {
        // Fallback for browsers that don't support IntersectionObserver
        let lazyLoad = function () {
            lazyImages.forEach(function (img) {
                if (img.getBoundingClientRect().top < window.innerHeight && img.getBoundingClientRect().bottom > 0 && img.dataset.src !== undefined) {
                    img.src = img.dataset.src;
                    img.classList.remove("lazy");
                    chrome.storage.local.set({ outputHTML: outputDiv.innerHTML });
                }
            });
            if (lazyImages.length == 0) {
                document.removeEventListener("scroll", lazyLoad);
                window.removeEventListener("resize", lazyLoad);
                window.removeEventListener("orientationchange", lazyLoad);
            }
        };
        document.addEventListener("scroll", lazyLoad);
        window.addEventListener("resize", lazyLoad);
        window.addEventListener("orientationchange", lazyLoad);
    }
}
console.log('Content script loaded');

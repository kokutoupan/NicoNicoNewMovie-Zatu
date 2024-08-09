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
let outputDiv;
let countMovieIndex = 0;
let nextCursor = '';
document.addEventListener('DOMContentLoaded', () => {
    var _a, _b;
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
            const moreButton = document.getElementById('moreButton');
            moreButton.hidden = false;
            const links = outputDiv.querySelectorAll('a');
            setAnchorTag(links);
        }
    });
    chrome.storage.local.get(['countMovieIndex'], (result) => {
        if (result.countMovieIndex) {
            countMovieIndex = result.countMovieIndex;
        }
    });
    chrome.storage.local.get(['nextCursor'], (result) => {
        if (result.nextCursor) {
            nextCursor = result.nextCursor;
        }
    });
    // console.log(document.getElementById('moreButton'));
    (_a = document.getElementById('moreButton')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
        countMovieIndex += 1;
        console.log('More Button clicked!' + countMovieIndex);
        const moreButton = document.getElementById('moreButton');
        if (moreButton !== null) {
            moreButton.innerText = "読み込み中...";
            moreButton.disabled = true;
        }
        try {
            const MovieIdList = yield getNewMovieList();
            addMovieListToDiv(MovieIdList);
            chrome.storage.local.set({ nextCursor: nextCursor });
            chrome.storage.local.set({ countMovieIndex: countMovieIndex });
        }
        catch (error) {
            console.error('Fetch error: ', error);
        }
        moreButton.innerText = "もっと読み込む";
        lazyLoadImage();
        chrome.storage.local.set({ outputHTML: outputDiv.innerHTML });
        moreButton.disabled = false;
    }));
    (_b = document.getElementById('myButton')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
        // alert('Button clicked!');
        // chrome.runtime.sendMessage({ action: 'openPopup' });
        const myButton = document.getElementById('myButton');
        if (myButton !== null) {
            myButton.innerText = "読み込み中...";
            myButton.disabled = true;
        }
        // outputHTMLを削除
        chrome.storage.local.remove('outputHTML', function () {
            console.log('outputHTML has been removed');
        });
        while (outputDiv.firstChild) {
            outputDiv.removeChild(outputDiv.firstChild); // 最初の子要素を削除
        }
        countMovieIndex = 0;
        nextCursor = '';
        console.log('Button clicked!');
        try {
            // const items = await getUserList();
            // console.log(response);
            //　動画IDのリストを取得
            const MovieIdList = yield getNewMovieList();
            addMovieListToDiv(MovieIdList);
            chrome.storage.local.set({ nextCursor: nextCursor });
            chrome.storage.local.set({ countMovieIndex: countMovieIndex });
            document.getElementById('myButton').innerText = "リロード";
        }
        catch (error) {
            console.error('Fetch error: ', error);
        }
        lazyLoadImage();
        chrome.storage.local.set({ outputHTML: outputDiv.innerHTML });
        myButton.disabled = false;
        const moreButton = document.getElementById('moreButton');
        moreButton.hidden = false;
        // console.log('Button clicked! end');
    }));
});
// ユーザーのフォローしているユーザーの情報を取得
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
function getNewMovieList() {
    return __awaiter(this, void 0, void 0, function* () {
        const url = 'https://api.feed.nicovideo.jp/v1/activities/followings/video?cursor=' + nextCursor + '&context=my_timeline';
        console.log(url);
        const headers = {
            'x-frontend-id': '6',
            'x-frontend-version': '0',
            'Content-Type': 'application/json' // 非標準のコンテンツタイプ
        };
        let response = yield fetch(url, {
            method: 'GET', // GETメソッドを使用
            headers: headers,
            credentials: 'include' // クッキーを送信
        }).then(response => response.json());
        nextCursor = response.nextCursor;
        return response.activities;
    });
}
function addMovieListToDiv(MovieIdList) {
    for (let i = 0; i < MovieIdList.length; i++) {
        const movieId = MovieIdList[i].content.id;
        const movieUserName = MovieIdList[i].actor.name;
        const movieUserId = MovieIdList[i].actor.id;
        const movieUserIconUrl = MovieIdList[i].actor.iconUrl;
        const movieTitle = MovieIdList[i].content.title;
        const movieRegisteredAt = MovieIdList[i].content.startedAt;
        const movieThumbnailUrl = MovieIdList[i].thumbnailUrl;
        // const movieViewCounter = MovieIdList[i].count.view;
        // const movieCommentCounter = MovieIdList[i].count.comment;
        // const movieMylistCounter = MovieIdList[i].count.mylist;
        const movieLength = MovieIdList[i].content.video.duration;
        // const movieDescription = MovieIdList[i].shortDescription;
        const movieElement = document.createElement('div');
        movieElement.innerHTML = `
        <div class="video-container">
            <h2 class="video-title"><a href="https://www.nicovideo.jp/watch/${movieId}" target="_blank">${movieTitle}</a></h2>
            <div class="video-content">
                <a href="https://www.nicovideo.jp/watch/${movieId}" target="_blank" class="video-thumbnail">
                    <img class="lazy" data-src="${movieThumbnailUrl}" alt="${movieTitle}">
                </a>
                <div class="video-details">
                    <a href="https://www.nicovideo.jp/user/${movieUserId}" target="_blank"><div class="actor"><img class="lazy" data-src="${movieUserIconUrl}" alt="${movieUserName}"><p> ${movieUserName}</p></div></a>
                    <p><strong>登録日:</strong> ${movieRegisteredAt}</p>
                    <p><strong>長さ:</strong> ${Math.floor(movieLength / 60)}分${movieLength % 60}秒</p>
                </div>
            </div>
        </div>
    `;
        movieElement.className = 'video-container';
        const links = movieElement.querySelectorAll('a');
        setAnchorTag(links);
        // movieElement.innerText = movieTitle;
        outputDiv.appendChild(movieElement);
    }
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
function setAnchorTag(links) {
    links.forEach(function (link) {
        link.addEventListener('click', function (event) {
            event.preventDefault(); // デフォルトのリンクの動作を防止
            const action = link.href;
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                if (tabs.length > 0 && tabs[0].id !== undefined) {
                    chrome.tabs.sendMessage(tabs[0].id, { action: action }, function (response) {
                        if (chrome.runtime.lastError) {
                            console.error(chrome.runtime.lastError.message);
                        }
                        else {
                            console.log(response.result);
                        }
                    });
                }
                else {
                    console.error('No active tab found or tab ID is undefined.');
                }
            });
        });
    });
}
console.log('Content script loaded');

let outputDiv: HTMLDivElement;
let countMovieIndex = 0;
let nextCursor = '';

document.addEventListener('DOMContentLoaded', () => {
    outputDiv = document.getElementById('video-list') as HTMLDivElement
    // 状態を復元する
    chrome.storage.local.get(['outputHTML'], (result) => {
        if (result.outputHTML) {
            outputDiv.innerHTML = result.outputHTML;
            const myButton = document.getElementById('myButton');
            if (myButton !== null) {
                myButton.innerText = "リロード";
            }
            lazyLoadImage();
            const moreButton = document.getElementById('moreButton') as HTMLButtonElement;
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
    document.getElementById('moreButton')?.addEventListener('click', async () => {
        countMovieIndex += 1;

        console.log('More Button clicked!' + countMovieIndex);
        const moreButton = document.getElementById('moreButton') as HTMLButtonElement;
        if (moreButton !== null) {
            moreButton.innerText = "読み込み中...";
            moreButton.disabled = true;
        }

        try {
            const MovieIdList = await getNewMovieList();
            addMovieListToDiv(MovieIdList);
            chrome.storage.local.set({ nextCursor: nextCursor });
            chrome.storage.local.set({ countMovieIndex: countMovieIndex });
        } catch (error) {
            console.error('Fetch error: ', error);
        }
        moreButton.innerText = "もっと読み込む";
        lazyLoadImage();
        chrome.storage.local.set({ outputHTML: outputDiv.innerHTML });

        moreButton.disabled = false;
    });

    document.getElementById('myButton')?.addEventListener('click', async () => {
        // alert('Button clicked!');
        // chrome.runtime.sendMessage({ action: 'openPopup' });
        const myButton = document.getElementById('myButton') as HTMLButtonElement;
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
            const MovieIdList = await getNewMovieList();
            addMovieListToDiv(MovieIdList);
            chrome.storage.local.set({ nextCursor: nextCursor });
            chrome.storage.local.set({ countMovieIndex: countMovieIndex });

            document.getElementById('myButton')!.innerText = "リロード";

        } catch (error) {
            console.error('Fetch error: ', error);
        }
        lazyLoadImage();
        chrome.storage.local.set({ outputHTML: outputDiv.innerHTML });

        myButton.disabled = false;
        const moreButton = document.getElementById('moreButton') as HTMLButtonElement;
        moreButton.hidden = false;
        // console.log('Button clicked! end');
    });

});

// ユーザーのフォローしているユーザーの情報を取得
async function getUserList(): Promise<Array<any>> {
    // フォローしているユーザーの情報を取得
    const url = 'https://nvapi.nicovideo.jp/v1/users/me/following/users?pageSize=';

    const headers = {
        'x-frontend-id': '6',
        'x-frontend-version': '0',
        'Content-Type': 'application/json' // 非標準のコンテンツタイプ
    };

    let response = await fetch(url + "1", {
        method: 'GET', // GETメソッドを使用
        headers: headers,
        credentials: 'include' // クッキーを送信
    }).then(response => response.json());

    // console.log(response.data);
    const followeesCount: number = response.data.summary.followees;

    response = await fetch(url + String(followeesCount), {
        method: 'GET', // GETメソッドを使用
        headers: headers,
        credentials: 'include' // クッキーを送信
    }).then(response => response.json())
    return response.data.items;
}


async function getMovieIdList(userID: String): Promise<Array<any>> {
    const url = `https://nvapi.nicovideo.jp/v3/users/${userID}/videos?sortKey=registeredAt&sortOrder=desc&sensitiveContents=mask&pageSize=10&page=1`;

    const headers = {
        'x-frontend-id': '6',
        'x-frontend-version': '0',
        'Content-Type': 'application/json' // 非標準のコンテンツタイプ
    };

    const res = await fetch(url, {
        method: 'GET', // GETメソッドを使用
        headers: headers,
        credentials: 'include' // クッキーを送信
    })
        .then(response => response.json())
        .then(data => data.data.items)

    const MovieIdList: Array<any> = new Array();
    res.forEach((elem: any) => {
        MovieIdList.push(elem.essential);
    });

    return MovieIdList;
}

async function processItems(items: Array<any>) {
    // itemsの各要素に対して非同期処理を行い、その結果をPromiseとして取得
    const promises = items.map(async (elem: any) => {
        console.log(elem.id);
        // getMovieIdListの結果をMovieIdListに追加
        return await getMovieIdList(elem.id);
    });

    // 全てのPromiseが解決するのを待つ
    // 二次元配列をフラット化するために reduce を使用
    const results = (await Promise.all(promises)).reduce((acc, val) => acc.concat(val), []);

    // 全ての結果を結合してMovieIdListに設定
    return results;
}

async function getNewMovieList(): Promise<Array<any>> {
    const url = 'https://api.feed.nicovideo.jp/v1/activities/followings/video?cursor=' + nextCursor + '&context=my_timeline';
    console.log(url);

    const headers = {
        'x-frontend-id': '6',
        'x-frontend-version': '0',
        'Content-Type': 'application/json' // 非標準のコンテンツタイプ
    };

    let response = await fetch(url, {
        method: 'GET', // GETメソッドを使用
        headers: headers,
        credentials: 'include' // クッキーを送信
    }).then(response => response.json());
    nextCursor = response.nextCursor;
    return response.activities;
}

function addMovieListToDiv(MovieIdList: Array<any>) {
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
    const lazyImages = document.querySelectorAll('img.lazy') as NodeListOf<HTMLImageElement>;
    if ("IntersectionObserver" in Window) {
        const lazyImageObserver = new IntersectionObserver(function (entries, observer) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    const lazyImage = entry.target as HTMLImageElement;
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
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        let lazyLoad = function () {
            lazyImages.forEach(function (img: HTMLImageElement) {
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

function setAnchorTag(links: NodeListOf<HTMLAnchorElement>) {
    links.forEach(function (link) {

        link.addEventListener('click', function (event) {
            event.preventDefault();  // デフォルトのリンクの動作を防止

            const action = link.href;
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                if (tabs.length > 0 && tabs[0].id !== undefined) {
                    chrome.tabs.sendMessage(tabs[0].id, { action: action }, function (response) {
                        if (chrome.runtime.lastError) {
                            console.error(chrome.runtime.lastError.message);
                        } else {
                            console.log(response.result);
                        }
                    });
                } else {
                    console.error('No active tab found or tab ID is undefined.');
                }
            });
        });
    });
}
console.log('Content script loaded');

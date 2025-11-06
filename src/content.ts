import './style.css';

// --- 1. モーダルとオーバーレイの要素を生成してページに追加 ---

const MODAL_ID = 'niconico-extension-modal';
const OVERLAY_ID = 'niconico-extension-overlay';
const IFRAME_ID = 'niconico-extension-modal-iframe';
const CLOSE_BUTTON_ID = 'niconico-extension-modal-close';

const overlay = document.createElement('div');
overlay.id = OVERLAY_ID;
document.body.appendChild(overlay);

const modal = document.createElement('div');
modal.id = MODAL_ID;

const closeButton = document.createElement('button');
closeButton.id = CLOSE_BUTTON_ID;
closeButton.innerHTML = '&times;';
modal.appendChild(closeButton);

const iframe = document.createElement('iframe');
iframe.id = IFRAME_ID;
iframe.src = chrome.runtime.getURL('popup.html');
modal.appendChild(iframe);

document.body.appendChild(modal);

// --- 2. モーダルの表示/非表示を制御する関数 ---

const showModal = () => {
    overlay.classList.add('visible');
    modal.classList.add('visible');
};

const hideModal = () => {
    overlay.classList.remove('visible');
    modal.classList.remove('visible');
};

closeButton.addEventListener('click', hideModal);
overlay.addEventListener('click', hideModal);

// --- 3. ヘッダーにボタンを挿入するロジック ---

const HEADER_SELECTOR = '#CommonHeader > div > div > div > div.common-header-wb7b82';
const BUTTON_ID = 'niconico-extension-header-button';

const injectButton = (): boolean => {
    const headerContainer = document.querySelector(HEADER_SELECTOR);

    if (headerContainer && !document.getElementById(BUTTON_ID)) {
        console.log('Niconico Extension: Header found. Injecting button.');

        const extensionButton = document.createElement('button');
        extensionButton.id = BUTTON_ID;
        extensionButton.innerText = '拡張機能';
        extensionButton.className = 'CommonHeader--primaryButton CommonHeader---user';

        extensionButton.addEventListener('click', (e) => {
            e.stopPropagation();
            modal.classList.contains('visible') ? hideModal() : showModal();
        });

        headerContainer.appendChild(extensionButton);
        return true;
    }
    return false;
};

// --- 4. ページ読み込み時の初期チェックと MutationObserver の設定 ---

if (!injectButton()) {
    console.log('Niconico Extension: Header not found immediately. Starting MutationObserver.');
    const observer = new MutationObserver((mutations, obs) => {
        if (injectButton()) {
            console.log('Niconico Extension: Button injected via MutationObserver. Stopping observer.');
            obs.disconnect();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// --- 5. iframeからのメッセージをリッスンし、ページ遷移を実行 ---
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // メッセージが 'navigate' 型で、URLが含まれていることを確認
    if (message.type === 'navigate' && message.url) {
        console.log(`Niconico Extension: Navigating to ${message.url}`);
        // モーダルを閉じる
        hideModal();
        // 現在のタブのURLをメッセージ内のURLに変更
        window.location.href = message.url;
        // メッセージが処理されたことを示すためにtrueを返す
        sendResponse({ status: 'ok' });
    }
    return true; // 非同期応答のためにtrueを返す
});

console.log('Niconico Extension: content.ts loaded.');

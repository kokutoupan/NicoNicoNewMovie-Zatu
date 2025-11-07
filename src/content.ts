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
const iframeSrc = chrome.runtime.getURL('popup.html');
iframe.src = iframeSrc;
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

// BUG: ヘッダーのセレクターが非常に壊れやすい。サイトのアップデートで動かなくなる可能性が高い。
const HEADER_SELECTOR = '#CommonHeader > div > div > div > div.common-header-wb7b82';
const BUTTON_ID = 'niconico-extension-header-button';

const injectButton = (): boolean => {
    const headerContainer = document.querySelector(HEADER_SELECTOR);

    if (headerContainer && !document.getElementById(BUTTON_ID)) {
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
    const observer = new MutationObserver((mutations, obs) => {
        if (injectButton()) {
            obs.disconnect();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// --- 5. iframeからのpostMessageをリッスンし、ページ遷移を実行 ---
window.addEventListener('message', (event) => {
    // セキュリティのため、メッセージのオリジンが自身の拡張機能であることを確認
    if (event.origin !== new URL(iframeSrc).origin) {
        return;
    }

    const data = event.data;

    // メッセージの形式が正しいことを確認
    if (data.type === 'niconico-extension-navigate' && data.url) {
        hideModal();
        window.location.href = data.url;
    }
});

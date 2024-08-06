window.addEventListener('load', () => {
    const button = document.createElement('button');
    button.textContent = 'ポップアップを表示';
    button.style.position = 'absolute';
    button.style.top = '100px';
    button.style.right = '20%';
    button.style.zIndex = '100';
    button.style.padding = '10px';
    button.style.backgroundColor = '#ff8c00';
    button.style.color = '#f00';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    document.body.appendChild(button);

    button.addEventListener('click', async () => {
        chrome.runtime.sendMessage({ action: 'openPopup' });
        return ;
    });
});
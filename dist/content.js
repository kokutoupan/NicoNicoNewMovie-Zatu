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
    button.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
        chrome.runtime.sendMessage({ action: 'openPopup' });
        return;
    }));
});

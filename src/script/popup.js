"use strict";

const run_on_hostTab = (command, ind_info) => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const url = tabs[0].url;
        if (!url.startsWith("https://www.db.yugioh-card.com/yugiohdb")) return;
        chrome.scripting.executeScript({
            target: {tabId: tabs[0].id},
            function: (command, ind_info) => {
                if (command === "saveDeckScreenshot") {
                    saveDeckScreenshot({button: ind_info});
                }
            },
            args: [command, ind_info],
        });
    });
}

window.onload = async function () {
    // const stored_config = await getSyncStorage(["popup_config"]);
    // let popup_config = Object.assign({cols: 4}, stored_config.popup_config || {});
    // const input_cols = document.getElementById("cols");
    // input_cols.value = popup_config.cols;    
    // const div_result = document.getElementById("result");
    document.addEventListener('mousedown', async function (e) {
        if (e.target.matches(".button-screenshot") ) {
            const color_index = e.target.classList.contains("screenshot-red") ? 0: 1;
            run_on_hostTab("saveDeckScreenshot", color_index);
        }
    });
}
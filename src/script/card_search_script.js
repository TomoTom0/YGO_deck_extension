"use strict";

const CACHE_DAYS = 7;

const _obtainDeckRecipie = async (cgid, dno, lang, ope = "2") => {
    const url = `https://www.db.yugioh-card.com/yugiohdb/member_deck.action?ope=${ope}&cgid=${cgid}&dno=${dno}&request_locale=${lang}`;
    const body = await obtainStreamBody(url);
    //const deck_text=$("#deck_text", body);
    return { text: $("#deck_text", body), image: $("#deck_image", body), header: $("#deck_header", body), title: $("#broad_title", body), body: body };
}

const _nojqObtainDeckRecipie = async (cgid, dno, lang, ope = "2") => {
    const url = `https://www.db.yugioh-card.com/yugiohdb/member_deck.action?ope=${ope}&cgid=${cgid}&dno=${dno}&request_locale=${lang}`;
    const body = parseHTML(await obtainStreamBody(url));
    //const deck_text=$("#deck_text", body);
    return {
        text: body.querySelector("#deck_text"),
        image: body.querySelector("#deck_image"),
        header: body.querySelector("#deck_header"),
        title: body.querySelector("#broad_title"),
        body: body
    };
}

const obtainDeckRecipie = async () => {
    const my_cgid = obtainMyCgid();
    const lang = obtainLang();
    const dno_tmp = $("#keyword").val().match(/#(\d+)$/);
    if (dno_tmp.length < 2) return null;
    const dno = dno_tmp[1];
    const deck_body = await _nojqObtainDeckRecipie(my_cgid, dno, lang, "1");
    const deck_text = deck_body.text;
    console.log(deck_text);
    // const rowResults = await obtainRowResults(null, null, deck_text);
    const card_list = $("<div>", { id: "card_list" });
    Array.from(deck_text.querySelectorAll("table.deck_list>tbody>tr")).map(tr => {
        const t_row = $("<span>", { class: "t_row" }).append($("<div>", { class: "box_card_img" }));
        const input_link = tr.querySelector("td.card_name>input");
        const span_card_name = tr.querySelector("td.card_name>div>span");
        if (span_card_name == null) return;
        const img = $("<img>", { title: span_card_name.textContent, style: "padding: 1px;width:100%;" });
        $("div.box_card_img", t_row).append(img);
        $(t_row).css({ "max-width": " 10%" });
        $(t_row).append(input_link);
        card_list.append(t_row);
    })
    $(card_list).css({ display: "flex", "flex-wrap": "wrap" });
    //console.log(body)
    return card_list;
}

// # -----info area-------

const showInfoHistory = async (modal) => {
    const urlHistory = await operateStorage({ urlHistory: JSON.stringify({}) }, "local", "get"
    ).then(items => Object.assign({ urlTitles: [], pos: -1 }, JSON.parse(items.urlHistory)));

    const pos = urlHistory.pos;
    const infos = urlHistory.urlTitles.map((d, ind) => [d, ind]
    ).filter(([d, ind]) => pos - 2 <= ind && ind <= pos + 2);
    // const pos_min = (urlTitles.length >= 4) ? pos - 2 : 0;
    // const pos_max = (urlTitles)


    // .slice(Math.max(0, pos - 3), pos + 3);
    const div_history = document.createElement("div");
    div_history.setAttribute("class", "info_history area_history will-appear");
    // div_history.style.position = "fixed";
    div_history.style.display = "flex";
    // div_history.style.top = `${co[0]}px`;
    // div_history.style.left = `${co[1]}px`;
    const div_titles = infos.map(([info, ind]) => {
        const div = document.createElement("div");
        const div_num = document.createElement("div");
        // div_num.setAttribute("class", "item_history");
        const span_num = document.createElement("span");
        span_num.append(ind);
        div_num.append(span_num);
        const div_item = document.createElement("span");
        // console.log(info)

        div_item.append(info.title);
        div_item.setAttribute("_href", info.url);
        div_item.setAttribute("pos_diff", ind - pos);
        div_item.setAttribute("class", "main_info_history");
        div.append(div_num);
        // div.append(document.querySelector("br"));
        div.append(div_item);
        if (ind === pos) {
            div.setAttribute("class", "item_history info_history present");
        } else {
            div.setAttribute("class", "item_history info_history");
        }
        div.style.flex = "1 1 50px"
        div_history.append(div);
    });
    // document.querySelector("#bg").append(div_history);
    modal.append(div_history);

    // console.log(infos)
}


const backNextInfoArea = async (change = -1) => {
    operateStorage({ urlHistory: JSON.stringify({}) }, "local", "get"
    ).then(items => Object.assign({ urlTitles: [], pos: -1 }, JSON.parse(items.urlHistory))
    ).then(urlHistory => {
        const pos = urlHistory.pos;
        const pos_new = pos + change;
        // console.log(pos_new)
        // urlHistory.urls.push(url_text);
        // console.log(pos_new, urlHistory.urls)
        if (pos_new < 0 || pos_new >= urlHistory.urlTitles.length) return null;
        urlHistory.pos = pos_new;
        const url = urlHistory.urlTitles[pos_new].url;
        // console.log(JSON.stringify(urlHistory))
        openUrlInfoArea(url, CACHE_DAYS, false);
        operateStorage({ urlHistory: JSON.stringify(urlHistory) }, "local", "set");
    })
}

const addUrlHistory = async (url, title) => {
    operateStorage({ urlHistory: JSON.stringify({}) }, "local", "get"
    ).then(items => Object.assign({ pos: -1, urlTitles: [] }, JSON.parse(items.urlHistory))
    ).then(urlHistory => {
        const pos = Math.min(urlHistory.pos, urlHistory.urlTitles.length - 1);
        urlHistory.urlTitles = urlHistory.urlTitles.slice(0, pos + 1);

        if (urlHistory.urlTitles.length > 0 && urlHistory.urlTitles[pos].url === url) return;
        urlHistory.pos = pos + 1;
        urlHistory.urlTitles.push({ url: url, title: title });
        operateStorage({ urlHistory: JSON.stringify(urlHistory) }, "local", "set");
    })

}

// ## open url info area

const openUrlInfoArea = async (url_in, days = CACHE_DAYS, history_add = true, key_in = null, params_in = null) => {
    const info_dics = {
        faq: {
            // func: openFaqInfoArea,
            patterns: [
                {
                    conds: [/faq_search.action\?/, /ope=5/],
                    args: [/(fid)=(\d+)/]
                }],
            obtainUrl: params => joinUrl(
                "https://www.db.yugioh-card.com/yugiohdb/faq_search.action",
                Object.assign({ ope: 5, keyword: "", tag: -1 }, params))
        },
        text: {
            // func: openCardInfoArea,
            patterns: [
                {
                    conds: [/card_search.action\?/, /ope=2/],
                    args: [/(cid)=(\d+)/]
                }, {
                    conds: [/faq_search.action\?/, /ope=4/],
                    args: [/(cid)=(\d+)/]
                }],
            obtainUrl: params => joinUrl(
                "https://www.db.yugioh-card.com/yugiohdb/card_search.action",
                Object.assign({ ope: 2, mode: 1, sess: 4, rp: 2000 }, params))
        },
        product: {
            // func: openProductInfoArea,
            patterns: [
                {
                    conds: [/card_search.action\?/, /ope=1/, /sess=1/],
                    args: [/(pid)=(\d+)/]
                }
            ],
            obtainUrl: params => joinUrl(
                "https://www.db.yugioh-card.com/yugiohdb/card_search.action",
                Object.assign({ ope: 1, rp: 99999, sess: 1 }, params))
        }
    }
    const header = document.getElementById("deck_header");
    // const form = document.getElementById("form_regist");
    // const info_area = document.getElementById("info_area");
    if (header.matches("#info_area *")) return;

    for (const [key, info] of Object.entries(info_dics)) {
        for (const pattern of info.patterns) {
            if ((key !== key_in) &&
                !(pattern.conds.every(d => d.test(url_in)) &&
                    pattern.args.every(d => d.test(url_in)))) {
                continue;
            }
            const params = params_in || Object.assign(
                ...pattern.args.map(d => Object(
                    { [url_in.match(d)[1]]: url_in.match(d)[2] }
                )));
            const url = info.obtainUrl(params);
            const info_div = document.querySelector("#info_area>div");
            const info_url = info_div.getAttribute("info_url");

            if (info_url === url) {
                if (info_div.style.display !== "none") toggleUndisplayElms([info_div]);
                else return;
            }
            const cacheInfos = await operateStorage({ cacheInfos: JSON.stringify({}) }, "local")
                .then(items => Object.assign({}, JSON.parse(items.cacheInfos)));
            if (days > 0 &&
                Object.keys(cacheInfos).indexOf(url) !== -1 &&
                cacheInfos[url].time + days * 86400 * 1000 > Date.now()) {

                info_div.innerHTML = cacheInfos[url].html;
                info_div.scrollTo(0, 0, "smooth");
            } else {
                info_div.setAttribute("info_url", url);
                _openUrlInfoArea(url, key, params).then((title) => {
                    info_div.scrollTo(0, 0, "smooth");
                    if (history_add === true) addUrlHistory(url, title);

                });
            }
            break;
        }
    }
}

const _openUrlInfoArea = async (url, key, params = {}) => {
    const info_div = document.querySelector("#info_area>div");

    const cacheInfos = await operateStorage({ cacheInfos: JSON.stringify({}) }, "local")
        .then(items => Object.assign({}, JSON.parse(items.cacheInfos)));

    // const df = await obtainDF();
    const doc_article = await obtainParsedHTML(url);
    const div_article = doc_article.querySelector("#article_body");
    div_article.setAttribute("id", `info_${key}`);
    div_article.classList.add("info_article");

    div_article.style.display = "block";
    const validIds_text_dic = {
        product: ["card_list"],
        faq: ["qa_box"],
        text: ["CardSet", "update_list", "relationCard"]
    }
    const validIds_text = validIds_text_dic[key];
    for (const elm of Array.from(div_article.children)) {
        if (validIds_text.indexOf(elm.id) !== -1) continue;
        elm.remove();
    }
    for (const elm of div_article.querySelectorAll("a")) {
        elm.setAttribute("_href", elm.getAttribute("href"));
        elm.removeAttribute("href");
    }

    let article_text = "";
    if (["product", "faq"].indexOf(key) !== -1) {
        const broad_title = document.createElement("div");
        broad_title.setAttribute("id", "broad_title");
        broad_title.innerHTML = doc_article.querySelector("header#broad_title").innerHTML;
        article_text += broad_title.outerHTML
    }
    const title = (doc_article.querySelector("meta[name='title']") ||
        doc_article.querySelector("meta[property='og:title']")
    ).getAttribute("content").replace(
        / \| 遊戯王 オフィシャルカードゲーム デュエルモンスターズ - カードデータベース/,
        "");
    if (key === "text") {
        const ul = `<div id="faq" class="tablink">
            <ul>
                <li class="1 now"><span>Text</span></li>
                <li class="2"><span>FAQ</span></li>
            </ul>
            <select id="text_qa" name="text_qa">
                <option value="1">Text</option>
                <option value="2">FAQ</option>
            </select>
        </div>\n`;
        article_text += ul +
            (await _convertDivText(div_article, params.cid)).outerHTML +
            (await _obtainFaqForText(params.cid)).outerHTML;
    } else {
        if (div_article.querySelector("#card_list") !== null) {
            const div_article_new = await remakeSearchResult(div_article);
            article_text += div_article_new.outerHTML;
        } else {
            article_text += div_article.outerHTML;
        }
    }
    info_div.innerHTML = article_text;

    const cacheInfos_new = Object.assign(
        cacheInfos,
        { [url]: { html: info_div.innerHTML, time: Date.now(), title: title } });
    operateStorage({ cacheInfos: JSON.stringify(cacheInfos_new) }, "local", "set"); // await
    return title;
}

const _convertDivText = async (div_text, cid) => {
    const df = await obtainDF();

    div_text.querySelector("#CardSet>div.bottom").remove();

    const card_text_frames = div_text.querySelectorAll("#CardTextSet > div.CardText:first-child > div.frame");
    if (card_text_frames !== null && card_text_frames.length >= 3) { } {
        const div_frame = card_text_frames[0];
        const div_frame_new = document.createElement("div");
        div_frame_new.setAttribute("class", "frame imgset");
        if (div_frame.children[1] !== undefined) {
            div_frame_new.append(div_frame.children[1]);
            div_frame.after(div_frame_new);
        }
    }

    const cardImgSet = div_text.querySelector("#CardImgSet");
    cardImgSet.style.width = "50%";
    cardImgSet.style["max-width"] = "100%";
    cardImgSet.querySelector("div#card_frame>div.set").style.background = "#ffffff";
    const img = cardImgSet.querySelector("div#card_frame>div.set>a>img");
    img.classList.remove("none");
    const card_url = joinUrl("/yugiohdb/card_search.action", { ope: 2, cid: cid });
    const card_cid = cid;
    const card_id = df_filter(df, "id", ["cid", card_cid])[0];
    const card_encImg = df_filter(df, "encImg", ["cid", card_cid])[0];
    const card_type = judgeCardType(df, ["cid", card_cid], "row");
    const attr_dic = {
        card_id: card_id,
        card_cid: card_cid,
        card_type: card_type,
        card_name: img.getAttribute("title"),
        card_url: card_url,
        loading: "lazy",
        src: `/yugiohdb/get_image.action?type=1&lang=ja&cid=${card_cid}&ciid=1&enc=${card_encImg}&osplang=1`,
        oncontextmenu: "return false;"

    };
    for (const [k, v] of Object.entries(attr_dic)) {
        img.setAttribute(k, v);
    }
    img.classList.add("img_chex");
    img.classList.add("img_frame");
    img.style["max-width"] = "none";
    img.parentElement.removeAttribute("href");
    img.style.cursor = "pointer";
    const div_flex = document.createElement("div");
    div_flex.style.display = "flex";
    const div_frame = cardImgSet.querySelector("#card_frame");
    div_frame.style.flex = "2 1 45%"
    div_frame.style.display = "block";
    div_flex.append(div_frame);
    const div_cardText = div_text.querySelector("#CardTextSet>div.CardText");
    div_cardText.style.flex = "2 5 45%";
    div_cardText.style.height = "fit-content";
    div_flex.append(div_cardText);

    div_text.querySelector("#CardTextSet").prepend(div_flex);
    div_text.querySelector("#CardSet svg").remove();
    div_text.querySelector("#CardSet #thumbnail").remove();
    div_text.querySelector("#CardImgSet").remove();

    for (const div_inside of div_text.querySelectorAll("#update_list div.t_row div.inside")) {
        div_inside.style.display = "block";
        const div_flex = document.createElement("div");
        div_flex.style.display = "flex";
        div_flex.append(div_inside.querySelector("div.time"));
        const div_card_num = div_inside.querySelector("div.card_number")
        div_card_num.style.padding = "5px";
        div_flex.append(div_card_num);
        div_flex.append(div_inside.querySelector("input.link_value"));
        div_flex.append(div_inside.querySelector("div.icon"));
        div_inside.prepend(div_flex);
        const div_pack_name = div_inside.querySelector("div.pack_name")
        div_pack_name.style = "font-weight:bold;text-align:center;"
        div_flex.after(div_pack_name);

    }

    if (div_text.querySelector("#relationCard") !== null) {
        const sort_set = div_text.querySelector("#relationCard>div.sort_set");
        if (sort_set != null) {
            sort_set.remove();
        }
        div_text.querySelector("#mode_set").nextElementSibling.setAttribute("id", "card_list");
        div_text.querySelector("#mode_set").remove();

        return await remakeSearchResult(div_text);
    } else return div_text;
}

const _obtainFaqForText = async (cid) => {
    const doc_faq = await obtainParsedHTML("https://www.db.yugioh-card.com/yugiohdb/faq_search.action", { ope: 4, cid: cid });
    const div_faq = doc_faq.querySelector("#article_body");
    div_faq.setAttribute("id", "info_faq");
    div_faq.classList.add("info_article");
    // div_faq.classList.add("none");
    const validIds_faq = ["card_info", "pen_info", "deck_list"];
    for (const elm of Array.from(div_faq.children)) {
        if (validIds_faq.indexOf(elm.id) !== -1) continue;
        elm.remove();
    }
    div_faq.style.display = "none";
    for (const elm of div_faq.querySelectorAll("a")) {
        elm.setAttribute("_href", elm.getAttribute("href"));
        elm.removeAttribute("href");
    }
    return div_faq
}

// const openProductInfoArea = async (pid = null, days = CACHE_DAYS, url_in = null) => {
//     const info_div = document.querySelector("#info_area>div");
//     const info_url = info_div.getAttribute("info_url");
//     const url = joinUrl("https://www.db.yugioh-card.com/yugiohdb/card_search.action", { ope: 1, pid: pid, rp: 99999, sess: 1 });

//     if (info_url == url) return true;
//     else info_div.setAttribute("info_url", url);

//     const cacheInfos = await operateStorage({ cacheInfos: JSON.stringify({}) }, "local")
//         .then(items => Object.assign({}, JSON.parse(items.cacheInfos)));
//     if (days > 0 && Object.keys(cacheInfos).indexOf(url) !== -1 && cacheInfos[url].time + days * 86400 * 1000 > Date.now()) {
//         info_div.innerHTML = cacheInfos[url].html;
//         info_div.scrollTo({ top: 0, left: 0, behavior: "smooth" });
//         addUrlHistory(url);
//         return true;
//     }
//     // const df = await obtainDF();
//     const doc_article = await obtainParsedHTML(url);
//     const div_article = doc_article.querySelector("#article_body");
//     div_article.setAttribute("id", "info_text");
//     div_article.classList.add("info_article");
//     div_article.style.display = "block";
//     const validIds_text = ["card_list"];
//     for (const elm of Array.from(div_article.children)) {
//         if (validIds_text.indexOf(elm.id) !== -1) continue;
//         elm.remove();
//     }
//     const broad_title = document.createElement("div");
//     broad_title.setAttribute("id", "broad_title");
//     broad_title.innerHTML = doc_article.querySelector("header#broad_title").innerHTML;

//     if (div_article.querySelector("#card_list") !== null) {
//         const div_article_new = await remakeSearchResult(div_article)
//         info_div.innerHTML = broad_title.outerHTML + div_article_new.outerHTML;
//     } else {
//         info_div.innerHTML = broad_title.outerHTML + div_article.outerHTML;
//     }
//     info_div.scrollTo(0, 0, "smooth");
//     const cacheInfos_new = Object.assign(cacheInfos, { [url]: { html: info_div.innerHTML, time: Date.now() } });
//     operateStorage({ cacheInfos: JSON.stringify(cacheInfos_new) }, "local", "set"); // await
//     addUrlHistory(url);
//     return true;
// }

// const openFaqInfoArea = async (fid = null, days = CACHE_DAYS, url_in = null) => {
//     if (url_in === null) {
//         const info_div = document.querySelector("#info_area>div");
//         const info_url = info_div.getAttribute("info_url");
//         const url_faq = joinUrl("https://www.db.yugioh-card.com/yugiohdb/faq_search.action", { ope: 5, fid: fid, keyword: "", tag: -1 });

//         if (info_url == url_faq) return true;
//         else info_div.setAttribute("info_url", url_faq);
//         const cacheInfos = await operateStorage({ cacheInfos: JSON.stringify({}) }, "local")
//             .then(items => Object.assign({}, JSON.parse(items.cacheInfos)));
//         if (days > 0 && Object.keys(cacheInfos).indexOf(url_faq) !== -1 && cacheInfos[url_faq].time + days * 86400 * 1000 > Date.now()) {
//             console.log("recovered from cache: " + url_faq);
//             info_div.innerHTML = cacheInfos[url_faq].html;
//             info_div.scrollTo({ top: 0, left: 0, behavior: "smooth" });
//             addUrlHistory(url_faq);
//             return true;
//         }
//     } else if (fid === null) return;
//     const url_faq = url_in || joinUrl("https://www.db.yugioh-card.com/yugiohdb/faq_search.action", { ope: 5, fid: fid, keyword: "", tag: -1 });
//     const doc_faq = await obtainParsedHTML(url_faq);
//     const div_faq = doc_faq.querySelector("#article_body");
//     div_faq.setAttribute("id", "info_faq");
//     div_faq.classList.add("info_article");

//     const validIds_text = ["qa_box"];
//     for (const elm of Array.from(div_faq.children)) {
//         if (validIds_text.indexOf(elm.id) !== -1) continue;
//         elm.remove();
//     }

//     const title = doc_faq.querySelector("#broad_title>div>h1").textContent;
//     div_faq.querySelector("#question").innerHTML += ": " + title;
//     for (const elm of div_faq.querySelectorAll("a")) {
//         elm.setAttribute("_href", elm.getAttribute("href"));
//         elm.removeAttribute("href");
//     }

//     info_div.innerHTML = div_faq.outerHTML;
//     info_div.scrollTo(0, 0, "smooth");
//     const cacheInfos_new = Object.assign(cacheInfos, { [url_faq]: { html: info_div.innerHTML, time: Date.now() } });
//     operateStorage({ cacheInfos: JSON.stringify(cacheInfos_new) }, "local", "set"); // await
//     addUrlHistory(url_faq);
//     return true;

// }

// // # info area
// const openCardInfoArea = async (cid = null, days = CACHE_DAYS, url_in = null) => {
//     const info_div = document.querySelector("#info_area>div");
//     const info_url = info_div.getAttribute("info_url");
//     const url_text = joinUrl("https://www.db.yugioh-card.com/yugiohdb/card_search.action", { ope: 2, cid: cid, mode: 1, sess: 4 });

//     if (info_url == url_text) return true;
//     else info_div.setAttribute("info_url", url_text);

//     const cacheInfos = await operateStorage({ cacheInfos: JSON.stringify({}) }, "local")
//         .then(items => Object.assign({}, JSON.parse(items.cacheInfos)));
//     if (days > 0 && Object.keys(cacheInfos).indexOf(url_text) !== -1 && cacheInfos[url_text].time + days * 86400 * 1000 > Date.now()) {
//         info_div.innerHTML = cacheInfos[url_text].html;
//         info_div.scrollTo({ top: 0, left: 0, behavior: "smooth" });
//         addUrlHistory(url_text);
//         return true;
//     }
//     const doc_text = await obtainParsedHTML(url_text);
//     const div_text = doc_text.querySelector("#article_body");
//     div_text.setAttribute("id", "info_text");
//     div_text.classList.add("info_article");
//     div_text.style.display = "block";
//     const validIds_text = ["CardSet", "update_list", "relationCard"];
//     for (const elm of Array.from(div_text.children)) {
//         if (validIds_text.indexOf(elm.id) !== -1) continue;
//         elm.remove();
//     }
//     if (sort_set != null) {
//         sort_set.remove();
//         div_text.querySelector("#mode_set").nextElementSibling.setAttribute("id", "card_list");
//         div_text.querySelector("#mode_set").remove();
//         const div_text_new = await remakeSearchResult(div_text)
//         info_div.innerHTML = ul + div_text_new.outerHTML + "\n" + div_faq.outerHTML;
//     } else {
//         info_div.innerHTML = ul + div_text.outerHTML + "\n" + div_faq.outerHTML;
//     }
//     info_div.scrollTo(0, 0, "smooth");
//     const cacheInfos_new = Object.assign(cacheInfos, { [url_text]: { html: info_div.innerHTML, time: Date.now() } });
//     operateStorage({ cacheInfos: JSON.stringify(cacheInfos_new) }, "local", "set"); // await
//     addUrlHistory(url_text);
//     return true;
// }

// # functions
const showHideSearch = (toShowIn = null) => {
    const card_set_search = $("#card_set");
    if (toShowIn === null) card_set_search.toggleClass("hide");
    else if (toShowIn === true) card_set_search.removeClass("hide");
    else if (toShowIn === false) card_set_search.addClass("hide");
    const toShow = !$("#card_set").hasClass("hide");
    [".filter_set_area", "#close_search_area"].map(d => toShow ? $(d).slideDown("fast") : $(d).slideUp("fast")); //, "#submit_area"
    ["#contents", "footer", "#tsl_notice"].map(d => toShow ? $(d).show() : $(d).hide());
    //$("html, body").scrollTop(0);
}
const obtainMaxPageNum = (body) => {
    const yaji_max = $("div.page_num>a.yaji.max", body);
    const a_last = $("div.page_num>a:not(.yaji.max):last", body);
    if (yaji_max.length > 0) return parseInt($(yaji_max).text());
    else if (a_last.length > 0) return parseInt($(a_last).text());
    else return 1;
}
const obtainSearchResult = async (page = 1, max_pageIn = null, mode = 1) => {
    const serialized = $("#form_search").serialize();
    const url = `https://www.db.yugioh-card.com/yugiohdb/card_search.action?${serialized}`.replaceAll(/&page=\d+|&mode=\d+/g, "") + `&page=${page}&mode=${mode}`;
    const body = await obtainStreamBody(url);
    const max_page = max_pageIn || obtainMaxPageNum(body);
    const search_body = $("#card_list", body);
    if (page < 3 && max_page > page) return search_body.append($(await obtainSearchResult(parseInt(page) + 1, max_page).then(d => d.prop("innerHTML"))));
    else return search_body;
}
const remakeSearchResult = async (search_result) => {
    const df = await obtainDF();
    for (const t_row of $("#card_list>.t_row", search_result)) {
        // const img = $("div.box_card_img>img", t_row);
        const img = t_row.querySelector("div.box_card_img>img");
        const card_name = img.title;
        const card_url = $("input.link_value:last", t_row).attr("value");
        const card_cid = card_url.match(/cid=(\d+)/)[1];
        const card_id = df_filter(df, "id", ["cid", card_cid])[0];
        const card_encImg = df_filter(df, "encImg", ["cid", card_cid])[0];
        const card_type = judgeCardType(df, ["cid", card_cid], "row");
        const attr_dic = {
            card_id: card_id,
            card_cid: card_cid,
            card_type: card_type,
            card_name: card_name,
            card_url: card_url,
            loading: "lazy",
            src: `/yugiohdb/get_image.action?type=1&lang=ja&cid=${card_cid}&ciid=1&enc=${card_encImg}&osplang=1`,
            oncontextmenu: "return false;"
        };
        //const a_link=$("<a>", {href: card_link});
        for (const [k, v] of Object.entries(attr_dic)) {
            img.setAttribute(k, v);
        }
        // $(img).attr(attr_dic);
        img.style.cursor = "pointer";
        //$(img).after(a_link);
        //$(a_link).append(img);
        img.classList.add("img_chex");
        img.classList.remove("none");

        const dl = t_row.querySelector("dl.flex_1");
        if (dl === null) continue;
        const dd_orig = dl.querySelector("dd.box_card_spec.flex_1");
        if (dd_orig === null) continue;
        const spans_atkdef = dd_orig.querySelectorAll("span.atk_power, span.def_power");
        if (spans_atkdef.length > 0) {
            const dd_new = document.createElement("dd");
            dd_new.setAttribute("class", "box_card_spec flex_1");
            for (const span of spans_atkdef) {
                dd_new.append(span);
            }
            dd_orig.after(dd_new);
        }
        const span_other = dd_orig.querySelector("span.card_info_species_and_other_item");
        if (span_other !== null) {
            const dd_new = document.createElement("dd");
            dd_new.setAttribute("class", "box_card_spec flex_1");
            dd_new.append(span_other);
            dd_orig.after(dd_new);
        }

    };
    return search_result;
}

const searchClicked = async () => {
    const div_search_result = $("#search_result");
    div_search_result.empty();
    showHideSearch(false);
    const search_result = ($("#stype").val() == "deck") ? await obtainDeckRecipie() : await obtainSearchResult();
    console.log(search_result);
    div_search_result.append($(search_result).prop("outerHTML"));
    const stype = document.querySelector("select#stype").value;
    const num_found = $(".t_row>div.box_card_img", search_result).length;
    let message = ""
    if (stype == "deck") {
        const cgid = obtainMyCgid();
        const lang = obtainLang();
        const dno_tmp = $("#keyword").val().match(/#(\d+)$/);
        const dno = dno_tmp[1];

        const deck_name = document.querySelector("#keyword").value;
        const url = joinUrl(`https://www.db.yugioh-card.com/yugiohdb/member_deck.action`, { ope: 1, cgid: cgid, dno: dno, request_locale: lang });
        message = `${num_found} Kinds in ${deck_name}: to open new tab, <a href="${url}" target="_blank">click here</a>`;

    } else {
        const serialized = $("#form_search").serialize();
        const page = 1;
        const mode = 1;
        const url = `https://www.db.yugioh-card.com/yugiohdb/card_search.action?${serialized}`.replaceAll(/&page=\d+|&mode=\d+/g, "") + `&page=${page}&mode=${mode}`;
        message = `${num_found} Cards Found: to open new tab, <a href="${url}" target="_blank">click here</a>`;

    }
    $("#choice_card_area>span:first").text(num_found);
    showMessage(message);
    await remakeSearchResult(div_search_result);
}

const obtainSearchScript = async () => {

    // # document
    $(document).ready(async function () {
        $(search_result).addClass("search_result");
        const select_stype = $("select#stype");
        select_stype.append($("<option>", { value: "deck" }).append("「デッキ内容」表示"));
        const datalist = $("<datalist>", { id: "search_stypeList" });
        $("#first_search").append(datalist);
        $("#first_search>#keyword").attr({ list: "search_stypeList" })
        $("select#stype").on("change", async function () {
            if ($(this).val() == "deck") {
                setDeckNames(datalist);
                //showHideSearch(false);
            } else $(datalist).empty();
        })
        // ## document addEventListener
        document.addEventListener("click", async function (e) {
            if ($(e.target).is("#form_search div.button_search, #form_search div.button_search *")) {
                const button_target = $(e.target).is("div.button_search") ? e.target : $(e.target).parents("div.search_button")[0];
                $(button_target).toggleClass("orn");
                await searchClicked();
                $(button_target).toggleClass("orn");
            } else if ($(e.target).is("#choice_card_area, #choice_card_area *")) {
                showHideSearch();
            }
        })
        //const isTouch = ('ontouchstart' in window);

        /*const star_array	= new Array("","0","1","2","3","4","5","6","7","8","9","10","11","12","");
        
        const atk_array	= new Array("","?","0","100","200","300","400","500","600","700","800","900","1000","1100","1200","1300","1400","1500","1600","1700","1800","1900","2000","2100","2200","2300","2400","2500","2600","2700","2800","2900","3000","3100","3200","3300","3400","3500","3600","3700","3800","3900","4000","4100","4200","4300","4400","4500","4600","4700","4800","4900","5000","");
        const def_array	= new Array("","?","0","100","200","300","400","500","600","700","800","900","1000","1100","1200","1300","1400","1500","1600","1700","1800","1900","2000","2100","2200","2300","2400","2500","2600","2700","2800","2900","3000","3100","3200","3300","3400","3500","3600","3700","3800","3900","4000","4100","4200","4300","4400","4500","4600","4700","4800","4900","5000","");
        const link_array	= new Array("","1","2","3","4","5","6","7","8","");
        
        const pscale_array	= new Array("","0","1","2","3","4","5","6","7","8","9","10","11","12","13","");*/
        //let focus_flg	= false;

        let cc_num = "4";
        /*const eventset = function(event){
            if (!focus_flg) {
                $("#ctype").val("").trigger("change");
                focus_flg = true;
            }else{
                cc_num = "4";
            }
        }*/

        /*const footerclose = function(event){
            $("#contents").hide();
            $("footer").hide();
            $("#tsl_notice").hide();
        }*/

        $("#keyword_delete").click(function () {
            $(this).parent().children("input").val("");
        });

        $("#closely_check").click(function () {
            if ($("#ctype_show").is(':hidden')) {
                if (cc_num == "4") {
                    $("#ctype").val("1").trigger("change");
                } else {
                    $("#ctype").val(cc_num).trigger("change");
                }
            } else {

                if (cc_num == "4") {
                } else {
                    $('#filter_set_monster').find(':input').prop('disabled', true);
                    $('#filter_set_magic').find(':input').prop('disabled', true);
                    $('#filter_set_trap').find(':input').prop('disabled', true);
                }
            }
        });


        $(".fliter_btns li:not(.untick)").click(function () {
            if ($(this).hasClass("check")) {
                $(this).removeClass("check");
                $(':checkbox', this).prop('checked', false);
            } else {
                $(this).addClass("check");
                $(':checkbox', this).prop('checked', true);
            }
        });

        $(".type1").click(function () {
            $(this).parents().nextAll(".fliter_btns").children("li").removeClass("check");
            $(this).parents().nextAll(".fliter_btns").children("li").children(':checkbox').prop('checked', false);
        });


        //const bar_set=()=>{}


        /*$(".min_tab").bind({
            "touchstart mousedown":function(e){
                event.preventDefault();
                $(this).addClass("ontouch");
                $(this).css("z-index","13");
                $(this).next(".max_tab").css("z-index","12");
                this.touched = true;

                const box_id = $(this).parent().parent().parent().attr("id");

                var scale_wid = get_scale(box_id);

                const min_X = this.pageX = (isTouch ? event.changedTouches[0].pageX : e.pageX);
                this.left = $(this).position().left;
            },

            "touchmove mousemove":function(e){
                if(!this.touched){return;}
                e.preventDefault();
                this.left = this.left - (min_X - (isTouch ? event.changedTouches[0].pageX : e.pageX) );

                if(this.left<= 0){ this.left = 0;}//下限
                if(this.left>= bar_width){ this.left = bar_width;}//上限
                $(this).css("left",this.left);

                const min_X = this.pageX = (isTouch ? event.changedTouches[0].pageX : e.pageX);

                //maxが連動して動く
                if(this.left >= $(this).next(".max_tab").position().left){
                    $(this).next(".max_tab").css("left",this.left);
                    change_values(this.left,box_id,"max");
                }
                change_values(this.left,box_id,"min");
            },

            "touchend mouseup":function(e){
                if(!this.touched){return;}
                this.touched = false;
                $(this).removeClass("ontouch");
            }
        });*/


        /*$(".max_tab").bind({
            "touchstart mousedown":function(e){
                event.preventDefault();
                $(this).addClass("ontouch");
                $(this).css("z-index","13");
                $(this).prev(".min_tab").css("z-index","12");
                this.touched = true;

                const box_id = $(this).parent().parent().parent().attr("id");

                const scale_wid = get_scale(box_id);

                const max_X = (isTouch ? event.changedTouches[0].pageX : e.pageX);
                this.left = $(this).position().left;
            },

            "touchmove mousemove":function(e){
                if(!this.touched){return;}
                e.preventDefault();
                this.left = this.left - (max_X - (isTouch ? event.changedTouches[0].pageX : e.pageX) );

                if(this.left<= 0){ this.left = 0;}//下限
                if(this.left>= bar_width){ this.left = bar_width;}//上限
                $(this).css("left",this.left);

                max_X = (isTouch ? event.changedTouches[0].pageX : e.pageX);

                //minが連動して動く
                if(this.left <= $(this).prev(".min_tab").position().left){
                    $(this).prev(".min_tab").css("left",this.left);
                    change_values(this.left,box_id,"min");
                }
                change_values(this.left,box_id,"max");
            },

            "touchend mouseup":function(e){
                if(!this.touched){return;}
                this.touched = false;
                $(this).removeClass("ontouch");
            }
        });*/


        //windowサイズ変更で実行
        /*var resizeTimer = null;
        $(window).bind("resize", function() {
        if (resizeTimer) clearTimeout(resizeTimer);
            resizeTimer = setTimeout(bar_set,50);
        });*/

        /*//.barとツマミの位置設定
        function bar_set(){
            const bar_width = $(".bar").width();
            now_star_min = $("#starfr").val();
            now_star_max = $("#starto").val();
            now_atk_min  = $("#atkfr").val();
            now_atk_max  = $("#atkto").val();
            now_def_min  = $("#deffr").val();
            now_def_max  = $("#defto").val();

            now_link_min  = $("#linkmarkerfr").val();
            now_link_max  = $("#linkmarkerto").val();
            now_pscale_min  = $("#pscalefr").val();
            now_pscale_max  = $("#pscaleto").val();

            $("#starfr_view").text(now_star_min);
            $("#starto_view").text(now_star_max);
            $("#atkfr_view").text(now_atk_min);
            $("#atkto_view").text(now_atk_max);
            $("#deffr_view").text(now_def_min);
            $("#defto_view").text(now_def_max);
            
            $("#linkfr_view").text(now_link_min);
            $("#linkto_view").text(now_link_max);
            $("#pscalefr_view").text(now_pscale_min);
            $("#pscaleto_view").text(now_pscale_max);

            
            
            star_scale_wid = get_scale("filter_star");
            for(i=0 ; i <= star_array.length - 1 ; i++){
                if(star_array[i] == now_star_min){
                    if(i == 0){pos_star_min = 0;
                    }else if(i == star_array.length-1){pos_star_min = bar_width;
                    }else{pos_star_min = (i * star_scale_wid) - (star_scale_wid / 2);
                    }
                    break;
                }
            }
            for(i=star_array.length - 1 ; 0 <= i ; i--){
                if(star_array[i] == now_star_max){
                    if(i == 0){pos_star_max = 0;
                    }else if(i == star_array.length-1){pos_star_max = bar_width;
                    }else{pos_star_max = (i * star_scale_wid) - (star_scale_wid / 2);
                    }
                    break;
                }
            }
            


            
            
            link_scale_wid = get_scale("filter_link");
            for(i=0 ; i <= link_array.length - 1 ; i++){
                if(link_array[i] == now_link_min){
                    if(i == 0){pos_link_min = 0;
                    }else if(i == link_array.length-1){pos_link_min = bar_width;
                    }else{pos_link_min = (i * link_scale_wid) - (link_scale_wid / 2);
                    }
                    break;
                }
            }
            for(i=link_array.length - 1 ; 0 <= i ; i--){
                if(i==10){
                }
                if(link_array[i] == now_link_max){
                    if(i == 0){pos_link_max = 0;
                    }else if(i == link_array.length-1){pos_link_max = bar_width;
                    }else{pos_link_max = (i * link_scale_wid) - (link_scale_wid / 2);
                    }
                    break;
                }
            }

            atk_scale_wid = get_scale("filter_atk");
            for(i=0 ; i <= atk_array.length - 1 ; i++){
                if(atk_array[i] == now_atk_min){
                    if(i == 0){pos_atk_min = 0;
                    }else if(i == atk_array.length-1){pos_atk_min = bar_width;
                    }else{pos_atk_min = (i * atk_scale_wid) - (atk_scale_wid / 2);
                    }
                    break;
                }
            }
            for(i=atk_array.length - 1 ; 0 <= i ; i--){
                if(atk_array[i] == now_atk_max){
                    if(i == 0){pos_atk_max = 0;
                    }else if(i == atk_array.length-1){pos_atk_max = bar_width;
                    }else{pos_atk_max = (i * atk_scale_wid) - (atk_scale_wid / 2);
                    }
                    break;
                }
            }
            
            def_scale_wid = get_scale("filter_def");
            for(i=0 ; i <= def_array.length - 1 ; i++){
                if(def_array[i] == now_def_min){
                    if(i == 0){pos_def_min = 0;
                    }else if(i == def_array.length-1){pos_def_min = bar_width;
                    }else{pos_def_min = (i * def_scale_wid) - (def_scale_wid / 2);
                    }
                    break;
                }

            }
            for(i=def_array.length - 1 ; 0 <= i  ; i--){
                if(def_array[i] == now_def_max){
                    if(i == 0){pos_def_max = 0;
                    }else if(i == def_array.length-1){pos_def_max = bar_width;
                    }else{pos_def_max = (i * def_scale_wid) - (def_scale_wid / 2);
                    }
                    break;
                }
            }

            pscale_scale_wid = get_scale("filter_pscale");
            for(i=0 ; i <= pscale_array.length - 1 ; i++){
                if(pscale_array[i] == now_pscale_min){
                    if(i == 0){pos_pscale_min = 0;
                    }else if(i == pscale_array.length-1){pos_pscale_min = bar_width;
                    }else{pos_pscale_min = (i * pscale_scale_wid) - (pscale_scale_wid / 2);
                    }
                    break;
                }
            }
            for(i= pscale_array.length - 1 ; 0 <= i ; i--){
                if(pscale_array[i] == now_pscale_max){
                    if(i == 0){pos_pscale_max = 0;
                    }else if(i == pscale_array.length-1){pos_pscale_max = bar_width;
                    }else{pos_pscale_max = (i * pscale_scale_wid) - (pscale_scale_wid / 2);
                    }
                    break;
                }
            }


            $("#filter_star .min_tab").css("left",pos_star_min);
            $("#filter_star .max_tab").css("left",pos_star_max);
            $("#filter_atk .min_tab").css("left",pos_atk_min);
            $("#filter_atk .max_tab").css("left",pos_atk_max);
            $("#filter_def .min_tab").css("left",pos_def_min);
            $("#filter_def .max_tab").css("left",pos_def_max);


            $("#filter_link .min_tab").css("left",pos_link_min);
            $("#filter_link .max_tab").css("left",pos_link_max);
            $("#filter_pscale .min_tab").css("left",pos_pscale_min);
            $("#filter_pscale .max_tab").css("left",pos_pscale_max);
        }*/

        /*function get_scale(box_id){
            switch(box_id){
                case "filter_star": scale_count = star_array.length; break;
                case "filter_atk" : scale_count = atk_array.length; break;
                case "filter_def" : scale_count = def_array.length; break;
                case "filter_link" : scale_count = link_array.length; break;
                case "filter_pscale" : scale_count = pscale_array.length; break;
            }
            return bar_width / (scale_count-2);
        }


        function change_values(leftpos,box_id,type){

            if(leftpos == 0){
                now_value = 0;
            }else if(leftpos == bar_width){
                now_value = scale_count-1;
            }else{
                now_value = Math.ceil(leftpos / scale_wid);
            }

            if(box_id == "filter_star" && type == "min"){
                $("#starfr").val(star_array[now_value]);
                $("#starfr_view").text(star_array[now_value]);
            }else if(box_id == "filter_star" && type == "max"){
                $("#starto").val(star_array[now_value]);
                $("#starto_view").text(star_array[now_value]);
            }else if(box_id == "filter_atk" && type == "min"){
                $("#atkfr").val(atk_array[now_value]);
                $("#atkfr_view").text(atk_array[now_value]);
            }else if(box_id == "filter_atk" && type == "max"){
                $("#atkto").val(atk_array[now_value]);
                $("#atkto_view").text(atk_array[now_value]);
            }else if(box_id == "filter_def" && type == "min"){
                $("#deffr").val(def_array[now_value]);
                $("#deffr_view").text(def_array[now_value]);
            }else if(box_id == "filter_def" && type == "max"){
                $("#defto").val(def_array[now_value]);
                $("#defto_view").text(def_array[now_value]);
            }else if(box_id == "filter_link" && type == "min"){
                $("#linkmarkerfr").val(link_array[now_value]);
                $("#linkfr_view").text(link_array[now_value]);
            }else if(box_id == "filter_link" && type == "max"){
                $("#linkmarkerto").val(link_array[now_value]);
                $("#linkto_view").text(link_array[now_value]);
            }else if(box_id == "filter_pscale" && type == "min"){
                $("#pscalefr").val(pscale_array[now_value]);
                $("#pscalefr_view").text(pscale_array[now_value]);
            }else if(box_id == "filter_pscale" && type == "max"){
                $("#pscaleto").val(pscale_array[now_value]);
                $("#pscaleto_view").text(pscale_array[now_value]);
            }
        }*/

        // # clicked
        $(".type2").on("click", function (evt) {
            //チェックボックスをOFFにする（チェックを外す）。
            $(this).parents().nextAll(".sab").children().children("input").prop('checked', false).change();
        });


        $("#ctype").change(function hoge() {
            const view_search_type = $("option:selected", this).attr("value");
            $("#ctype_show_set div").removeClass('choice');

            switch (view_search_type) {
                case "":
                    $('.filter_set_monster,.filter_effect').find(':input').prop('disabled', false);


                    $("#filter_effect_set,.filter_set_monster,.filter_effect").show();
                    $('.filter_effect_magic,.filter_effect_trap').find(':input').prop('disabled', true);

                    $(".filter_effect_trap,.filter_effect_magic").hide();
                    $('#ctype_set li').addClass("now");
                    $('#ctype_set li.1,#ctype_set li.2,#ctype_set li.3').removeClass("now");

                    //bar_set();

                    cc_num = "4";
                    break;
                case "1":
                    $('.filter_set_monster').find(':input').prop('disabled', false);
                    $('.filter_set_monster').show();

                    //bar_set();
                    cc_num = "1";


                    $('#filter_effect_set').hide();
                    $('.filter_effect_magic,.filter_effect_trap,.filter_effect').find(':input').prop('disabled', true);



                    $('#ctype_set li.1').addClass("now");
                    break;
                case "2":
                    $("#filter_effect_set,.filter_effect_magic").show();
                    $('.filter_effect_magic').find(':input').prop('disabled', false);

                    $('.filter_set_monster,.filter_effect_trap,.filter_effect').hide();
                    $('.filter_set_monster,.filter_effect_trap,.filter_effect').find(':input').prop('disabled', true);


                    cc_num = "2";



                    $('#ctype_set li.2').addClass("now");
                    break;
                case "3":
                    $("#filter_effect_set,.filter_effect_trap").show();
                    $('.filter_effect_trap').find(':input').prop('disabled', false);

                    $('.filter_set_monster,.filter_effect_magic,.filter_effect').hide();
                    $('.filter_set_monster,.filter_effect_magic,.filter_effect').find(':input').prop('disabled', true);


                    cc_num = "3";


                    $('#ctype_set li.3').addClass("now");
                    break;
            }
            $("option:selected", this).addClass('choice');

        }).trigger("change");


        $('#ctype_set li').click(function () {
            $('#ctype_set li').removeClass("now");
            const clm = $(this).attr("class");
            $('#ctype').val(clm).trigger('change');
        });


        $('#form_search input:text').keypress(async function (e) {
            if (e.keyCode == 13) {
                await searchClicked();
            }
        });


    });



    //-->
}

const obtainSearchForm = () => {
    return `<form id="form_search" action="/yugiohdb/card_search.action" method="GET" autocomplete="off" style="margin-top:0px;">
    <input type="hidden" name="ope" value="1">
    <input type="hidden" name="sess" value="1">
    <input type="hidden" name="rp" value="99999">
    <input type="hidden" name="mode" value>
    <input type="hidden" name="sort" value="1">

    <div id="search" class="card_s">
        <div class="search_btn_set">
            <div class="search">
                <div id="first_search" class="decoration">
                    <input type="text" id="keyword" name="keyword" value="" maxlength="50" class="keyword_ja" placeholder="キーワードを入力">
                    <img src="external/image/parts/keyword_delete.png" id="keyword_delete" alt="" class="ui-draggable ui-draggable-handle">
                </div>

                
                <select id="stype" name="stype" style="">
                    <option value="1" selected="">「カード名」検索</option>
                    <option value="2">「カードテキスト」検索</option>
                    <option value="3">「ペンデュラム効果」検索</option>
                    <option value="4">「カードNo」検索</option>
                </select>
            </div>

            
            <div id="submit_area">
                <div class="btn hex orn button_search"><span>検索</span></div>
            </div><!--#submit_area-->
        </div><!-- .search_btn_set -->


        
        <div id="choice_card_area">
            <span></span>
            <span class="text">
                条件を絞って検索
            </span>
            <span class="yaji">∨</span>
        </div><!--#choice_card_area-->
        

            <div id="card_set" class="filter_set_area">
            
            <div id="ctype_set" class="tablink">
                <ul>
                    <li class="now"><span>All</span></li>
            
                    <li class="1"><span>Monster</span></li>
            
                    <li class="2"><span>Spell</span></li>
            
                    <li class="3"><span>Trap</span></li>
            
                </ul>
                <select id="ctype" name="ctype">
                    <option value="" class="tabset choice">All</option>
            
                    <option value="1" class="tabset choice">Monster</option>
            
                    <option value="2" class="tabset choice">Spell</option>
            
                    <option value="3" class="tabset choice">Trap</option>
            
                </select>
            </div>
                
                <div id="filter_set_monster" class="filter_set">
                    
                    <div id="filter_attribute" class="filter_set_monster" style="">
                        <div class="title">

                            <h3>属性</h3>
                            <div class="Question">
                                <div class="btn hex orn"><span>?</span></div>
                                <p>絞り込みたい属性を選択してください</p>
                            </div>
                            <div class="btn hex red untick type1"><span>x</span></div>

                        </div>
                        <ul class="fliter_btns">

                            <li class=""><span>
                                <span style="background-image:url(external/image/parts/attribute/attribute_icon_dark.png)">
                                    闇属性
                                </span>
                                <input type="checkbox" name="attr" class="none" value="12">
                            </span></li>

                            <li class=""><span>
                                <span style="background-image:url(external/image/parts/attribute/attribute_icon_light.png)">
                                    光属性
                                </span>
                                <input type="checkbox" name="attr" class="none" value="11">
                            </span></li>

                            <li><span>
                                <span style="background-image:url(external/image/parts/attribute/attribute_icon_earth.png)">
                                    地属性
                                </span>
                                <input type="checkbox" name="attr" class="none" value="15">
                            </span></li>

                            <li><span>
                                <span style="background-image:url(external/image/parts/attribute/attribute_icon_water.png)">
                                    水属性
                                </span>
                                <input type="checkbox" name="attr" class="none" value="13">
                            </span></li>

                            <li><span>
                                <span style="background-image:url(external/image/parts/attribute/attribute_icon_fire.png)">
                                    炎属性
                                </span>
                                <input type="checkbox" name="attr" class="none" value="14">
                            </span></li>

                            <li><span>
                                <span style="background-image:url(external/image/parts/attribute/attribute_icon_wind.png)">
                                    風属性
                                </span>
                                <input type="checkbox" name="attr" class="none" value="16">
                            </span></li>

                            <li><span>
                                <span style="background-image:url(external/image/parts/attribute/attribute_icon_divine.png)">
                                    神属性
                                </span>
                                <input type="checkbox" name="attr" class="none" value="17">
                            </span></li>


                        </ul>
                    </div>
                    

                


                    
                    <div id="filter_effect_set" style="">
                        <div class="title">
                            <h3>効果</h3>
                            <div class="Question">
                                <div class="btn hex orn"><span>?</span></div>
                                <p>絞り込みたい効果を選択してください</p>
                            </div>
                            <div class="btn hex red untick type1"><span>x</span></div>

                        </div>
                
                        <ul class="fliter_btns filter_effect_magic" style="display: none;">

    
                            <li><span>
                                <span style="background-image:url(external/image/parts/effect/effect_icon_equip.png)">
                                    装備
                                </span>
                                <input type="checkbox" name="effe" class="none check_magic" value="23" disabled="">
                            </span></li>
    

    
                            <li><span>
                                <span style="background-image:url(external/image/parts/effect/effect_icon_field.png)">
                                    フィールド
                                </span>
                                <input type="checkbox" name="effe" class="none check_magic" value="22" disabled="">
                            </span></li>
    

    
                            <li><span>
                                <span style="background-image:url(external/image/parts/effect/effect_icon_quickplay.png)">
                                    速攻
                                </span>
                                <input type="checkbox" name="effe" class="none check_magic" value="25" disabled="">
                            </span></li>
    

    
                            <li><span>
                                <span style="background-image:url(external/image/parts/effect/effect_icon_ritual.png)">
                                    儀式
                                </span>
                                <input type="checkbox" name="effe" class="none check_magic" value="26" disabled="">
                            </span></li>
    

    
                            <li><span>
                                <span style="background-image:url(external/image/parts/effect/effect_icon_continuous.png)">
                                    永続
                                </span>
                                <input type="checkbox" name="effe" class="none check_magic" value="24" disabled="">
                            </span></li>
    

    

    
                            <li><span>
                                <span style="padding: 0;">
                                    通常
                                </span>
                                <input type="checkbox" name="effe" class="none check_magic" value="20" disabled="">
                            </span></li>
    


                        </ul>
                


                
                        <ul class="fliter_btns filter_effect_trap" style="display: none;">

    

    

    

    

    
                            <li><span>
                                <span style="background-image:url(external/image/parts/effect/effect_icon_continuous.png)">
                                    永続
                                </span>
                                <input type="checkbox" name="effe" class="none check_trap" value="24" disabled="">
                            </span></li>
    

    
                            <li><span>
                                <span style="background-image:url(external/image/parts/effect/effect_icon_counter.png)">
                                    カウンター
                                </span>
                                <input type="checkbox" name="effe" class="none check_trap" value="21" disabled="">
                            </span></li>
    

    
                            <li><span>
                                <span style="padding: 0;">
                                    通常
                                </span>
                                <input type="checkbox" name="effe" class="none check_trap" value="20" disabled="">
                            </span></li>
    


                        </ul>
                

                
                        <ul class="fliter_btns filter_effect" style="">

                            <li><span>
                                <span style="background-image:url(external/image/parts/effect/effect_icon_equip.png)">
                                    装備
                                </span>
                                <input type="checkbox" name="effe" class="none check_trap" value="23">
                            </span></li>

                            <li><span>
                                <span style="background-image:url(external/image/parts/effect/effect_icon_field.png)">
                                    フィールド
                                </span>
                                <input type="checkbox" name="effe" class="none check_trap" value="22">
                            </span></li>

                            <li><span>
                                <span style="background-image:url(external/image/parts/effect/effect_icon_quickplay.png)">
                                    速攻
                                </span>
                                <input type="checkbox" name="effe" class="none check_trap" value="25">
                            </span></li>

                            <li><span>
                                <span style="background-image:url(external/image/parts/effect/effect_icon_ritual.png)">
                                    儀式
                                </span>
                                <input type="checkbox" name="effe" class="none check_trap" value="26">
                            </span></li>

                            <li><span>
                                <span style="background-image:url(external/image/parts/effect/effect_icon_continuous.png)">
                                    永続
                                </span>
                                <input type="checkbox" name="effe" class="none check_trap" value="24">
                            </span></li>

                            <li><span>
                                <span style="background-image:url(external/image/parts/effect/effect_icon_counter.png)">
                                    カウンター
                                </span>
                                <input type="checkbox" name="effe" class="none check_trap" value="21">
                            </span></li>

                            <li><span>
                                <span style="padding: 0;">
                                    通常
                                </span>
                                <input type="checkbox" name="effe" class="none check_trap" value="20">
                            </span></li>


                        </ul>
                



                    </div>
                    
                    





                    
                    <div id="filter_specis" class="filter_set_monster" style="">
                        <div class="title">
                            <h3>種族</h3>
                            <div class="Question">
                                <div class="btn hex orn"><span>?</span></div>
                                <p>絞り込みたい種族を選択してください</p>
                            </div>
                            <div class="btn hex red untick type1"><span>x</span></div>
                        </div>
                        <ul class="fliter_btns">

                            <li class="species_1_ja"><span>
                                魔法使い族
                                <input type="checkbox" name="species" class="none" value="18">
                            </span></li>

                            <li class="species_2_ja"><span>
                                ドラゴン族
                                <input type="checkbox" name="species" class="none" value="1">
                            </span></li>

                            <li class="species_3_ja"><span>
                                アンデット族
                                <input type="checkbox" name="species" class="none" value="2">
                            </span></li>

                            <li class="species_4_ja"><span>
                                戦士族
                                <input type="checkbox" name="species" class="none" value="15">
                            </span></li>

                            <li class="species_5_ja"><span>
                                獣戦士族
                                <input type="checkbox" name="species" class="none" value="12">
                            </span></li>

                            <li class="species_6_ja"><span>
                                獣族
                                <input type="checkbox" name="species" class="none" value="11">
                            </span></li>

                            <li class="species_7_ja"><span>
                                鳥獣族
                                <input type="checkbox" name="species" class="none" value="16">
                            </span></li>

                            <li class="species_8_ja"><span>
                                悪魔族
                                <input type="checkbox" name="species" class="none" value="3">
                            </span></li>

                            <li class="species_9_ja"><span>
                                天使族
                                <input type="checkbox" name="species" class="none" value="17">
                            </span></li>

                            <li class="species_10_ja"><span>
                                昆虫族
                                <input type="checkbox" name="species" class="none" value="10">
                            </span></li>

                            <li class="species_11_ja"><span>
                                恐竜族
                                <input type="checkbox" name="species" class="none" value="9">
                            </span></li>

                            <li class="species_12_ja"><span>
                                爬虫類族
                                <input type="checkbox" name="species" class="none" value="20">
                            </span></li>

                            <li class="species_13_ja"><span>
                                魚族
                                <input type="checkbox" name="species" class="none" value="8">
                            </span></li>

                            <li class="species_14_ja"><span>
                                海竜族
                                <input type="checkbox" name="species" class="none" value="5">
                            </span></li>

                            <li class="species_15_ja"><span>
                                水族
                                <input type="checkbox" name="species" class="none" value="14">
                            </span></li>

                            <li class="species_16_ja"><span>
                                炎族
                                <input type="checkbox" name="species" class="none" value="4">
                            </span></li>

                            <li class="species_17_ja"><span>
                                雷族
                                <input type="checkbox" name="species" class="none" value="19">
                            </span></li>

                            <li class="species_18_ja"><span>
                                岩石族
                                <input type="checkbox" name="species" class="none" value="6">
                            </span></li>

                            <li class="species_19_ja"><span>
                                植物族
                                <input type="checkbox" name="species" class="none" value="13">
                            </span></li>

                            <li class="species_20_ja"><span>
                                機械族
                                <input type="checkbox" name="species" class="none" value="7">
                            </span></li>

                            <li class="species_21_ja"><span>
                                サイキック族
                                <input type="checkbox" name="species" class="none" value="21">
                            </span></li>

                            <li class="species_22_ja"><span>
                                幻神獣族
                                <input type="checkbox" name="species" class="none" value="22">
                            </span></li>

                            <li class="species_23_ja"><span>
                                創造神族
                                <input type="checkbox" name="species" class="none" value="23">
                            </span></li>

                            <li class="species_24_ja"><span>
                                幻竜族
                                <input type="checkbox" name="species" class="none" value="26">
                            </span></li>

                            <li class="species_25_ja"><span>
                                サイバース族
                                <input type="checkbox" name="species" class="none" value="27">
                            </span></li>
                            <li class="species_26_ja"><span>
                                幻想魔族
                                <input type="checkbox" name="species" class="none" value="34">
                            </span></li>

                        </ul>
                    </div>
                    

                    
                    <div id="filter_other" class="filter_set_monster" style="">
                        <div class="title">
                            <h3>その他項目</h3>
                            <div class="Question">
                                <div class="btn hex orn"><span>?</span></div>
                                <p>絞り込みたいその他の項目を選択してください、AndあるいはOrで絞り込みます</p>
                            </div>
                            <div class="btn hex red untick type1"><span>x</span></div>
                            <div class="bottom">
                                <div id="and_or" class="and_or hex"><span>
                                    <label>
                                        <input type="radio" id="othercon_and" name="othercon" value="1">
                                        <span>and</span>
                                    </label></br>
                                    <label>
                                        <input type="radio" id="othercon_or" name="othercon" value="2" checked="">
                                        <span>or</span>
                                    </label>

                                </span></div>
                            </div>

                        </div>
                        <ul class="fliter_btns">

                            <li><span>
                                通常
                                <input type="checkbox" name="other" class="none" value="0">
                            </span></li>

                            <li><span>
                                効果
                                <input type="checkbox" name="other" class="none" value="1">
                            </span></li>

                            <li><span>
                                儀式
                                <input type="checkbox" name="other" class="none" value="3">
                            </span></li>

                            <li><span>
                                融合
                                <input type="checkbox" name="other" class="none" value="2">
                            </span></li>

                            <li><span>
                                シンクロ
                                <input type="checkbox" name="other" class="none" value="9">
                            </span></li>

                            <li><span>
                                エクシーズ
                                <input type="checkbox" name="other" class="none" value="10">
                            </span></li>

                            <li><span>
                                トゥーン
                                <input type="checkbox" name="other" class="none" value="4">
                            </span></li>

                            <li><span>
                                スピリット
                                <input type="checkbox" name="other" class="none" value="5">
                            </span></li>

                            <li><span>
                                ユニオン
                                <input type="checkbox" name="other" class="none" value="6">
                            </span></li>

                            <li><span>
                                デュアル
                                <input type="checkbox" name="other" class="none" value="7">
                            </span></li>

                            <li><span>
                                チューナー
                                <input type="checkbox" name="other" class="none" value="8">
                            </span></li>

                            <li><span>
                                リバース
                                <input type="checkbox" name="other" class="none" value="14">
                            </span></li>

                            <li><span>
                                ペンデュラム
                                <input type="checkbox" name="other" class="none" value="15">
                            </span></li>

                            <li><span>
                                特殊召喚
                                <input type="checkbox" name="other" class="none" value="16">
                            </span></li>

                            <li><span>
                                リンク
                                <input type="checkbox" name="other" class="none" value="17">
                            </span></li>


                        </ul>
                    </div>
                    

                    
                    <div id="filter_other" class="filter_set_monster" style="">
                        <div class="title">
                            <h3>除外項目</h3>
                            <div class="Question">
                                <div class="btn hex orn"><span>?</span></div>
                                <p>除外したい項目を選択してください</p>
                            </div>
                            <div class="btn hex red untick type1"><span>x</span></div>
                        </div>
                        <ul class="fliter_btns">

                            <li><span>
                                通常
                                <input type="checkbox" name="jogai" class="none" value="0">
                            </span></li>

                            <li><span>
                                効果
                                <input type="checkbox" name="jogai" class="none" value="1">
                            </span></li>

                            <li><span>
                                儀式
                                <input type="checkbox" name="jogai" class="none" value="3">
                            </span></li>

                            <li><span>
                                融合
                                <input type="checkbox" name="jogai" class="none" value="2">
                            </span></li>

                            <li><span>
                                シンクロ
                                <input type="checkbox" name="jogai" class="none" value="9">
                            </span></li>

                            <li><span>
                                エクシーズ
                                <input type="checkbox" name="jogai" class="none" value="10">
                            </span></li>

                            <li><span>
                                トゥーン
                                <input type="checkbox" name="jogai" class="none" value="4">
                            </span></li>

                            <li><span>
                                スピリット
                                <input type="checkbox" name="jogai" class="none" value="5">
                            </span></li>

                            <li><span>
                                ユニオン
                                <input type="checkbox" name="jogai" class="none" value="6">
                            </span></li>

                            <li><span>
                                デュアル
                                <input type="checkbox" name="jogai" class="none" value="7">
                            </span></li>

                            <li><span>
                                チューナー
                                <input type="checkbox" name="jogai" class="none" value="8">
                            </span></li>

                            <li><span>
                                リバース
                                <input type="checkbox" name="jogai" class="none" value="14">
                            </span></li>

                            <li><span>
                                ペンデュラム
                                <input type="checkbox" name="jogai" class="none" value="15">
                            </span></li>

                            <li><span>
                                特殊召喚
                                <input type="checkbox" name="jogai" class="none" value="16">
                            </span></li>

                            <li><span>
                                リンク
                                <input type="checkbox" name="jogai" class="none" value="17">
                            </span></li>


                        </ul>
                    </div>
                    



                    
                    <div id="filter_star" class=" filter_set_monster" style="">
                        <div class="title">
                            <h3>レベル</h3>
                            <div class="Question">
                                <div class="btn hex orn"><span>?</span></div>
                                <p>0から13までのレベルあるいはランクを絞り込みます</p>
                            </div>
                            <div class="btn hex red untick type2"><span>x</span></div>
                        </div>
                          <div class="sab">
                            <div class="updw">
                                <input type="hidden" name="starfr" id="starfr" value="">
                                <input type="hidden" name="starto" id="starto" value="">

                                <input id="level_0" type="checkbox" name="level0" class="" value="on">
                                    <label for="level_0"><span>0</span></label>
                                <input id="level_1" type="checkbox" name="level1" class="" value="on">
                                    <label for="level_1"><span>1</span></label>
                                <input id="level_2" type="checkbox" name="level2" class="" value="on">
                                    <label for="level_2"><span>2</span></label>
                                <input id="level_3" type="checkbox" name="level3" class="" value="on">
                                    <label for="level_3"><span>3</span></label>
                                <input id="level_4" type="checkbox" name="level4" class="" value="on">
                                    <label for="level_4"><span>4</span></label>
                                <input id="level_5" type="checkbox" name="level5" class="" value="on">
                                    <label for="level_5"><span>5</span></label>
                                <input id="level_6" type="checkbox" name="level6" class="" value="on">
                                    <label for="level_6"><span>6</span></label>
                                <input id="level_7" type="checkbox" name="level7" class="" value="on">
                                    <label for="level_7"><span>7</span></label>
                                <input id="level_8" type="checkbox" name="level8" class="" value="on">
                                    <label for="level_8"><span>8</span></label>
                                <input id="level_9" type="checkbox" name="level9" class="" value="on">
                                    <label for="level_9"><span>9</span></label>
                                <input id="level_10" type="checkbox" name="level10" class="" value="on">
                                    <label for="level_10"><span>10</span></label>
                                <input id="level_11" type="checkbox" name="level11" class="" value="on">
                                    <label for="level_11"><span>11</span></label>
                                <input id="level_12" type="checkbox" name="level12" class="" value="on">
                                    <label for="level_12"><span>12</span></label>
                                <input id="level_13" type="checkbox" name="level13" class="" value="on">
                                    <label for="level_13"><span>13</span></label>
                            </div>
                        </div>

                    </div>
                    

                    
                    <div class="search_bottom filter_set_monster" style="">
                        <div class="title">
                            <h3>ペンデュラム</h3>
                            <div class="Question">
                                <div class="btn hex orn"><span>?</span></div>
                                <p>ペンデュラムスケールで絞り込みます</p>
                            </div>
                            <div class="btn hex red untick type2"><span>x</span></div>
                        </div>
                        <div class="sab">
                            <div class="updw">
                                <input type="hidden" id="pscalefr" name="pscalefr" maxlength="2">
                                <input type="hidden" id="pscaleto" name="pscaleto" maxlength="2">


                                <input id="Pscale_0" type="checkbox" name="Pscale0" class="" value="on">
                                    <label for="Pscale_0"><span>0</span></label>
                                <input id="Pscale_1" type="checkbox" name="Pscale1" class="" value="on">
                                    <label for="Pscale_1"><span>1</span></label>
                                <input id="Pscale_2" type="checkbox" name="Pscale2" class="" value="on">
                                    <label for="Pscale_2"><span>2</span></label>
                                <input id="Pscale_3" type="checkbox" name="Pscale3" class="" value="on">
                                    <label for="Pscale_3"><span>3</span></label>
                                <input id="Pscale_4" type="checkbox" name="Pscale4" class="" value="on">
                                    <label for="Pscale_4"><span>4</span></label>
                                <input id="Pscale_5" type="checkbox" name="Pscale5" class="" value="on">
                                    <label for="Pscale_5"><span>5</span></label>
                                <input id="Pscale_6" type="checkbox" name="Pscale6" class="" value="on">
                                    <label for="Pscale_6"><span>6</span></label>
                                <input id="Pscale_7" type="checkbox" name="Pscale7" class="" value="on">
                                    <label for="Pscale_7"><span>7</span></label>
                                <input id="Pscale_8" type="checkbox" name="Pscale8" class="" value="on">
                                    <label for="Pscale_8"><span>8</span></label>
                                <input id="Pscale_9" type="checkbox" name="Pscale9" class="" value="on">
                                    <label for="Pscale_9"><span>9</span></label>
                                <input id="Pscale_10" type="checkbox" name="Pscale10" class="" value="on">
                                    <label for="Pscale_10"><span>10</span></label>
                                <input id="Pscale_11" type="checkbox" name="Pscale11" class="" value="on">
                                    <label for="Pscale_11"><span>11</span></label>
                                <input id="Pscale_12" type="checkbox" name="Pscale12" class="" value="on">
                                    <label for="Pscale_12"><span>12</span></label>
                                <input id="Pscale_13" type="checkbox" name="Pscale13" class="" value="on">
                                    <label for="Pscale_13"><span>13</span></label>

                            </div>
                        </div>
                    </div>
                    
                    <div id="link_set" class="search_m filter_set_monster" style="">
                        <div class="title">
                            <h3>リンク</h3>
                            <div class="Question">
                                <div class="btn hex orn"><span>?</span></div>
                                <p>リンクを数値<s>またはマーカーの位置</s>で絞り込みます。</p>
                            </div>
                            <div class="btn hex red untick type2"><span>x</span></div>
                        </div>
                        <div class="sab">
                            <div class="updw">
                                    <input type="hidden" id="linkmarkerfr" name="linkmarkerfr" maxlength="2">
                                    <input type="hidden" id="linkmarkerto" name="linkmarkerto" maxlength="2">
                                    <input id="Link_1" type="checkbox" name="Link1" class="" value="on">
                                        <label for="Link_1"><span>1</span></label>
                                    <input id="Link_2" type="checkbox" name="Link2" class="" value="on">
                                        <label for="Link_2"><span>2</span></label>
                                    <input id="Link_3" type="checkbox" name="Link3" class="" value="on">
                                        <label for="Link_3"><span>3</span></label>
                                    <input id="Link_4" type="checkbox" name="Link4" class="" value="on">
                                        <label for="Link_4"><span>4</span></label>
                                    <input id="Link_5" type="checkbox" name="Link5" class="" value="on">
                                        <label for="Link_5"><span>5</span></label>
                                    <input id="Link_6" type="checkbox" name="Link6" class="" value="on">
                                        <label for="Link_6"><span>6</span></label>
                            </div>
                            <div class="search_m_set">
                                <div class="link_m">
                                    <input type="checkbox" id="linkbtn7" name="linkbtn7" value="7"><label class="linkbtn7" for="linkbtn7"></label>
                                        <input type="checkbox" id="linkbtn8" name="linkbtn8" value="8"><label class="linkbtn8" for="linkbtn8"></label>
                                        <input type="checkbox" id="linkbtn9" name="linkbtn9" value="9"><label class="linkbtn9" for="linkbtn9"></label>
                                        <input type="checkbox" id="linkbtn4" name="linkbtn4" value="4"><label class="linkbtn4" for="linkbtn4"></label>
                                        <input type="checkbox" id="linkbtn6" name="linkbtn6" value="6"><label class="linkbtn6" for="linkbtn6"></label>
                                        <input type="checkbox" id="linkbtn1" name="linkbtn1" value="1"><label class="linkbtn1" for="linkbtn1"></label>
                                        <input type="checkbox" id="linkbtn2" name="linkbtn2" value="2"><label class="linkbtn2" for="linkbtn2"></label>
                                        <input type="checkbox" id="linkbtn3" name="linkbtn3" value="3"><label class="linkbtn3" for="linkbtn3"></label>

                                </div>
                                <div id="and_or2" class="and_or hex">
                                    <span><a href="javascript:void(0);" class="link_left radio_off_left off">
                                        <label>
                                            <input type="radio" id="link_and" name="link_m" value="1" class="" checked="">
                                            <span>and</span>
                                        </label>
                                    </a>
                                    <a href="javascript:void(0);" class="link_right radio_off_right on" style="">
                                        <label>
                                            <input type="radio" id="link_or" name="link_m" value="2" class="" >
                                            <span>or</span>
                                        </label>
                                    </a></span>
                                </div>
                            </div>
                        </div>
                    </div>



                    <div class="atkdef  filter_set_monster" style="">
                        <div class="search_top">
                            <div class="title">
                                <h3>攻撃力</h3>
                                <div class="Question">
                                    <div class="btn hex orn"><span>?</span></div>
                                    <p>攻撃力で絞り込みます、最大は5000です</p>
                                </div>
                            </div>
                            <div id="attack_input" class="input_set">
                                <input type="text" id="atkfr" name="atkfr" maxlength="4">
                                <input type="text" id="atkto" name="atkto" maxlength="4">
                            </div>
                        </div>
                    </div>
                    <div class="atkdef  filter_set_monster" style="">
                        <div class="search_bottom">
                            <div class="title">
                                <h3>守備力</h3>
                                <div class="Question">
                                    <div class="btn hex orn"><span>?</span></div>
                                    <p>守備力で絞り込みます、最大は5000です</p>
                                </div>
                            </div>
                            <div id="defense_input" class="input_set">
                                <input type="text" id="deffr" name="deffr" maxlength="4">
                                <input type="text" id="defto" name="defto" maxlength="4">
                            </div>
                        </div>
                    </div>

                </div><!--#filter_set_monster-->
                







            </div><!--.filter_set_area-->
            
            <div id="bottombtn" class="">
                <div class="btn hex orn button_search"><span>検索</span></div>
            </div>

        
        
    </div><!--#search-->
</form>
`
}

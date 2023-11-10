"use strict";

//--------------------------
//         # initial
const defaultSettings = {
    autoUpdateDB: true,
    addDate: false,
    valid_feature_importExport: true,
    valid_feature_sortShuffle: true,
    valid_feature_deckHeader: true,
    valid_feature_deckEditImage: true,
    // valid_feature_sideChange: true, // always true
    valid_feature_deckManager: true,
    default_visible_header: true,
    default_deck_edit_image: true,
    default_deck_edit_search: true,
    //default_sideChange_view: true,// always true
    default_searchArea_visible: true,
    default_infoArea_visible: true,
    default_fit_edit: false,
    value_defaultLang: "ja",
    value_clickMode: 2
};
const defaultString = JSON.stringify(defaultSettings);

const defaultTemps = {
    ytkn: null
};
const defaultTempsString = JSON.stringify(defaultTemps);

const IsLocalTest = (chrome.runtime.id !== "jdgobeohbdmglcmgblpodggmgmponihc");

const svgs = {
    shuffle: `<svg xmlns="http://www.w3.org/2000/svg" height="80%" viewBox="0 -960 960 960"><path d="M560-160v-80h104L537-367l57-57 126 126v-102h80v240H560Zm-344 0-56-56 504-504H560v-80h240v240h-80v-104L216-160Zm151-377L160-744l56-56 207 207-56 56Z"/></svg>`,
    sort: `<svg xmlns="http://www.w3.org/2000/svg" height="80%" viewBox="0 -960 960 960" ><path d="M120-240v-80h240v80H120Zm0-200v-80h480v80H120Zm0-200v-80h720v80H120Z"/></svg>`,
    delete: `<svg xmlns="http://www.w3.org/2000/svg" height="100%" viewBox="0 -960 960 960" ><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>`,
    add: `<svg xmlns="http://www.w3.org/2000/svg" height="100%" viewBox="0 -960 960 960" ><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg>`,
    upload: `<svg xmlns="http://www.w3.org/2000/svg" height="100%" viewBox="0 -960 960 960" ><path d="M440-320v-326L336-542l-56-58 200-200 200 200-56 58-104-104v326h-80ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/></svg>`,
    download: `<svg xmlns="http://www.w3.org/2000/svg" height="100%" viewBox="0 -960 960 960" ><path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/></svg>`,
    save: `<svg xmlns="http://www.w3.org/2000/svg" height="100%" viewBox="0 -960 960 960" ><path d="M840-680v480q0 33-23.5 56.5T760-120H200q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h480l160 160Zm-80 34L646-760H200v560h560v-446ZM480-240q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35ZM240-560h360v-160H240v160Zm-40-86v446-560 114Z"/></svg>`,
    refresh: `<svg xmlns="http://www.w3.org/2000/svg" height="100%" viewBox="0 -960 960 960" ><path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z"/></svg>`,
    copy: `<svg xmlns="http://www.w3.org/2000/svg" height="100%" viewBox="0 -960 960 960" ><path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z"/></svg>`,
    edit: `<svg xmlns="http://www.w3.org/2000/svg" height="100%" viewBox="0 -960 960 960" ><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h357l-80 80H200v560h560v-278l80-80v358q0 33-23.5 56.5T760-120H200Zm280-360ZM360-360v-170l367-367q12-12 27-18t30-6q16 0 30.5 6t26.5 18l56 57q11 12 17 26.5t6 29.5q0 15-5.5 29.5T897-728L530-360H360Zm481-424-56-56 56 56ZM440-440h56l232-232-28-28-29-28-231 231v57Zm260-260-29-28 29 28 28 28-28-28Z"/></svg>`,
    backspace: `<svg xmlns="http://www.w3.org/2000/svg" height="100%" viewBox="0 -960 960 960" ><path d="M360-200q-20 0-37.5-9T294-234L120-480l174-246q11-16 28.5-25t37.5-9h400q33 0 56.5 23.5T840-680v400q0 33-23.5 56.5T760-200H360Zm400-80v-400 400Zm-400 0h400v-400H360L218-480l142 200Zm96-40 104-104 104 104 56-56-104-104 104-104-56-56-104 104-104-104-56 56 104 104-104 104 56 56Z"/></svg>`,
    arrowBack: `<svg xmlns="http://www.w3.org/2000/svg" height="100%" viewBox="0 -960 960 960" ><path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z"/></svg>`,
    abc: `<svg xmlns="http://www.w3.org/2000/svg" height="100%" viewBox="0 -960 960 960" ><path d="M680-360q-17 0-28.5-11.5T640-400v-160q0-17 11.5-28.5T680-600h120q17 0 28.5 11.5T840-560v40h-60v-20h-80v120h80v-20h60v40q0 17-11.5 28.5T800-360H680Zm-300 0v-240h160q17 0 28.5 11.5T580-560v40q0 17-11.5 28.5T540-480q17 0 28.5 11.5T580-440v40q0 17-11.5 28.5T540-360H380Zm60-150h80v-30h-80v30Zm0 90h80v-30h-80v30Zm-320 60v-200q0-17 11.5-28.5T160-600h120q17 0 28.5 11.5T320-560v200h-60v-60h-80v60h-60Zm60-120h80v-60h-80v60Z"/></svg>`,
    liveHelp: `<svg xmlns="http://www.w3.org/2000/svg" height="100%" viewBox="0 -960 960 960" ><path d="M476-280q21 0 35.5-14.5T526-330q0-21-14.5-35.5T476-380q-21 0-35.5 14.5T426-330q0 21 14.5 35.5T476-280Zm-36-154h74q0-17 1.5-29t6.5-23q5-11 12.5-20.5T556-530q35-35 49.5-58.5T620-642q0-53-36-85.5T487-760q-55 0-93.5 27T340-658l66 26q7-27 28-43.5t49-16.5q27 0 45 14.5t18 38.5q0 17-11 36t-37 42q-17 14-27.5 27.5T453-505q-7 15-10 31.5t-3 39.5Zm40 394L360-160H200q-33 0-56.5-23.5T120-240v-560q0-33 23.5-56.5T200-880h560q33 0 56.5 23.5T840-800v560q0 33-23.5 56.5T760-160H600L480-40ZM200-240h192l88 88 88-88h192v-560H200v560Zm280-280Z"/></svg>`,
    style: `<svg xmlns="http://www.w3.org/2000/svg" height="100%" viewBox="0 -960 960 960" ><path d="m159-168-34-14q-31-13-41.5-45t3.5-63l72-156v278Zm160 88q-33 0-56.5-23.5T239-160v-240l106 294q3 7 6 13.5t8 12.5h-40Zm206-4q-32 12-62-3t-42-47L243-622q-12-32 2-62.5t46-41.5l302-110q32-12 62 3t42 47l178 488q12 32-2 62.5T827-194L525-84Zm-86-476q17 0 28.5-11.5T479-600q0-17-11.5-28.5T439-640q-17 0-28.5 11.5T399-600q0 17 11.5 28.5T439-560Zm58 400 302-110-178-490-302 110 178 490ZM319-650l302-110-302 110Z"/></svg>`,
    search: `<svg xmlns="http://www.w3.org/2000/svg" height="100%" viewBox="0 -960 960 960" ><path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/></svg>`,
    contancts: `<svg xmlns="http://www.w3.org/2000/svg" height="100%" viewBox="0 -960 960 960" ><path d="M160-40v-80h640v80H160Zm0-800v-80h640v80H160Zm320 400q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35ZM160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm70-80q45-56 109-88t141-32q77 0 141 32t109 88h70v-480H160v480h70Zm118 0h264q-29-20-62.5-30T480-280q-36 0-69.5 10T348-240Zm132-280q-17 0-28.5-11.5T440-560q0-17 11.5-28.5T480-600q17 0 28.5 11.5T520-560q0 17-11.5 28.5T480-520Zm0 40Z"/></svg>`,
    scroll: `<svg xmlns="http://www.w3.org/2000/svg" height="100%" viewBox="0 -960 960 960" ><path d="M320-440v-287L217-624l-57-56 200-200 200 200-57 56-103-103v287h-80ZM600-80 400-280l57-56 103 103v-287h80v287l103-103 57 56L600-80Z"/></svg>`,
    fullscreen: `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M120-120v-200h80v120h120v80H120Zm520 0v-80h120v-120h80v200H640ZM120-640v-200h200v80H200v120h-80Zm640 0v-120H640v-80h200v200h-80Z"/></svg>`,
    toc: `<svg xmlns="http://www.w3.org/2000/svg" height="100%" viewBox="0 -960 960 960" ><path d="M120-280v-80h560v80H120Zm0-160v-80h560v80H120Zm0-160v-80h560v80H120Zm680 320q-17 0-28.5-11.5T760-320q0-17 11.5-28.5T800-360q17 0 28.5 11.5T840-320q0 17-11.5 28.5T800-280Zm0-160q-17 0-28.5-11.5T760-480q0-17 11.5-28.5T800-520q17 0 28.5 11.5T840-480q0 17-11.5 28.5T800-440Zm0-160q-17 0-28.5-11.5T760-640q0-17 11.5-28.5T800-680q17 0 28.5 11.5T840-640q0 17-11.5 28.5T800-600Z"/></svg>`
}


// ----------------------------------
//       # parse text funtions

function split_data(data) {
    const split_sep = "__SPLIT__";
    return data.replace(/\r\n|\r|\n/g, split_sep).split(split_sep);
}

function obtain_deck_splited(data_array) {
    const indexes = ["#main", "#extra", "!side"].map(d => data_array.indexOf(d))
        .concat([data_array.length]);
    return [0, 1, 2].map(d => data_array.slice(indexes[d] + 1, indexes[d + 1]));
};

const obtainMyCgid = () => {
    const my_deck_btn = $("#header_menu>nav>div.bottom>ul.main_menu>li.my.menu_my_decks>ul>li>a:eq(0)");
    if (my_deck_btn.length == 0) {
        return null;
    } else return $(my_deck_btn).prop("href").match(/cgid=([^\&=]+)/)[1];
}

const obtainMyYtkn = async (flag_fetch = false, params_in = null) => {
    const temps = await operateStorage({ temps: JSON.stringify({}) }, "local")
        .then(items => Object.assign(defaultTemps, JSON.parse(items.temps)));
    if (flag_fetch === false && params_in === null) return temps.ytkn;
    const url = "https://www.db.yugioh-card.com/yugiohdb/member_deck.action";
    const my_cgid = obtainMyCgid();
    const params = Object.assign({
        ope: "4",
        wname: obtain_YGODB_fromHidden("wname"),
        cgid: my_cgid
    }, params_in);
    const body = parseHTML(await obtainStreamBody(url, params));
    const ytkn = obtain_YGODB_fromHidden("ytkn", body);
    const new_temps = Object.assign(temps, { ytkn: ytkn });
    await operateStorage({ temps: JSON.stringify(new_temps) }, "local", "set");
    return ytkn
}

const obtainLang = () => {
    const meta_lang = $("meta[http-equiv='Content-Language']");
    if (meta_lang.length === 0) return null;
    else return $(meta_lang).prop("content");
}

const shuffleArray = (arr) => {
    const arr_len = arr.length;
    for (const ind_now of [...Array(arr_len).keys()].map(d => arr_len - 1 - d)) {
        const ind_rand = Math.floor(Math.random() * (ind_now + 1));
        [arr[ind_now], arr[ind_rand]] = [arr[ind_rand], arr[ind_now]];
    }
    return arr;
}
// # ----- obtain Row Results --------
const obtainRowResults = (df = null, onViewIn = null, deck_textIn = null) => {
    const html_parse_dic = parse_YGODB_URL(location.href, true);
    // onView false => Edit mode
    const onView_dic = { "1": true, "2": false, null: true, "8": false };
    const onView = onViewIn === null ? onView_dic[html_parse_dic.ope] : onViewIn;
    const deck_text = deck_textIn !== null ? deck_textIn : document.getElementById("deck_text");
    return Object.assign(...Array.from(deck_text.querySelectorAll("table[id$='_list']")).map(table_list => {
        const row_name = table_list.id.match(/^(\S+)_list/)[1];
        const input_span = (onView === true) ? "span" : "input";
        const td_dic = {
            name: (onView === true) ? "td.card_name>div.icon" : "td>div.card_name",
            num: "td.num", //(onView===true) ? "td.num":
            cid: (onView === true) ? "td.card_name" : "td>div.card_name"
        }
        const names = Array.from(
            table_list.querySelectorAll(
                `tbody>tr>${td_dic.name}>${input_span}`)
        ).map(d => (onView) ? d.innerText : d.value
        ).filter(d => d.length > 0);
        // const _names = Array.from($(`table#${row_name}_list tbody>tr>${td_dic.name}>${input_span}`, deck_text))
        //     .map(d => (onView) ? $(d).text() : d.value);
        const nums = Array.from(
            table_list.querySelectorAll(
                `tbody>tr>${td_dic.num}>${input_span}`)
        ).map(d => (onView) ? d.innerText.trim() : d.value
        ).filter(d => d.length > 0);

        // const nums = Array.from($(`table#${row_name}_list tbody>tr>${td_dic.num}>${input_span}`, deck_text))
        //     .map(d => (onView) ? $(d).text() : d.value);
        const cids = Array.from(
            table_list.querySelectorAll(
                `tbody>tr>${td_dic.cid}>input.link_value`)
        ).map(d => d.value
        ).filter(d => d.length > 0).map(d => d.match(/cid=(\d+)/)[1]);

        // const cids = (onView) ? Array.from($(`table#${row_name}_list tbody>tr>${td_dic.name}>input.link_value`, deck_text))
        //     .map(d => $(d).attr("value").match(/(?<=cid=)\d+/)[0]) : [];
        //     // Array.from($(`table#${row_name}_list tbody>tr>input.imgs`, deck_text))
        //     //.map(d => $(d).attr("value").match(/^\d+/)[0]);
        const limits = Array.from(table_list.querySelectorAll(`tbody>tr`))
            .map(tr => ["semi_limited", "forbidden", "limited"
            ].filter(d => tr.className.indexOf(d) !== -1).concat(["not_limited"])[0]);
        // const limits = Array.from(table_list.querySelectorAll(`tbody>tr`))
        //     .map(tr => ["semi_limited", "forbidden", "limited"
        //     ].filter(d => $(tr).hasClass(d)).concat(["not_limited"])[0]);
        const row_info_tmp = names.map((card_name, card_ind) => {
            const card_num = nums[card_ind];
            const card_limit = limits[card_ind];
            if ([card_name, card_num, card_limit].some(d => d == "" || d == null)) return null;
            const card_cid_tmp = (onView === false && df !== null) ? df_filter(df, "cid", ["name", card_name])[0] : null;
            const card_cid = (onView === true) ? cids[card_ind] : card_cid_tmp;
            return { name: card_name, num: parseInt(card_num), limit: card_limit, cid: card_cid };
        }).filter(d => d !== null);
        const row_dic_tmp = ["name", "num", "cid", "limit"].map(key => Object({ [`${key}s`]: row_info_tmp.map(d => d[key]) }));
        return {
            [row_name]: Object.assign(...row_dic_tmp)
        }
    }))
    /*    const rows_num = $("#deck_text [id$='_list']").length;
        const row_names = [...Array(rows_num).keys()].map(row_ind => $(`#deck_text [id$='_list']:eq(${row_ind})`).attr("id")
            .match(/^\S*(?=_list)/)[0]);
        return Object.assign(...[...Array(rows_num).keys()].map(row_ind => {
            const row_name = row_names[row_ind]
            const card_length = $(`#deck_text [id$='_list']:eq(${row_ind}) td.card_name`).length;
            return {
                [row_name]: {
                    names: [...Array(card_length).keys()]
                        .map(ind_card => $(`#deck_text [id$='_list']:eq(${row_ind}) td.card_name:eq(${ind_card})`).text().replaceAll(/^\s*|\s*$/g, "")),
                    cids: [...Array(card_length).keys()]
                        .map(ind_card => $(`#deck_text [id$='_list']:eq(${row_ind}) td.card_name:eq(${ind_card})>input.link_value`)
                            .val().match(/(?<=cid=)\d+/)[0] - 0),
                    nums: [...Array(card_length).keys()]
                        .map(ind_card => $(`#deck_text [id$='_list']:eq(${row_ind}) td.num:eq(${ind_card})`).text().match(/\d/)[0]),
                    limits: [...Array(card_length).keys()]
                    .map(ind_card => {
                        const tr=$(`#deck_text [id$='_list']:eq(${row_ind}) tr:eq(${ind_card})`);
                        return ["semi_limited", "forbidden", "limited"].filter(d=>$(tr).hasClass(d)).concat(["not_limited"])[0];
                    }),
                }
            };
        }))*/
}

// from edit mode
/*const obtainRowResults_Edit = (df = null) => {
    return obtainRowResults(df);
    const rows_num = $("#deck_text [id$='_list']").length;
    const row_names = [...Array(rows_num).keys()].map(row_ind => $(`#deck_text [id$='_list']:eq(${row_ind})`).attr("id")
        .match(/^\S*(?=_list)/)[0]);
    return Object.assign(...[...Array(rows_num).keys()].map(row_ind => {
        const row_name = row_names[row_ind];
        const row_short_name = row_name.slice(0, 2);
        //const card_length = $(`#deck_text [id$='_list']:eq(${row_ind}) td.card_name`).length;
        const card_length_max = $(`input[name='${row_short_name}nm']`).length;
        const result_tmp = [...Array(card_length_max).keys()].map(card_ind => {
            const input_name=$(`#${row_short_name}nm_${card_ind + 1}`);
            const name_tmp = $(input_name).prop("value");//.replaceAll(/^\s*|\s*$/g, "");
            if (name_tmp.length===0) return null;
            const num_tmp = parseInt($(`#${row_short_name}num_${card_ind + 1}`).prop("value"));//.replaceAll(/^\s*|\s*$/g, "")
            const tr=$(input_name).parents(`table#${row_name}_list>tbody>tr`)[0];
            //console.log({input_name, name_tmp, class_arr})
            const limit_tmp=["semi_limited", "forbidden", "limited"].filter(d=>$(tr).hasClass(d)).concat(["not_limited"])[0];
            if (name_tmp.length > 0 && Number.isInteger(num_tmp) && num_tmp > 0 && num_tmp < 4) {
                return { name: name_tmp, num: num_tmp, limit: limit_tmp };
            } else return null;
        }).filter(d => d !== null);
        const cids_tmp= (df !== null) ? result_tmp.map(d=>df_filter(df, "cid", ["name", d.name])[0]) : result_tmp.map(_=>null);
        return {
            [row_name]: {
                names: result_tmp.map(d => d.name),
                nums: result_tmp.map(d => d.num),
                limits: result_tmp.map(d=>d.limit),
                cids: cids_tmp
            }
        };
    }))
}*/

const obtainDeckHeader_raw = async (url_deck = null, deck_headerIn = null) => {
    //const term_tables=await obtainTermTables();
    const _obtainDeckHeaderArea = async (url_deck = url_deck) => {
        const html_parse_dic = parse_YGODB_URL(url_deck || location.href);
        if (["cgid", "dno"].filter(d => html_parse_dic[d] != null).length !== 2) return [];
        else if (url_deck !== null && url_deck !== location.href) {
            const parsed_html = $.parseHTML(await obtainStreamBody(url_deck));
            return { header: $("#deck_header", parsed_html), title: $("#broad_title", parsed_html) };
        } else {
            return { header: $("#deck_header"), title: $("#broad_title") };
        }
    }
    const header_dic = deck_headerIn !== null ? deck_headerIn : await _obtainDeckHeaderArea(url_deck);
    if (header_dic.header.length === 0 || header_dic.title.length === 0) return null;
    const header_area = header_dic.header;
    const header_title = header_dic.title;
    return {
        pflag: $("div>h1", header_title).text().match(/【 (.*) 】/)[1],
        deck_type: Array.from($(".text_set>span:eq(0)", header_area)).map(d => $(d).text()),
        deck_style: Array.from($(".text_set>span:eq(1)", header_area)).map(d => $(d).text()),
        category: $(".regist_category>span", header_area).length === 0 ? [] : Array.from($(".regist_category>span", header_area)).map(d => d.textContent),
        tag: $(".regist_tag>span", header_area).length === 0 ? [] : Array.from($(".regist_tag>span", header_area)).map(d => d.textContent),
        comment: Array.from($(".text_set>span.biko", header_area)).map(d => $(d).text())
    }
}

const _obtainHiddenHeader = (html_edit) => {
    return Object.assign(...["dno", "pflg", "deck_type", "deckStyle"]
        .map(k => {
            const match_res = html_edit.match(new RegExp(`\\(\'#${k}\'\\)\.val\\(\'([^\\)]*)\'\\)`));
            return { [k]: (match_res == null || match_res.length < 1) ? "" : match_res[1] };
        }))
}

const _obtainSerializedHeader = (serialized_header, html_edit) => {
    const sps_par = new URLSearchParams(serialized_header);
    Object.entries(_obtainHiddenHeader(html_edit)).map(([k, v]) => sps_par.set(k, v));
    return sps_par.toString();
}

const obtainDeckHeader_edit = async (html_parse_dic, html_editIn = null) => {
    const my_cgid = obtainMyCgid();
    if (["cgid", "dno"].filter(d => html_parse_dic[d] != null).length !== 2) return null;
    else if (html_parse_dic.cgid != my_cgid) return null;
    const html_parse_dic_valid = Object.assign(...["cgid", "dno"].map(k => Object({ [k]: html_parse_dic[k] })), { ope: 2 });
    const sps = new URLSearchParams(html_parse_dic_valid);
    const url_edit = `/yugiohdb/member_deck.action?` + sps.toString();
    const html_edit = html_editIn !== null ? html_editIn.prop("outerHTML") : await obtainStreamBody(url_edit);
    //const parsed_html = $.parseHTML(html_edit);
    const serialized_header = $("#deck_header input, #deck_header select, #deck_header textarea", html_edit).serialize();
    //console.log(serialized_header, html_edit)
    return _obtainSerializedHeader(serialized_header, html_edit);
}

const serializeRowResults = (row_results) => {
    const row_maxLength_dic = { monster: 65, spell: 65, trap: 65, extra: 20, side: 20 }
    return Object.entries(row_results).map(([row_name, row_result]) => {
        const row_name_veryShort = row_name.slice(0, 2);
        const row_maxLength = row_maxLength_dic[row_name];
        const row_length = row_result.names.length;
        return [...Array(row_maxLength).keys()].map(ind => {
            if (ind + 1 > row_length) {
                return {
                    [row_name_veryShort + "nm"]: "",
                    [row_name_veryShort + "num"]: ""
                }
            } else {
                return {
                    [row_name_veryShort + "nm"]: encodeURIComponent(row_result.names[ind]),
                    [row_name_veryShort + "num"]: row_result.nums[ind]
                }
            }
        }).map(d => (new URLSearchParams(d)).toString()).join("&");
    }).join("&");
}
// ## operate recipie
const operateRowResults = (
    row_results = {},
    cidIn = 10,
    change = 1,
    to_row_type = null,
    df = null) => {
    const num_all = Object.values(row_results).map(row_result => {
        const ind_fromCid = row_result.cids.indexOf(cidIn);
        if (ind_fromCid !== -1) return row_result.nums[ind_fromCid];
        else return 0;
    }).filter(d => d !== null).map(d => parseInt(d)).concat([0]).reduce((acc, cur) => acc + cur);
    if (num_all + change > 3) return row_results;
    const row_results_new_tmp = Object.entries(row_results).map(([row_type, row_result]) => {
        const ind_fromCid = row_result.cids.indexOf(cidIn);
        if ((ind_fromCid === -1 && change <= 0) || to_row_type !== row_type) return { [row_type]: row_result }
        const num_old = (ind_fromCid === -1) ? 0 : row_result.nums[ind_fromCid];
        const num_new = Math.max(0, Math.min(3, num_old + change));
        if (ind_fromCid !== -1 && num_new === 0) {
            const row_result_tmp = Object.entries(row_result)
                .map(([k, v]) => Object({ [k]: [...v.slice(0, ind_fromCid), ...v.slice(ind_fromCid + 1)] }));
            return { [row_type]: Object.assign(...row_result_tmp) };
        } else if (ind_fromCid === -1 && change > 0 && df !== null) {
            const name_now = df_filter(df, "name", ["cid", cidIn])[0];
            const limit_now = "NaN";
            row_result.names.push(name_now)
            row_result.nums.push(change);
            row_result.limits.push(limit_now);
            row_result.cids.push(cidIn);
        } else if (ind_fromCid !== -1) {
            row_result.nums[ind_fromCid] = num_new;
        }
        return { [row_type]: row_result };
    })
    return Object.assign(...row_results_new_tmp);
}

const guessDeckCategory = async (lower_limit = 4, kwargsIn = {}) => {
    //const kwargs_default={count:true, value:true};
    //const kwargs=Object.assign(kwargs_default, kwargsIn);
    const row_results = obtainRowResults();
    const url = "https://www.db.yugioh-card.com/yugiohdb/deck_search.action"
    const body = await obtainStreamBody(url);
    const cats = Array.from($("select#dckCategoryMst>option:not([value=''])", body))
        .map(option => [$(option).text(), $(option).val()])
        .map(([cat, val]) => {
            const before_par = cat.match(/^([^（]{2,})（.*）$/);
            if (before_par != null && before_par.length == 2) return [before_par[1], val];
            else return [cat, val];
        });
    const names = Object.values(row_results).map(d => d.names).flat();
    const nums = Object.values(row_results).map(d => d.nums).flat();
    return cats.map(([cat, val]) => Object({
        name: cat,
        value: val,
        num: names.map((card_name, card_ind) => {
            if (card_name.indexOf(cat) === -1) return 0;
            else return nums[card_ind];
        }).reduce((acc, cur) => acc + cur)
    })
    ).filter(d => d.num >= lower_limit).sort((a, b) => a.num - b.num).slice(-3);
}

const showMessage = (content = null) => {
    const html_parse_dic = parse_YGODB_URL(location.href, true);
    if (html_parse_dic.ope === "1" && $("#message").length === 0) {
        const header_box = document.getElementById("header_box");
        const span = document.createElement("span");
        span.setAttribute("id", "test");
        header_box.after(span);
        // $("div.sort_set div.pulldown").prepend($("<span>", { id: "message" }));
    }

    const message_area = document.getElementById("message");
    if (content === null) {
        message_area.classList.add("none");
    } else {
        message_area.classList.remove("none");
        message_area.style.width = "97%";
        message_area.style.margin = "5px";
        message_area.style.padding = "3px";
        message_area.innerHTML = content;
    }

}

const guess_clicked = async (card_num = 4) => {
    const html_parse_dic = parse_YGODB_URL(location.href, true);
    if (html_parse_dic.ope === "1" && $("#message").length === 0) $("div.sort_set div.pulldown").prepend($("<span>", { id: "message" }));
    // const message_area = $("#message");
    // $(message_area).removeClass("none");
    // $(message_area).css({ width: "97%" });
    const cat_guessed = await guessDeckCategory(card_num);
    const content = "Guessed Categories: " + cat_guessed.map(d => d.name).join(", ");
    // console.log(content);
    showMessage(content);
    // $(message_area).html(content);
    if (["2", "8"].indexOf(html_parse_dic.ope) !== -1) {
        const select = $("select#dckCategoryMst");
        cat_guessed.map(catInfo => {
            const option = $(`option[value=${catInfo.value}]`, select);
            $(option).prop("selected", true);
            //$(option).attr("checked", true);
            $(option).addClass("guessed");
        });
        const dnm = $("#dnm");
        if ($(dnm).val() === "") $(dnm).val(cat_guessed.map(d => d.name).join(""));
    }
}

const convertRowResults = (df, row_results, toMin = true) => {
    return Object.assign(...Object.entries(row_results).map(([row_name, row_result]) => {
        const cids = row_result.cids;
        const names = row_result.names;
        const nums = row_result.nums;
        if ((names === undefined && cids === undefined) || nums === undefined) return null;
        const cids_valid = (cids === undefined) ? names.map(d => df_filter(df, "cid", ["name", d])[0]) : cids;
        return {
            [row_name]: (toMin === true) ? {
                cids: cids_valid,
                nums: nums
            } : {
                cids: cids_valid,
                names: (names === undefined) ? cids_valid.map(d => df_filter(df, "name", ["cid", d])[0]) : names,
                nums: nums,
                limits: cids_valid.map(d => "not_limited")
            }
        }
    }))
}

// obtain df tmp

/*const obtainDFDeck = () => {
    const obtainCardInfoFromTable = (t_row) => {
        const card_name = $("div.inside>div.card_name.flex_1>span.name", t_row).text().replaceAll(/^\s*|\s*$/g, "");
        const card_type_icon = $("div.inside>div.card_name.flex_1>img.ui-draggable:eq(0)", t_row).prop("src").match(/card_icon_(\S+)\.\w+$/)[1];
        const card_attr = $("div.inside>div.element>div.item_set>span:eq(0)>img.ui-draggable:eq(0)", t_row).prop("src").match(/attribute_icon_(\S+)\.\w+$/)[1];
        const card_attr2 = card_attr.slice(0, 1).toUpperCase() + card_attr.slice(1,).toLowerCase();
        //const card_num=parseInt($("div.cards_num_set>span", t_row).text().replaceAll(/^\s*|\s*$/g, ""));
        const flex_st = $("div.inside>div.element>div.flex_3.other", t_row);
        const flex_mon = $("div.inside>div.element>div.flex_2.other", t_row);
        const flex_mon_stat = $("div.inside>div.element>div.num_set.flex_1", t_row);

        // optionで編集できるように?
        const card_type_dic_dic = {
            spell: { "通常": "Normal", "速攻": "Quick-Play", "永続": "Continuous", "装備": "Equip", "フィールド": "Field" },
            trap: { "通常": "Normal", "永続": "Continuous", "カウンター": "Counter" },
            monster: { "効果": "Effect", "通常": "Non-Effect", "チューナー": "Tuner", "ペンデュラム": "Pendulumn", "融合": "Fusion", "シンクロ": "Synchro", "エクシーズ": "XYZ", "リンク": "Link" },
            monster_race: {}
        }
        const obtainCardType = (type_raw, card_type_dic, card_type_base) => {
            const card_type_base2 = card_type_base.slice(0, 1).toUpperCase() + card_type_base.slice(1,).toLowerCase();
            let card_type_tmp = Object.entries(card_type_dic).map(kv => {
                const content = kv[1];
                if (type_raw.indexOf(kv[0]) != -1 || type_raw.indexOf(kv[1]) != -1) {
                    return [true, content];
                } else {
                    return [false, content]
                }
            }).filter(d => d[0]).map(d => d[1]);
            card_type_tmp.push(card_type_base2);
            return card_type_tmp;
        }
        const df_keys = ["name", "type", "race", "atk", "def", "attribute", "scale", "level", "ot", "cid", "id"]
        const df_base = Object.assign(...df_keys.map(d => ({ [d]: null })));
        if (flex_st.length > 0) {
            // spell and trap
            const card_type_base = ["spell", "trap"].filter(d => card_type_icon.indexOf(d) != -1)[0];
            const card_type_dic = card_type_dic_dic[card_type_base]
            const card_type_raw = $("span:eq(0)", flex_st).text().replaceAll(/^\s*|【\s*|\s*】|\s*$/g, "");
            const card_type = obtainCardType(card_type_raw, card_type_dic, card_type_base);
            const df_now = { name: card_name, type: card_type.join(","), ot: "OCG+" }
            return Object.assign(df_base, df_now);
        } else if (flex_mon.length > 0 && flex_mon_stat.length > 0) {
            // monster
            const card_type_base = "monster";
            const card_type_dic = card_type_dic_dic[card_type_base]
            const card_type_raw = $("span:eq(0)", flex_mon).text().replaceAll(/^\s*|【\s*|\s*】|\s*$/g, "");
            const card_type = obtainCardType(card_type_raw, card_type_dic, card_type_base);
            const card_stat_par_dic = { level: "span:eq(0)", scale: "span:eq(1)", atk: "div:eq(0)>span:eq(0)", def: "div:eq(0)>span:eq(1)" }
            const card_stat = Object.assign(...Object.entries(card_stat_par_dic).map(kv => {
                const par_cand = $(kv[1], flex_mon_stat).text().match(/\d+/g)
                if (Array.isArray(par_cand)) return { [kv[0]]: par_cand[0] }
                else return { [kv[0]]: null }
            }))
            const df_now = {
                name: card_name, type: card_type.join(","),
                atk: card_stat.atk, def: card_simportDeckinsertat.def,
                attribute: card_attr2, scale: card_stat.scale,
                level: card_stat.level, ot: "OCG+"
            };
            return Object.assign(df_base, df_now);
        }
    }
    const df_arr = Array.from($("#main_m_list>div.t_body>div.t_row.c_simple"))
        .map(t_row => obtainCardInfoFromTable(t_row))
    return Object.assign(...Object.keys(df_arr[0]).map(k => ({ [k]: df_arr.map(d => d[k]) })))
}*/

// import cards
const importDeck = (row_results) => {
    for (const [row_name, row_result] of Object.entries(row_results)) {
        //const row_name = row_names[tab_ind];
        //const tab_ind=row_names.indexOf(row_name);
        const row_short_name = row_name.slice(0, 2);
        // reset
        [...Array(60).keys()].forEach(ind2 => {
            $(`#${row_name}_list #${row_short_name}nm_${ind2 + 1}`).val("");
            $(`#${row_name}_list #${row_short_name}num_${ind2 + 1}`).val("");
        })
        if (row_result.names.length == 0) continue;
        const card_names = row_result.names;
        const card_nums = row_result.nums;
        //input name and number
        card_names.forEach((name, ind2) => {
            $(`#${row_name}_list #${row_short_name}nm_${ind2 + 1}`).val(name);
            $(`#${row_name}_list #${row_short_name}num_${ind2 + 1}`).val(card_nums[ind2]);
        })
        //input count
        const sum_num = card_nums.reduce((acc, cur) => acc + parseInt(cur), 0);
        [0, 1].forEach(d => {
            const total_count = $(`.${row_name}_total:eq(${d})`);
            total_count.empty();
            total_count.append(sum_num);
        })
    }
    //input main_total
    const main_total = $(".main_total");
    main_total.empty();
    const main_total_num = [0, 1, 2].reduce((acc, cur) => acc + Number($(`.main_count:eq(${cur})`).text()), 0);
    main_total.append(main_total_num);
    return main_total_num;
}

// ## save/regist


const _Regist_fromYGODB = async (
    html_parse_dic_in = null,
    serialized_data_in = null,
    ytkn_in = null,
    retry_count = 0) => {
    const html_parse_dic = html_parse_dic_in || parse_YGODB_URL(location.href, true);
    if (["cgid", "dno"].filter(d => html_parse_dic[d] !== null).length !== 2) return;
    const lang = obtainLang()
    const request_locale = lang != null ? `&request_locale=` + lang : "";
    if (serialized_data_in === null && $("#form_regist").length === 0) return;
    // const serialized_data = serialized_data_in || "ope=3&" + $("#form_regist").serialize();
    // console.log("ope=3&" + $("#form_regist").serialize());
    const serialized_data = (serialized_data_in || "ope=3&" + $("#form_regist").serialize());
    const dno = serialized_data.match(/dno=(\d+)/)[1];
    const deck_name = decodeURI(serialized_data.match(/dnm=([^&]+)/)[1]);
    // const temps = await operateStorage({ temps: JSON.stringify({}) }, "local")
    //     .then(items => Object.assign(defaultTemps, JSON.parse(items.temps)));
    // console.log(temps.ytkn, obtain_YGODB_fromHidden("ytkn"))
    // const ytkn = temps.ytkn || obtain_YGODB_fromHidden("ytkn");
    const ytkn = await obtainMyYtkn(true, { dno: dno, ope: 2 });
    // console.log(ytkn);
    const serialized_data_ytkn = serialized_data.replace(/ytkn=[^&]+/, "ytkn=" + ytkn);
    // console.log(serialized_data_ytkn)
    // const sps=new URLSearchParams(serialized_data);
    // console.log("ope=3&" + $("#form_regist").serialize());
    // sps.set("ope", "3");
    // {
    //     ope:"2",
    //     wname:html_parse_dic.wname,
    //     cgid:obtainMyCgid(),
    //     dno:serialized_data.match(/dno=(\d+)/)[1],
    //     ytkn:html_parse_dic.ytkn
    // }
    const url = `/yugiohdb/member_deck.action?cgid=${obtainMyCgid()}&${request_locale}`;
    return await $.ajax({
        type: 'post',
        url: url,
        data: serialized_data_ytkn,//"ope=3&" + $("#form_regist").serialize(),//sps.toString(),
        dataType: 'json',
        beforeSend: () => {
            $('#btn_regist').removeAttr('href');
            // $('#message').hide().text('');
            $('#loader').show();
        },
        complete: () => {
            $('#loader').hide();
        },
        success: (data, dataType) => {
            if (data.result) {
                console.log("Saved");
                showMessage(`Saved as ${deck_name} #${dno}`);
            } else {
                showMessage(`Failed to save as ${deck_name} #${dno}`);
                if (data.error) {
                    console.log("Register falied: ", data.error);
                    /*var lst = [];
                    $.each(data.error, function(index, value){
                        lst.push($.escapeHTML(value));
                    });
                    console.log(lst);*/
                    //$('#message').append('<ul><li>' + lst.join('</li><li>') + '</li></ul>').show();
                } else console.log("Register falied: ", data);
                //$('#btn_regist').attr('href', 'javascript:Regist();');
            }
        },
        error: async function (xhr, status, error) {
            // console.log(url);
            // console.log(serialized_data);
            // console.log(serialized_data_ytkn);
            console.log(error);
            // if (retry_count==0) {
            //     await _Regist_fromYGODB(html_parse_dic, serialized_data, retry_count+1);
            // }
        }
    });
}


// const _Fetch_Regist_fromYGODB = async (html_parse_dic_in = null, serialized_data_in = null) => {
//     const html_parse_dic = html_parse_dic_in || parse_YGODB_URL(location.href, true);
//     if (["cgid", "dno"].filter(d => html_parse_dic[d] !== null).length !== 2) return;
//     const lang = obtainLang()
//     const request_locale = lang != null ? `&request_locale=` + lang : "";
//     if (serialized_data_in === null && $("#form_regist").length === 0) return;
//     const serialized_data = serialized_data_in || "ope=3&" + $("#form_regist").serialize();
//     const sps = new URLSearchParams(serialized_data);
//     console.log(lang, request_locale);
//     sps.set("ope", "3");
//     sps.set("wname", html_parse_dic.wname);
//     sps.set("ytkn", obtainMyYtkn({
//         ope:"2",
//         wname:html_parse_dic.wname,
//         cgid:obtainMyCgid(),
//         dno:serialized_data.match(/dno=(\d+)/)[1],
//         ytkn:html_parse_dic.ytkn
//     }));
//     const url_post = `/yugiohdb/member_deck.action?cgid=${html_parse_dic.cgid}&${request_locale}`
//     $('#btn_regist').removeAttr('href');
//     $('#message').hide().text('');
//     $('#loader').show();
//     //console.log(sps);
//     // console.log(sps.toString());
//     return await fetch(url_post, {
//         method: "POST",
//         body: sps,
//         headers: {
//             "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
//             "Accept": "applacation/text"
//         }
//     }
//     ).then(data => {
//         if (data.result) {
//             console.log("Registered");
//         } else {
//             if (data.error) {
//                 console.log("Register falied: ", data.error);
//                 /*var lst = [];
//                 $.each(data.error, function(index, value){
//                     lst.push($.escapeHTML(value));
//                 });
//                 console.log(lst);*/
//                 //$('#message').append('<ul><li>' + lst.join('</li><li>') + '</li></ul>').show();
//             } else console.log("Register falied: ", data);
//             //$('#btn_regist').attr('href', 'javascript:Regist();');
//         }
//         return data
//     }).then(_ => $('#loader').hide());
// }

/*const __FetchNotWork_Regist_fromYGODB = async () => {
    const html_parse_dic = parse_YGODB_URL(location.href, true);
    console.log(html_parse_dic);
    if (["cgid", "dno"].filter(d => html_parse_dic[d] != null).length !== 2) return;
    const request_locale = html_parse_dic.request_locale !== null ? `&request_locale=` + html_parse_dic.request_locale : "";

    $('#btn_regist').removeAttr('href');
    $('#message').hide().text('');
    $('#loader').show();
    const res = await fetch(`/yugiohdb/member_deck.action?cgid=${html_parse_dic.cgid}${request_locale}`, {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: 'ope=3&' + $('#form_regist').serialize()
    });
    console.log(res)
    //.then(d => d.body)
    //.then(d => d.getReader())
    //.then(reader => reader.read())
    //.then(res => new TextDecoder("utf-8").decode(res.value));
    //console.log(data);
    $('#loader').hide();
    if (res.ok) {
        console.log("Registered")
        //location.href = `/yugiohdb/member_deck.action?cgid=${html_parse_dic.cgid}&dno=${html_parse_dic.dno}${request_locale}`;
    } else {
        if (res.error) {
            var lst = [];
            $.each(data.error, function (index, value) {
                lst.push($.escapeHTML(value));
            });
            $('#message').append('<ul><li>' + lst.join('</li><li>') + '</li></ul>').show();
        }
        $('#btn_regist').attr('href', 'javascript:Regist();');
    }
}*/

const load_deckOfficial = async (df, deck_dno, settings, my_cgid = null) => {
    if (my_cgid === null) my_cgid = obtainMyCgid();
    const deck_body = await _nojqObtainDeckRecipie(my_cgid, deck_dno, obtainLang(), "2");
    const deck_name = deck_body.body.querySelector("#dnm").value;
    console.log(deck_name);
    // console.log(deck_body.body.innerHTML);
    const ytkn = deck_body.body.querySelector("input#ytkn").value;
    const temps = await operateStorage({ temps: JSON.stringify({}) }, "local")
        .then(items => Object.assign(defaultTemps, JSON.parse(items.temps)));
    const new_temps = Object.assign(temps, { ytkn: ytkn });
    await operateStorage({ temps: JSON.stringify(new_temps) }, "local", "set");
    const row_results = obtainRowResults(df, false, deck_body.text);
    const input_dno = document.querySelector("input#dno");
    input_dno.value = deck_dno;
    if (settings.valid_feature_deckManager === true) {
        document.getElementById("deck_dno_opened").innerText = deck_dno;
        document.getElementById("dnm").setAttribute("placeholder", deck_name);
        document.getElementById("dnm").value = "";
    }
    document.getElementById("dnm").value = deck_name;
    // import
    importDeck(row_results);
    if (settings.valid_feature_deckEditImage === true) insertDeckImg(df, row_results);
    // header
    const header_names = {
        input: ["dnm", "biko"],
        select: ["dckCategoryMst", "dckTagMst"]
    }
    for (const [type, arr] of Object.entries(header_names)) {
        for (const dom_id of arr) {
            if (type === "input") {
                const old_val = deck_body.header.querySelector(`#${dom_id}`).value;
                document.querySelector(`#${dom_id}`).value = old_val;
            } else if (type === "select") {
                const select = document.querySelector(`#${dom_id}`);
                const select_old = deck_body.header.querySelector(`#${dom_id}`);
                // #/ 全部選択されてる
                Array.from(select.querySelectorAll("option")
                ).map(option => {
                    // option.setAttribute("selected", false);
                    option.selected = null;
                })
                Array.from(select_old.querySelectorAll(`option[selected]`)
                ).map(option => {
                    const val = option.value;
                    const option_new = select.querySelector(`option[value='${val}']`);
                    option_new.setAttribute("selected", true);
                    option_new.selected = true;

                })
            }
        }
    }
    // ,"dno","pflg", "deck_type", "deckStyle"
    Object.entries(_obtainHiddenHeader(deck_body.body.innerHTML)).map(([k, v]) => {
        document.querySelector(`#${k}`).value = v;
    })
    showSelectedOption();
    showMessage(`Loaded ${deck_name} #${deck_dno}`);
}

const delete_deckOfficial = async (
    df_in = null,
    settings_in = null,
    dno = null,
    deck_name = null,
    flag_load = true,
    cgid_in = null,
    row_results_in = null) => {
    if (dno === null || deck_name === null) {
        return false
    }
    const df = df_in || await obtainDF(obtainLang());
    const settings = settings_in;
    const my_cgid = cgid_in || obtainMyCgid();
    //const dno = $("#dno").val();
    const lang = obtainLang();
    // const deck_name_tmp2 = deck_name_tmp.replace(/\s*#\d+$/, "");
    // const deck_name = deck_name_tmp2.length > 0 ? deck_name_tmp2 : deck_name_opened || Date.now().toString();
    // const deck_dno = (deck_dno_tmp != null && deck_dno_tmp.length >= 2) ? deck_dno_tmp[1] : deck_dno_opened;
    if (row_results_in !== null) {
        await operateDeckVersion("set", { name: "@@Auto", tag: "_delete_" + deck_name }, row_results_in);
    } else {
        const html_dic = await _nojqObtainDeckRecipie(my_cgid, dno, lang, "1");
        const row_results = obtainRowResults(df, true, html_dic.text);
        await operateDeckVersion("set",
            { name: "@@Auto", tag: "_delete_" + deck_name },
            row_results);
    }
    const ytkn = await obtainMyYtkn(true, { ope: 1, dno: dno });
    const sps = {
        cgid: my_cgid,
        request_locale: lang,
        dno: dno,
        ope: 7,
        wname: obtain_YGODB_fromHidden("wname"),
        ytkn: ytkn
    };
    // const sps = new URLSearchParams(sps_dic);
    const url = "https://www.db.yugioh-card.com/yugiohdb/member_deck.action";// + sps.toString();
    const res = await fetchParams(url, sps);
    if (!res.ok) {
        console.log(res);
        return;
    }
    if (flag_load === true) {
        const deckList = await obtainDeckListOfficial();
        const dnos = deckList.map(d => d.dno);
        const dnos_smaller = dnos.filter(d => parseInt(d) < dno);
        const dno_load = (dnos_smaller.length === 0) ? Math.max(...dnos) : Math.max(...dnos_smaller);
        await load_deckOfficial(df, dno_load, settings, my_cgid);
    }
}

const generateNewDeck = async (html_parse_dic_in = null) => {
    // const html_parse_dic = html_parse_dic_in || parse_YGODB_URL(location.href, true);
    const my_cgid = obtainMyCgid();
    // const url_decklist = "https://www.db.yugioh-card.com/yugiohdb/member_deck.action";
    // const params_decklist = {
    //     ope:"4",
    //     wname:obtain_YGODB_fromHidden("wname"),
    //     cgid:my_cgid
    // }
    // const body_decklist = parseHTML(await obtainStreamBody(url_decklist, params_decklist));
    // console.log(body_decklist.innerHTML);
    // console.log(body_decklist.querySelector("#ytkn").value());

    //const dno = $("#dno").val();
    // const lang = obtainLang();
    // const deckList = await obtainDeckListOfficial();
    //const dno_new=[...Array(deckList.length+1).keys()].map(d=>d+1).filter(dno_cand=>!deckList.some(d=>d.dno==dno_cand))[0];
    const dno_tmp = 1;//Math.max(deckList.map(d => d.dno)) + 1;
    // const ytkn = obtain_YGODB_fromHidden("ytkn", body_decklist)
    const ytkn_decklist = await obtainMyYtkn(true);
    // console.log(ytkn_decklist)
    const sps = {
        ope: 6,
        wname: obtain_YGODB_fromHidden("wname"),
        ytkn: ytkn_decklist,
        cgid: my_cgid,
        // request_locale: lang,
        dno: dno_tmp
    };
    // 7c47b&cgid=87999bd183514004b8aa8afa1ff1bdb9&dno=1
    // https://www.db.yugioh-card.com/yugiohdb/member_deck.action?ope=6&wname=MemberDeck&ytkn=bc4acdcbd5a412c757fe43dc8f31b242444b31d201d1384eb4c8525cad311646&cgid=87999bd183514004b8aa8afa1ff1bdb9&dno=1
    const url = `https://www.db.yugioh-card.com/yugiohdb/member_deck.action?`;// + Object.entries(sps).filter(([k, v]) => v !== null).map(([k, v]) => `${k}=${v}`).join("&");
    // console.log(url);
    const body = parseHTML(await obtainStreamBody(url, sps));
    // console.log(body.innerHTML);
    // const ytkn = body.querySelector("input#ytkn").value;
    // const temps = await operateStorage({ temps: JSON.stringify({}) }, "local")
    //     .then(items => Object.assign(defaultTemps, JSON.parse(items.temps)));
    // const new_temps = Object.assign(temps, { ytkn: ytkn });
    // await operateStorage({ temps: JSON.stringify(new_temps) }, "local", "set");

    // #/ 動作未確認バグるかも => fixed
    const dnos = Array.from(
        body.querySelectorAll("div.t_body>div.t_row div.inside>input.link_value")
    ).map(d => d.getAttribute("value").match(/dno=(\d+)/)[1]).map(d => parseInt(d))
    // console.log(Math.max(...dnos), dnos);
    return Math.max(...dnos);//, ytkn;//{dno:dno_new, body:body};
}

// ## sort cards

const _sortCards = (row_name, row_result, df, df_now = {}) => {
    const sort_cond_base = { "cid": 0, "name": 0 }
    const sort_cond_dic_dic = {
        "monster": { "level": -1, "atk": -1, "def": -1, "id": 1 },
        "spell": { "type": ["Normal", "Quick-Play", "Continuous", "Equip", "Field"], "id": 1 },
        "trap": { "type": ["Normal", "Continuous", "Counter"], "id": 1 },
        "extra": { "type": ["Fusion", "Synchro", "XYZ", "Link"] },
        "side": { "type": ["Monster", "Spell", "Trap"] }
    }
    const sort_cond_dic = Object.assign(sort_cond_base, sort_cond_dic_dic[row_name])
    const output_tmp_cid = df_filter(df, Array.from(Object.keys(sort_cond_dic)), ["cid", row_result.cids]);
    //const output_tmp_jap = df_filter(df_now, Array.from(Object.keys(sort_cond_dic)), ["name", row_result.names]);
    // convert
    //console.log(Object.keys(output_tmp).map(k=>({[k]:output_tmp[k][ind]})))
    //[]
    const output_arr = row_result.cids.map((cid, ind_cid) => {
        const name_tmp = row_result.names[ind_cid];
        const ind_fromCid = output_tmp_cid.cid.indexOf(cid);
        //const ind_fromName = output_tmp_jap.name.indexOf(name_tmp);
        //console.log(ind_fromCid, ind_fromName)
        return Object.assign(
            ...Object.keys(output_tmp_cid).map(k => ({ [k]: output_tmp_cid[k][ind_fromCid] })),
            { cid: cid, name: name_tmp, num: row_result.nums[ind_cid], limit: row_result.limits[ind_cid] })
        /*return Object.assign(
            //...Object.keys(output_tmp_cid).map(k=>({[k]:output_tmp_cid[k][ind_fromCid]}))
            ...Object.keys(output_tmp_jap).map(k => {
                const val = output_tmp_jap[k][ind_fromName]
                if (["id", "cid"].indexOf(k) == -1) return { [k]: val }
                else if (["id"].indexOf(k) != -1) return { [k]: output_tmp_cid[k][ind_fromCid] }
                else if (["cid", "name"].indexOf(k) != -1) return { [k]: null };
            }), { cid: cid, name: name_tmp, num: row_result.nums[ind_cid] });*/
    })
    //console.log(output_arr);
    if (["extra", "side"].indexOf(row_name) != -1) {
        const output_typed = sort_cond_dic.type.map(type_tmp => {
            const output_filtered = output_arr.filter(d => d.type.indexOf(type_tmp) != -1);
            const output_res_tmp = Object.assign(...["cid", "name", "num", "limit"].map(k => ({ [k + "s"]: output_filtered.map(d => d[k]) })));
            const type_for_sort_dic = { extra: "monster", side: type_tmp.toLowerCase() }
            const type_for_sort = type_for_sort_dic[row_name];
            return _sortCards(type_for_sort, output_res_tmp, df, df_now);
        });
        return Object.assign(...["cid", "name", "num", "limit"].map(k => ({ [k + "s"]: output_typed.map(d => d[k + "s"]).flat() })));
    } else {
        const arr_sorted = output_arr.sort((a, b) => {
            const diffs = (Object.keys(sort_cond_dic).map(k => {
                const sort_cond = sort_cond_dic[k];
                const valIsValid = true//[a[k], b[k]].every(d => d!=null);
                if (valIsValid && Number.isInteger(sort_cond)) {
                    return [k, sort_cond * (parseInt(a[k]) - parseInt(b[k]))];
                } else if (valIsValid && Array.isArray(sort_cond)) {
                    const inds_for_sort = [a[k], b[k]].map(tmp_k => sort_cond.map(d => [tmp_k.indexOf(d), d]).filter(d => d[0] != -1).map(d => sort_cond.indexOf(d[1])));
                    return [k, inds_for_sort[0] - inds_for_sort[1]];
                } else return [k, 0];
            }));
            //console.log(diffs, a,b )
            const diffs2 = diffs.filter(d => Number.isInteger(d[1]) && d[1] != 0 && !Number.isNaN(d[1]));
            //console.log(diffs2[0], [...diffs2, ["",0]][0][1] ,a.name, b.name)
            return [...diffs2, ["", 0]][0][1];
        });
        return Object.assign(...["cid", "name", "num", "limit"].map(k => ({ [k + "s"]: arr_sorted.map(d => d[k]) })));
    }
}

const sortCards = async (row_results) => {
    const df = await obtainDF(obtainLang());
    //const df_now = obtainDFDeck();
    const row_results_new = Object.assign(...Object.entries(row_results)
        .map(([row_name, row_result]) => Object({ [row_name]: _sortCards(row_name, row_result, df) })));
    //console.log("sorted", row_results_new);
    return row_results_new;
}

// # shuffle

const shuffleCards = (mode = "shuffle", set_type = "main") => {
    const cards_pre_tmp = Array.from($(`#deck_image>#${set_type}>div.image_set>a:has(span>img)`));
    const cards_pre = cards_pre_tmp.length > 0 ? cards_pre_tmp : Array.from($(`#deck_image>#${set_type}>div.image_set>span:has(img)`));
    const area = Array.from($(`#deck_image>#${set_type}>div.image_set`));
    if (cards_pre.length === 0 || area.length === 0) return;
    const new_cards = mode === "shuffle" ? shuffleArray(cards_pre) : resetSortDeckImgs(cards_pre);
    new_cards.map(d => $(area).append(d));
    //$(area).html(shuffled_cards.map(d => d.outerHTML).join("\n"));
}

const resetSortDeckImgs = (cards_pre) => {
    //const card_class_arr=Array.from(main_cards)
    //    .map(d=>$("img", d).attr("class").match(/card_image_([^_]+)_(\d+)_(\d+).*/)).map(d=>Object({type:d[1], ind1:d[2], ind2:d[3]}));
    const type_ind_dic = { "monster": 0, "spell": 1, "trap": 2, "extra": 3, "side": 4 };
    return cards_pre.sort((a, b) => {
        const class_arr = [a, b].map(d => parseCardClass(d));
        const diff_dic = {
            type: class_arr.map(d => type_ind_dic[d.type]),
            ind1: class_arr.map(d => parseInt(d.ind1)),
            ind2: class_arr.map(d => parseInt(d.ind2))
        }
        for (const [num_a, num_b] of Object.values(diff_dic)) {
            if (num_a !== num_b) return num_a - num_b;
        }
        return 0;
    })
}

const addShuffleButton = (setSpace = true) => {
    $("#deck_image").addClass("shuffle");
    $("#deck_image div.card_set div.image_set a").css({ "max-width": "min(6.5%, 55px)" });
    $("#deck_image div.card_set").css({ "margin": "0px 0px 0px" });
    // const img_shuffle=document.createElement("img");
    // img_shuffle.setAttribute("src", chrome.runtime.getURL("images/svg/sort_FILL0_wght400_GRAD0_opsz24.svg"));
    // img_shuffle.setAttribute("height", "80%");
    // const img_sort=document.createElement("img");
    // img_sort.setAttribute("src","images/sort_FILL0_wght400_GRAD0_opsz24.svg");
    // const imgs_shuffle_sort=img_shuffle.outerHTML+"/"+img_sort.outerHTML
    // const shuffle_span = $("<span>", { style: "border:none; height: 24px; min-width: 0px;" })
    //     .append(svg_shuffle);//.append("L:Shuffle/R:Sort");
    // const sort_span = $("<span>", { style: "border:none; height: 24px; min-width: 0px;" })
    //     .append(svg_sort);
    const flex_dic = { "main": 4, "extra": 4, "side": 4 } // setSpace ? 2.7 : 
    for (const set_type of ["main", "extra", "side"]) {
        const span_tmp = document.createElement("span")
        for (const [key, val] of Object.entries({
            style: `flex:${flex_dic[set_type]};border:none;`,
            oncontextmenu: "return false;"
        })) {
            span_tmp.setAttribute(key, val);
        }
        const div_top = document.querySelector(`#${set_type}>div.subcatergory>div.top`);
        const h3_tmp = div_top.children[0];
        const span_num_tmp = div_top.children[1];//(`#${set_type}>div.subcatergory>div.top>h3`);
        h3_tmp.innerHTML = set_type.toUpperCase();
        h3_tmp.style["min-width"] = 0;

        for (const key of ["shuffle", "sort"]) {
            const span = document.createElement("span");
            span.setAttribute("title", `${key} ${set_type.toUpperCase()}`);
            span.setAttribute("style", "border:none; height: 24px; width: 24px; padding: 2px");
            span.innerHTML += svgs[key];
            const button = document.createElement("a")
            const attributes = {
                class: `btn hex square red button_${key}`,
                set_type: set_type,
                id: `button_${key}_${set_type}`,
                oncontextmenu: "return false;"
            }
            for (const [key, val] of Object.entries(attributes)) {
                button.setAttribute(key, val);
            }
            button.appendChild(span);
            h3_tmp.after(button);
            // span_num_tmp.before(button);
            // $(button).after(span_tmp);
        }
        // span_num_tmp.before(span_tmp);

    }
}

//---------------------------------
//         # export

async function exportAs(form = "id") {
    const html_parse_dic = parse_YGODB_URL(location.href, true);
    let exceptions = [];

    //const rows_num = $("#deck_text [id$='_list']").length;
    //const row_names = [...Array(rows_num).keys()].map(row_ind => $(`#deck_text [id$='_list']:eq(${row_ind})`).attr("id").match(/^\S*(?=_list)/)[0]);

    // const obtainRowResults
    const df = await obtainDF(obtainLang());

    const row_results = obtainRowResults(df);
    console.log(row_results);

    const keys = ["#main", "#extra", "!side"];
    let result_outputs = keys.map(_ => []);
    let result_exception_counts = keys.map(_ => 0);
    const row_name_dict = { monster: 0, spell: 0, trap: 0, extra: 1, side: 2 }
    //const row_name_inds={monster:0, spell:1, trap:2, extra:3, side:4}
    for (const [row_name, row_result] of Object.entries(row_results)) {
        //const row_ind=row_name_inds[row_name]
        const out_ind = row_name_dict[row_name];
        for (const [ind, name_tmp] of Object.entries(row_result.names)) {
            const cid_tmp = row_result.cids[ind];
            let output_comp = undefined;
            if (form == "name") output_comp = `${name_tmp}`;
            else if (form == "cid") output_comp = `${cid_tmp}`;
            else if (form == "id") {
                // convert id -> name /  convert cid -> name
                output_comp = df_filter(df, "id", ["cid", cid_tmp])[0];
                /*if (output_comp === null) {
                    const cid_db = $(`#deck_text [id$='_list']:eq(${row_ind}) .card_name:eq(${ind})`).parent("td").children("input.link_value").val().match(/(?<=cid=)\d+/)
                    output_comp = !!(cid_db) ? df_filter(df, "id", ["cid", cid_db[0]])[0] : "";
                }*/
            }
            if (output_comp === undefined || /^\s*$/.test(output_comp)) {
                // can't convert case
                const name_Jap = name_tmp //$(`#deck_text [id$='_list']:eq(${row_ind}) .card_name:eq(${ind})`).text();
                exceptions.push(name_Jap);
                // form=id and db has error => Japanese name and type wil be outputed with tab-separation
                output_comp = `${name_Jap}`; //\t${row_name}
                result_exception_counts[row_name]++;
            }
            result_outputs[out_ind].push(...Array(row_result.nums[ind] - 0).fill(output_comp))
        }
    }
    const content = result_outputs.map((id, ind) => keys[ind] + "\n" + id.join("\n")).join("\n");

    const convert_results_message = ["main", "extra", "side"].map((d, out_ind) =>
        `${d}: ${result_outputs[out_ind].length - result_exception_counts[out_ind]}/${result_outputs[out_ind].length}`)
        .join("\n")
    console.log(convert_results_message);

    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dnm = document.getElementById("dnm");
    const deck_name = [1].indexOf(html_parse_dic.ope) !== -1 ?
        $("#broad_title>div>h1").html().match(/(?<=\s*).*(?=<br>)/)[0].replace(/^\s*/, "").replace(/\s/, "_") :
        (dnm.value || dnm.getAttribute("placeholder")); // after 2022/4/18
    const ext_dic = { "id": ".ydk", "name": "_name.txt", "cid": "_cid.txt" }
    const file_name = deck_name + ext_dic[form];
    a.download = file_name;
    a.href = url;
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    let message = `Exported to ${file_name}`;
    if (exceptions.length > 0 && form == "id") {
        const error_message = "一部のカードが変換できませんでした。\t" + exceptions.join(", ");
        console.log(error_message);
        message += "\n" + error_message;
        // alert(error_message);
    }
    showMessage(message);
}

//--------------------------
//         # import

async function importFromYdk() {
    const import_file = $("#button_importFromYdk_input").prop("files")[0];
    const data_tmp = await import_file.text();
    const data_array = split_data(data_tmp);
    const imported_rows = obtain_deck_splited(data_array);

    const row_names = ["monster", "spell", "trap", "extra", "side"];
    let row_results = Object.assign(
        ...row_names.map(row_name => Object({
            [row_name]: { names: [], nums: [], cids: [], limits: [] }
        })
        ));
    const df = await obtainDF(obtainLang());
    let exceptions = [];
    // guess file type => id, Jap, Eng
    /*const encoder=new TextEncoder("utf8");
    const data_type_judges={
        includeJap: data_array.filter(d=>!/^#|^!/.test(d))
            .some(data=>Array.from(data).some(d=>{
                const bytes=encoder.encode(d);
                const isKana= (bytes[0]==227 && bytes[1]>=129 && bytes[1]<=131);
                const isZenAlphabet= (bytes[0]==239 && bytes[1]>=188 && bytes[1]<=190);
                return isKana || isZenAlphabet;
        })),
        onlyNumbers: data_array.filter(d=>!/^#|^!/.test(d)).every(data=>isFinite(data))}
    const data_type=data_type_judges.includeJap ? "Jap" : data_type_judges.onlyNumbers ? "id" : "Eng"; */
    for (const [ind_import, rows] of Object.entries(imported_rows)) {
        for (const row of Array.from(new Set(rows)).map(d => d.trim()).filter(d => d.length > 0)) {
            // const isID = /^\d+$/.test(id_tmp);
            if (row.length === 0) continue;
            let name_tmp = "";
            const id = (/^\d+$/.test(row)) ? parseInt(row) : null; //isFinite(row) && 
            const card_name = (id !== null) ? df_filter(df, "name", ["id", id])[0] : row;
            const cid = (id !== null) ? df_filter(df, "cid", ["id", id])[0] : undefined;
            // // id
            // if (/^\d+$/.test(id) && id) {
            //     name_tmp = df_filter(df, "name", ["id", id])[0];
            // }
            // // name
            // else if (!/^\d+$/.test(id) && id) {
            //     name_tmp = id.split("\t")[0];
            // }
            //console.log(id,id_tmp, name_tmp, ids.map(d => d.split("\t")[0]).filter(d => d == id), ids.map(d => d.split("\t")[0]).filter(d => d == id_tmp));

            const num_tmp = rows.map(d => d.split("\t")[0]).filter(d => d == row).length;
            if (!card_name) exceptions.push(`${id} ${card_name}`);
            else {
                let row_ind = 0;
                let row_name = "";
                if (ind_import == 0) {
                    try {
                        const types_tmp = df_filter(df, "type", ["id", id])[0];
                        const main_row = ["monster", "spell", "trap"].map(d => d.slice(0, 1).toUpperCase() + d.slice(1));
                        row_name = main_row.filter(d => types_tmp.split(",").some(dd => dd == d))[0].toLowerCase();
                        row_ind = row_names.indexOf(row_name);
                    } catch {
                        exceptions.push(`${id} ${name_tmp}`);
                        continue;
                    }
                } else {
                    row_ind = parseInt(ind_import) + 2;
                    row_name = row_names[row_ind];
                }
                row_results[row_name].names.push(card_name);
                row_results[row_name].nums.push(num_tmp);
                row_results[row_name].cids.push(cid);
                row_results[row_name].limits.push("not_limited");
            }
        }
    }
    // deck_name
    const settings_tmp = await getSyncStorage({ settings: defaultString }).then(items => Object.assign(defaultSettings, JSON.parse(items.settings)));
    const deck_name = import_file.name.replace(/(?<=^[^(@@)]+)@@.*\.ydk$|\.ydk$/, "") + (settings_tmp.addDate ? "@@" + new Date().toLocaleDateString() : "");
    // input deck name
    $("#dnm").val(deck_name);
    console.log(row_results);

    const main_total_num = importDeck(row_results);
    if (settings_tmp.valid_feature_deckEditImage === true) insertDeckImg(df, row_results);
    const message_forImportedData = `main: ${main_total_num}\n`
        + Object.entries(row_results).map(d => {
            const row_name = d[0];
            const row_result = d[1];
            return `${row_name}: ${row_result.names.length}`
        }).join("\n");
    if (exceptions.length > 0 && !exceptions.every(d => /^\s*$/.test(d))) {
        const error_message = "一部のカードが変換できませんでした。\n" + exceptions.join(", ");
        console.log(error_message);
        alert(error_message + "\n" + message_forImportedData);
    } else {
        console.log(message_forImportedData);
        alert(message_forImportedData);
    }
    showMessage(`Imported ${deck_name}`);
}

// # sortSave
async function sortSaveClicked() {
    const url_now = location.href;
    const html_parse_dic = Object.assign(parse_YGODB_URL(url_now), { ope: 2 });
    //console.log(html_parse_dic);
    if (["cgid", "dno"].some(d => Object.keys(html_parse_dic).indexOf(d) === -1)) {
        return;
    }
    //const url_ope2 = "https://www.db.yugioh-card.com/yugiohdb/member_deck.action?" +
    //    (new URLSearchParams(html_parse_dic)).toString();
    const row_results = obtainRowResults();
    const row_results_new = await sortCards(row_results);
    const serialized_dic = {
        ope: "ope=3",
        header: await obtainDeckHeader_edit(html_parse_dic),
        deck: serializeRowResults(row_results_new)
    }
    const serialized_data = Object.values(serialized_dic).join("&");
    //console.log(serialized_data);
    //return; // test
    await _Regist_fromYGODB(html_parse_dic, serialized_data).then(async res => {
        // await _Regist_fromYGODB(html_parse_dic, null).then(async res => {
        //console.log(res);
        if (res.error) {
            console.log("Reload");
            await sleep(100);
            location.reload();
        } else {
            console.log("Reload");
            await sleep(100);
            location.reload();
        }
    });
    /*const postMsg = "trigger_sortCard_" + JSON.stringify(row_results_new);
    //console.log(row_results_new);
    //console.log(postMsg);
    const win = window.open(url_ope2, "sortCard", "width=500,toolbar=yes,menubar=yes,scrollbars=yes");
    win.addEventListener("load", () => {
        setTimeout(() => {
            win.postMessage(postMsg, "*");
        }, 100);
    }, false);*/
}

const reloadSort = async () => {
    const df = await obtainDF(obtainLang());
    if ($("#deck_text").css("display") !== "none") return;
    const row_results = obtainRowResults(df);//obtainRowResults_Edit(df);
    const row_results_new = await sortCards(row_results);
    importDeck(row_results_new);
    insertDeckImg(df, row_results_new);
    showMessage("Reloaded and Sorted");
}

const backToView = async () => {
    const html_parse_dic = parse_YGODB_URL(location.href, true);
    const my_cgid = obtainMyCgid();
    const dno = $("#dno").val();
    const lang = obtainLang();
    const sps = { ope: "1", wname: html_parse_dic.wname, cgid: my_cgid, dno: dno, request_locale: lang };
    const url = joinUrl(`https://www.db.yugioh-card.com/yugiohdb/member_deck.action`, sps);
    location.href = url;
};

// # deck header show / hide
const toggleVisible_deckHeader = (toShow_in = null) => {
    const html_parse_dic = parse_YGODB_URL(location.href, true);
    if (["2", "8"].indexOf(html_parse_dic.ope) === -1) return;
    const button = $("#button_visible_header");
    const toShow = (typeof (toShow_in) !== "boolean") ? $(button).hasClass("show") : toShow_in;
    const showHide = { true: "show", false: "hide" };
    $(button).removeClass(showHide[toShow]);
    $(button).addClass(showHide[!toShow]);
    $(button).toggleClass("red");
    // const button_fit=document.querySelector("#button_fixScroll");
    // if (button_fit!==null && button_fit.classList.contains("red")){
    //     const button_area=document.querySelectorAll("div.div_officialButton.div_otherButtons");
    //     if (toShow === true){

    //     }
    // }
    // $("span", button).text("Header " + showHide[!toShow].toUpperCase());
    const dls = Array.from($("#deck_header>div>div>dl:not(.alwaysShow)"));
    for (const dl_tmp of dls) {
        if (dls.indexOf(dl_tmp) !== 0 && toShow === false) {
            $(dl_tmp).css({ display: "none" });
        } else {
            $(dl_tmp).css({ display: "" }) // relativeにするとnoneで固定された
        }
    }
}

const changeSize_deckHeader = (ctc_name, ctc_ind_size_old_in = null) => {
    const arr_size_ct = [120, 500] // [120,300,500]

    const html_parse_dic = parse_YGODB_URL(location.href, true);
    if (["2", "8"].indexOf(html_parse_dic.ope) === -1) return;

    const header_ids_dic = { category: "dckCategoryMst", tag: "dckTagMst", comment: "biko" };
    const ctc_now = $(`#${header_ids_dic[ctc_name]}`);
    const ctc_ind_size_old = ctc_ind_size_old_in || ctc_now.attr("class").match(/ctc_size_(\d*)/)[1];
    const ctc_ind_size = (1 + parseInt(ctc_ind_size_old)) % arr_size_ct.length;
    ctc_now.removeClass(`ctc_size_${ctc_ind_size_old}`);
    ctc_now.addClass(`ctc_size_${ctc_ind_size}`);
    const isCT = ["category", "tag"].indexOf(ctc_name) !== -1
    if (isCT) {
        const size_now = arr_size_ct[ctc_ind_size];
        ctc_now.addClass(`ctc_size_${ctc_ind_size}`);
        ctc_now.css({ height: size_now });
    } else {
        const row_now = 6 * (1 + ctc_ind_size % arr_size_ct.length);
        ctc_now.addClass(`ctc_size_${ctc_ind_size}`);
        ctc_now.prop("rows", row_now);
    }
}

const showSelectedOption = () => {
    for (const table of Array.from($("dl.category_tag>dd>div.table_l"))) {
        const old_div = $("div.selected_options", table);
        if (old_div.length > 0) $(old_div).empty();
        const div = old_div.length > 0 ? old_div : $("<div>", { class: "selected_options" });
        Array.from($("select option[selected]", table))
            .map(d => $(d).text())
            .map(d => {
                const css_dic = {
                    border: "1px solid #579c57", background: "#d8f2d9", "font-weight": "bold",
                    "vertical-align": "middle"
                }
                const span = $("<span>").append(d).css(css_dic);
                div.append(span);
            })
        $(table).append(div);
    };
}

// # insert deck image
const _generateDeckImgSpan = (df, card_type, card_name_cid = { name: null, cid: null }, card_class_ind = "0_1", card_limit = "not_limited") => {
    const span = $("<span>", {
        style: "max-width: min(6.7%, 65px); padding:1px; box-sizing:border-box; display: block;position: relative;"
    });

    const card_input = Object.assign({ name: null, cid: null }, card_name_cid);
    if (card_input.name == null && card_input.cid == null) return span;
    const name_now = (card_input.name == null) ? df_filter(df, "name", ["cid", card_input.cid])[0] : card_input.name;
    const cid_now = (card_input.cid == null) ? df_filter(df, "cid", ["name", card_input.name])[0] : card_input.cid;
    const encImg_now = df_filter(df, "encImg", ["cid", cid_now])[0];
    //const id_now=df_filter(df, "id", ["cid", cid_now])[0];
    const img_tmp = $("<img>", {
        class: `card_image_${card_type}_${card_class_ind} ui-draggable ui-draggable-handle img_chex`,
        alt: name_now,
        title: name_now,//card_id:id_now,
        card_cid: cid_now,
        card_type: card_type,
        card_name: name_now,
        card_url: `https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=2&cid=${cid_now}`,
        loading: "lazy",
        src: `https://www.db.yugioh-card.com/yugiohdb/get_image.action?type=1&lang=ja&cid=${cid_now}&ciid=1&enc=${encImg_now}&osplang=1`,
        style: "position: relative;width: 100%;"
    });
    span.attr("title", name_now);
    span.append(img_tmp);
    $(span).addClass(card_limit);
    span.append($("<div>").append($("<span>")));
    //a_img.append(span);
    return span; // a_img;
}

const obtainNewCardSet = (row_name) => {
    const card_set = $("<div>", { id: row_name, class: "card_set", style: "margin: 0px 0px 0px;" })
    const sub_cat = $("<div>", {
        class: "subcatergory",
        style: "padding: 10px 0 5px;"
    }).append(
        `<div class="icon hex"><span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 43 54"><defs><style>.a{fill:#fff;fill-rule:evenodd;}</style></defs><path class="a" d="M34.5,57V13.5L51.5,9V48.5Zm-2-20-24-9.5V7.5L28.5,3,51,7,32.5,12.5Zm0,20-21-8.8v-17l21,8.3Z" transform="translate(-8.5 -3)"></path></svg></span></div>`
    )
    const div_top = $("<div>", { class: "top" }).append(`<h3 style="min-width: 0px;">${row_name.toUpperCase()}</h3>`)
        .append($(`<span>`, {
            style: "border: 1px solid; padding: 0px 5px; min-width: 30px; box-sizing: border-box; line-height: 1.5; text-align: center;"
        }).append("0"));
    const image_set = $("<div>", { //(div_imageSet_old.length>0) ? div_imageSet_old : 
        class: `image_set image_set_${row_name} image_set_MouseUI image_set_deck MouseUI`,
        set_type: row_name,
        style: `display: flex; flex-wrap: wrap; border: 2px solid #000; padding: 1px;min-height: min(8.7vw, 87px);`,
        oncontextmenu: "return false;",
        wheelClick: "return false;"
    })
    $(sub_cat).append(div_top);
    $(card_set).append(sub_cat);
    $(card_set).append(image_set);
    return card_set;
}

const insertDeckImg = (df, row_results, displayIsValid = true, div_deck_imageSetIn = null) => {
    const div_deck_imageSet_old = div_deck_imageSetIn !== null ? div_deck_imageSetIn : $("div#deck_image");
    //if (div_deck_imageSet_old.length>0) $(div_deck_imageSet_old).empty();
    const dislapy_style = displayIsValid ? "block" : "none";
    const deck_image = (div_deck_imageSet_old.length > 0) ? div_deck_imageSet_old : $("<div>", {
        id: "deck_image",
        class: "deck_image",
        style: `display:${dislapy_style}; min-height: fit-content;`,
        oncontextmenu: "return false;",
        wheelClick: "return false;"
    })
    //const _judgeString = inputText => typeof inputText === "string" || inputText instanceof String;
    const row_imgs_dic_tmp = ["monster", "spell", "trap", "extra", "side"].map(row_name => {
        const row_result = row_results[row_name];
        //let count=0;
        const card_imgs = row_result.names.map((name_now, ind_card) => {
            const cid_now = row_result.cids[ind_card];
            const num_ind = row_result.nums[ind_card];
            const limit_now = row_result.limits[ind_card];
            const span_imgs = [...Array(num_ind).keys()].map(ind_local => {
                //const a_img=$("<a>", {href:"#"});
                return _generateDeckImgSpan(df, row_name, { cid: cid_now, name: name_now }, `${ind_card}_1`, limit_now);
            });
            //count+=num_ind;
            return span_imgs;
        }).filter(d => d !== null).flat();
        return { [row_name]: card_imgs };
    });
    const row_imgs_dic = Object.assign(...row_imgs_dic_tmp);
    const deck_key_dic = { main: ["monster", "spell", "trap"], extra: ["extra"], side: ["side"] };
    const deck_imgs_dic_tmp = Object.entries(deck_key_dic).map(([deck_key, card_type_arr]) => {
        const deck_imgs_tmp = card_type_arr.map(card_type => row_imgs_dic[card_type]);
        return { [deck_key]: deck_imgs_tmp.flat() };
    });
    const deck_imgs_dic = Object.assign(...deck_imgs_dic_tmp);

    for (const [set_name, set_imgs] of Object.entries(deck_imgs_dic)) {
        /*const div_imageSet=$("<div>", { //(div_imageSet_old.length>0) ? div_imageSet_old : 
            id:`${row_name}`,
            class:`image_set image_set_${row_name} image_set_MouseUI image_set_deck MouseUI`,
            set_type:row_name,
            style:`display: flex; flex-wrap: wrap; border: 2px solid #000; padding: 1px;min-height: 95px;`,
            oncontextmenu:"return false;",
            wheelClick:"return false;"
        });*/
        const image_set_old = $(`#${set_name}.card_set .image_set`);
        const imageSetExists = image_set_old.length > 0;
        if (imageSetExists) image_set_old.empty();
        const card_set = obtainNewCardSet(set_name);
        const image_set = (imageSetExists) ? image_set_old : $(".image_set", card_set);
        for (const img_card of set_imgs) {
            image_set.append(img_card);
        };
        if (!imageSetExists) deck_image.append(card_set);
    }
    if ($("#temp").length === 0) {
        $(deck_image).append(obtainNewCardSet("temp"));
    }
    const deck_text = $("#deck_text");
    deck_text.after(deck_image);
    updateDeckCount();
}



// ## modify
const modifyDeckImg = (img_target, change = +1, to_set_type = null) => {
    //const num_new=Math.max(0, Math.min(3, num_old+change));
    //if ( (num_old===0 && change<=0) || (num_old===3 && change>=0)) return;
    if (change === -1) {
        const span_tmp = $(img_target).parents("span")[0];
        $(span_tmp).addClass("del_card");
        $(span_tmp).css({ display: "none" });
        if (to_set_type !== null) {
            const span_clone = $(span_tmp).clone()[0];
            const image_set_now = $(`.image_set[set_type='${to_set_type}']`);
            if (image_set_now.length === 0) return;
            $(span_clone).addClass("add_card").removeClass("del_card").css({ display: "block", position: "relative" });
            $(image_set_now).append(span_clone);
        }
    } else if (change === +1) {
        const span_tmp = $(img_target).parents("span")[0];
        const span_clone = $(span_tmp).clone()[0];
        $(span_clone).addClass("add_card").removeClass("del_card").css({ display: "block", position: "relative" });
        if (to_set_type === null) $(span_tmp).after(span_clone);
        else {
            const image_set_now = $(`.image_set[set_type='${to_set_type}']`);
            if (image_set_now.length === 0) return;
            $(image_set_now).append(span_clone);
        }
    }
    //else if (num_old === 0 && card_type!==null){
    // new kind
    //    console.log("comnig soon")
    //}
}

const judgeCardType = (df, info_input, output = "row") => {
    const row_idents_dic = { monster: ["Monster"], spell: ["Spell"], trap: ["Trap"], extra: ["Fusion", "Synchro", "XYZ", "Xyz", "Link"] };
    const type_now = df_filter(df, "type", info_input)[0];
    if (type_now == null) {
        console.log(info_input);
        return null;
    }
    const type_judged_arr = Object.entries(row_idents_dic).map(([row_name, row_idents]) => {
        if (row_idents.some(d => type_now.indexOf(d) !== -1)) return row_name;
        else return null;
    }).filter(d => d != null).concat([null]);
    const type_judged = type_judged_arr.indexOf("extra") !== -1 ? "extra" : type_judged_arr[0];
    if (output === "row") return type_judged;
    else if (output === "set") return ["monster", "spell", "trap"].indexOf(type_judged) !== -1 ? "main" : type_judged;
    else return type_judged;
}

const parseCardClass = (target) => {
    const img = $(target).is("img") ? target : $("img", target);
    const classInfo_tmp = $(img).length === 0 ? [null, null, null] : $(img).attr("class").match(/card_image_([^_]+)_(\d+)_(\d+).*/);
    return {
        type: classInfo_tmp[1],
        ind1: classInfo_tmp[2],
        ind2: classInfo_tmp[3]
    };
}

const sideChange_deck = (df, img_target, onEdit = true) => {
    const row_results = obtainRowResults(df); // onEdit===true ? obtainRowResults_Edit(df): obtainRowResults();
    const cid_now = $(img_target).attr("card_cid");
    const from_set_type = $(img_target).parents("div.image_set").attr("set_type");
    if (from_set_type == null) return row_results;
    const raw_type = judgeCardType(df, ["cid", cid_now], "row");
    if (raw_type === null) return row_results;
    const to_type = (from_set_type === "side") ? raw_type : "side";
    const from_type = (from_set_type === "main") ? raw_type : from_set_type;
    const row_results_tmp1 = operateRowResults(row_results, cid_now, -1, from_type, df);
    const row_results_tmp2 = operateRowResults(row_results_tmp1, cid_now, +1, to_type, df);
    if (onEdit === true) importDeck(row_results_tmp2);
    //modifyDeckImg(img_target, -1);
    const to_set_type = ["monster", "spell", "trap"].indexOf(to_type) !== -1 ? "main" : to_type;
    modifyDeckImg(img_target, -1, to_set_type);
    return row_results_tmp2;
}

const operate_deckEditVisible = (key_show = "image") => {
    const div_deck_dic = { text: $("#deck_text"), image: $("#deck_image") };
    if (Object.keys(div_deck_dic).indexOf(key_show) === -1) return;
    Object.entries(div_deck_dic).map(([key_div, div_deck]) => {
        const display_style = (key_show === key_div) ? "block" : "none";
        div_deck.css({ display: display_style });
    });
    //if (key_show==="text") $("#num_totoal").css({display:"block"});
    //else $("#num_totoal").css({display:"none"});
}

const updateCardLimitClass = (row_results) => {
    const all_limit_class = ["forbidden", "limited", "semi_limited", "not_limited"];
    for (const [row_name, row_result] of Object.entries(row_results)) {
        for (const ind_card of [...Array(row_result.names.length).keys()]) {
            const limit = row_result.limits[ind_card];
            const card_class = `card_image_${row_name}_${ind_card}_1`;
            const span = $(`#deck_image .image_set span:has(img.${card_class})`);
            if ($(span).hasClass(limit)) return;
            all_limit_class.map(d => $(span).removeClass(d));
            $(span).addClass(limit);
        }
    }
    ;
}

const addButtonAfterMainShuffle = (button) => {
    const h3_tmp = $("#deck_image #main div.subcatergory div.top>h3");
    const a_tmp = $("#deck_image #main div.subcatergory div.top>a");
    $(h3_tmp).css({ "min-width": "0" });
    if (a_tmp.length > 0) {
        $(a_tmp).after(button);
    } else {
        const span_tmp = $("<span>", {
            style: `flex:4;border:none;`,
            oncontextmenu: "return false;"
        });
        $(h3_tmp).after(button);
        $(button).after(span_tmp);
    }
}

const insertDeckText = (row_results, div_deckTextIn = null, display_text = "") => {
    const div_deckText = div_deckTextIn !== null ? div_deckTextIn : $("<div>", { class: `deck_version_text` });
    const div_deck = $("<div>", { style: "margin:10px;" });
    const div_deck_table = $("<div>", { class: "deck_text_table hide", style: "display:table;display:none;" });
    const div_deck_text_display = $("<span>", {
        style: "font-weight:bold;margin:5px;flex:1;"
    }).append(display_text);
    const input_for_rename = $("<div>").append($("<input>", { class: "input_deck_version_tag_rename", style: "margin:0 50px 0", placeholder: "new version tag" }))
    const div_top = $("<div>", { class: "top", display: "flex" }).append(div_deck_text_display).append(input_for_rename);
    div_deck.append(div_top);
    div_deck.append(div_deck_table);
    Object.entries(row_results).map(([row_name, row_result]) => {
        const div_row = $("<div>", { style: "display:table-cell; width:20vw;padding: 4px;" });
        const div_row_name = $("<div>").append($("<span>", {
            style: "font-weight:bold;margin:5px;"
        }).append(row_name));
        div_row.append(div_row_name);
        const tbody = $("<tbody>", { style: "item-align:top;" });
        const names = row_result.names;
        const nums = row_result.nums;
        names.map((name_now, ind_card) => {
            const num_now = nums[ind_card];
            const tr = $("<tr>", { style: "display:flex;" });
            const spans = {
                name: $("<span>", { style: "flex:1;" }).append(name_now),
                num: $("<span>", { style: "padding:2px;font-weight:bold;" }).append(num_now)
            };
            Object.entries(spans).map(([key, span_card]) => {
                tr.append(span_card);
            })
            tbody.append(tr);
        })
        //div.append(tbody);
        div_row.append(tbody);
        div_deck_table.append(div_row);
    });
    div_deckText.append(div_deck);
    return div_deckText;
}

// # sideChange on deck view

const operateSideChangeMode = (mode = "toggle", df = null) => {
    const button_sideChange = $("#button_sideChange");
    const status_pre = $(button_sideChange).hasClass("on");
    if (mode === "toggle") {
        $(button_sideChange).toggleClass("on");
        $(button_sideChange).toggleClass("red");
        const status_new = !status_pre;
        const on_off_text = status_new ? "OFF" : "ON";
        const span_text = `SideChange|L:Reset/R:${on_off_text}`;
        $("span", button_sideChange).html(span_text);
        _operateSideChange(status_new);
    } else if (mode === "reset") {
        //const row_results=obtainRowResults();
        $("#deck_image div.image_set span.add_card:has(img)").remove();
        const cards_all_exist = Array.from($("#deck_image div.image_set span:has(img):not(.add_card)"));
        $("#deck_image div.image_set span.del_card:has(img)").removeClass("del_card").css({ display: "block" });
        /*Object.entries(row_results).map(([row_name, row_result])=>{
            row_result.names.map(([card_name, card_ind])=>{
                const card_num=row_result.nums[card_ind];
                const card_cid=row_result.cids[card_ind];
                const class_name=`card_image_${row_name}_${card_ind}_1`;
                const card_exist=cards_all_exist.filter(d=>$(d).is(`.${class_name}`));
                const num_exist=card_exist.length;
                if (num_exist < card_num && num_exist>0) {
                    return Array(card_num-num_exist).map(_=>$(card_exist[0]).clone());
                } else if (num_exist < card_num && num_exist===0) {
                    const span_new=_generateDeckImgSpan(df, row_name, {name:card_name, cid:card_cid}, `${card_ind}_1`);

                }
            })
        })*/
        resetSortDeckImgs(cards_all_exist).map(span => {
            const img = $("img", span);
            const classInfo = parseCardClass(img);
            //const classInfo_tmp=$(img).attr("class").match(/card_image_([^_]+)_(\d+)_(\d+).*/);
            /*const classInfo={
                type:classInfo_tmp[1],
                ind1:classInfo_tmp[2],
                ind2:classInfo_tmp[3]
            };*/
            const set_type = ["monster", "spell", "trap"].indexOf(classInfo.type) !== -1 ? "main" : classInfo.type;
            //if (classInfo.type==="side") console.log(img, classInfo, set_type)
            const image_set = $(`#deck_image div.image_set[set_type='${set_type}']`);
            $(image_set).append(span);
        });
    }
}

const _operateSideChange = (sideChangeIsValid = true) => {
    const deck_image = $("#deck_image");
    const par_dic = {
        true: { attr: { oncontextmenu: "return false;", wheelClick: "return false;" } }, //,css:{"min-height":"780px"}
        false: { attr: { oncontextmenu: "return true;", wheelClick: "return true;" } } //,css:{"min-height":"0"} /-> not work
    }
    if (sideChangeIsValid === true) $(deck_image).addClass("MouseUI");
    else $(deck_image).removeClass("MouseUI");
    $(deck_image).attr(par_dic[sideChangeIsValid].attr);
    //$(deck_image).css(par_dic[sideChangeIsValid].css);
    $("#deck_image div.card_set div.image_set span:has(img)").attr(par_dic[sideChangeIsValid].attr);//:not(.add_card)
    if (sideChangeIsValid === true) $("#deck_image").removeClass("click_open_url");
    else $("#deck_image").addClass("click_open_url");
    /*Array.from($("#deck_image .image_set span:has(img)")).map(span=>{//:not(.add_card)
        //const image_set=$(span).parents(".image_set")[0];
        //const a_span_ident=$(span).attr("a_span")
        //const card_a=$(`#deck_image div.image_set a[a_span='${a_span_ident}']`);
        if (sideChangeIsValid===true) {
            //$(image_set).append(span);
            //$(card_a).before(span);
            //$(card_a).css({display:"none"});
            //$(span).css({"max-width": "6.5%", padding:"1px", "box-sizing":"border-box"});
            $("img", span).removeClass("url_open");
            //$("#temp").css({display:"block"});
        } else {
            //$(span).css({"max-width": "", padding:"0px", "box-sizing":""});
            $("img", span).addClass("url_open");
            //$(card_a).after(span);
            //$(card_a).append(span);
            //$(card_a).css({display:"block"});
            //$("#temp").css({display:"none"});
        }
    })*/
    //if (sideChangeIsValid!==true) $("#deck_image div.image_set a:has(span:has(img):not(.del_card))").css({display:"block"});
}

const updateDeckCount = () => {
    Array.from($("#deck_image .card_set")).map(card_set => {
        const div_top = $("div.subcatergory>div.top", card_set);
        const span_count = $("span:last", div_top);
        span_count.html($("div.image_set span:has(img):not(.del_card)", card_set).length);
    })
}

// # operate area

const setArticleWidth = (flag_narrow = true) => {
    const article = document.getElementsByTagName("article")[0];
    const article_body = document.getElementById("article_body");
    if (flag_narrow === true) {
        article.style["max-width"] = "initial";
        // article_body.style["max-width"] = "35vw";
    } else {
        article.style["max-width"] = "";
        article_body.style["max-width"] = "auto";
    }
}

const operate_searchArea = (toShowIn = null) => {
    const searchArea = document.getElementById("search_area");
    const classList = searchArea.classList;
    if (toShowIn === null) classList.toggle("none");
    else if (toShowIn === true) classList.remove("none");
    else if (toShowIn === false) classList.add("none");
    const toShow = !classList.contains("none");
    searchArea.style.display = toShow ? "block" : "none";
    const button_operate = document.getElementById("button_searchShowHide");
    if (toShow === true) button_operate.classList.add("red");
    else button_operate.classList.remove("red");
    const visible_cells = Array.from(document.querySelectorAll("article>div>div")).filter(d => d.style.display != "none");
    setArticleWidth(visible_cells.length != 1);
}

const operate_infoArea = (toShowIn = null) => {
    const infoArea = $("#info_area");
    if (toShowIn === null) $(infoArea).toggleClass("none");
    else if (toShowIn === true) $(infoArea).removeClass("none");
    else if (toShowIn === false) $(infoArea).addClass("none");
    const toShow = !$(infoArea).hasClass("none");
    $(infoArea).css({ display: toShow ? "block" : "none" });
    const button_operate = document.getElementById("button_infoShowHide");
    if (toShow === true) button_operate.classList.add("red");
    else button_operate.classList.remove("red");
    const visible_cells = Array.from(document.querySelectorAll("article>div>div")).filter(d => d.style.display != "none");
    setArticleWidth(visible_cells.length != 1)

}

const operate_fixScroll = (toFixIn = null) => {
    const area = document.getElementById("bg");
    if (toFixIn === null) area.classList.toggle("large");
    else if (toFixIn === true) area.classList.remove("large");
    else if (toFixIn === false) area.classList.add("large");
    const toFix = area.classList.contains("large");
    const button_operate = $("#button_fixScroll");
    if (toFix === true) $(button_operate).addClass("red");
    else $(button_operate).removeClass("red");
    const nav = document.querySelector("nav#title_top_msg");
    const footer = document.querySelector("footer#footer");
    const wrapper = document.querySelector("div#wrapper");
    const header = document.querySelector("#wrapper>header");
    const spnav = document.querySelector("div#spnav");
    const pan_nav = document.querySelector("nav#pan_nav");
    const footer_nav = document.querySelector("nav#footer_icon");
    const search_res = document.querySelector("#search_result");
    const areas_selector = { search: "#search_area", info: "#info_area>div", deck: "#article_body" };
    const areas_elm = Object.assign(
        ...Object.entries(areas_selector
        ).map(([k, v]) => [k, document.querySelector(v)]
        ).filter(([k, v]) => v.style.display !== "none"
        ).map(([k, v]) => Object({ [k]: v })))
    // const search_area = document.querySelector();
    // const info_area = document.querySelector();
    // const deck_area = document.querySelector();
    const all_width = Object.values(areas_elm).map(d => d.clientWidth).reduce((acc, cur) => acc + cur, 0);
    const ratios = Object.assign(...Object.entries(areas_elm).map(([k, v]) => Object({ [k]: v.clientWidth / all_width })));
    if (toFix === true) {
        area.style.position = "fixed";
        area.style.top = "0vh";
        area.style["min-height"] = "100vh";
        area.style["width"] = "100%";
        wrapper.style.height = "100%";
        search_res.style["max-height"] = "90vh"
        areas_elm.info.style["max-height"] = "95vh"
        areas_elm.deck.style["height"] = "100vh"
        areas_elm.deck.style["overflow-y"] = "visible"
        for (const [k, elm] of Object.entries(areas_elm)) {
            if (k == "deck") {
                const ratio = 0.98 * window.innerHeight / elm.scrollHeight;
                const valid_width = Math.max(elm.scrollWidth * ratio, ratios[k] * ratio * window.innerWidth);
                elm.style["transform-origin"] = `top`;
                elm.style["transform"] = `scale( ${ratio}, ${valid_width / elm.scrollWidth})`; // calc( 0.98 * 100vh / 100% )
                elm.style["flex-basis"] = `${valid_width}px`;
                // elm.style["gap"]="5px 5px";
                // console.log(ratio, valid_width, elm.scrollHeight, elm.scrollWidth, window.innerHeight, window.innerWidth)
            } else elm.style["flex-basis"] = `${ratios[k] * 100}vw`;
        }
        for (const elm of [header, spnav, pan_nav, footer_nav]) {
            elm.style.display = "none";
        }
        for (const elm of [footer, nav]) {
            elm.style.position = "fixed";
            elm.style.top = "100vh";
        }
    } else {
        area.style.position = "";
        area.style.top = "";
        area.style["min-height"] = "";
        area.style["width"] = "";
        footer.style.position = "";
        footer.style.top = "";
        areas_elm.deck.style["overflow-y"] = "scroll"
        for (const elm of [header, spnav, pan_nav, footer_nav]) {
            elm.style.display = "";
        }
        for (const elm of [footer, nav]) {
            elm.style.position = "";
            elm.style.top = "";
        }
        for (const [k, elm] of Object.entries(areas_elm)) {
            elm.style["flex-basis"] = `30vw`;
            elm.style["transform"] = ``;
            // elm.style["max-width"]=`none`;
            // elm.style["min-width"]=`none`;
        }
        wrapper.style.height = "fit-content";
        search_res.style["max-height"] = "70vh"
        areas_elm["info"].style["max-height"] = "80vh"
        areas_elm["deck"].style["max-height"] = ""
        areas_elm["deck"].style["flex-basis"] = "35vw"


    }
}

// # deck version

const setDeckVersionTagList = async (updateDeckNameIsValid = true) => {
    const data_deckVersion = await operateStorage({ data_deckVersion: JSON.stringify({}) }, "local", "get")
        .then(d => JSON.parse(d.data_deckVersion));

    if (updateDeckNameIsValid === true) {
        const datalist_name = $("#deckVersion_nameList");
        $(datalist_name).empty();
        Object.keys(data_deckVersion).sort().map(d => {
            const option = $("<option>", { value: d }).append(d);
            datalist_name.append(option);
        })
    }
    const deck_name = $("#deck_version_name").val().replace(/^\s*|\s*$/g, "");
    if (Object.keys(data_deckVersion).indexOf(deck_name) === -1) return;
    const datalist_tag = $("#deckVersion_tagList");
    if (datalist_tag.length === 0) return;
    $(datalist_tag).empty();
    Object.entries(data_deckVersion[deck_name]).map(([key, deckVersion]) => {
        const option = $("<option>", { value: `${deckVersion.tag} #${key}` }).append(deckVersion.date);
        datalist_tag.append(option);
    })
}
const operateDeckVersion = async (mode = "get", deckInfoIn = { name: null, tag: null, tag_key: null }, row_results = {}) => {
    const deckInfo_empty = { name: null, tag: null, tag_key: null };
    const deckInfo = Object.assign(deckInfo_empty, deckInfoIn);
    if (deckInfo.name === null || deckInfo.name.length === 0) return;
    const version_date = new Date().toLocaleDateString();
    const version_key = Date.now().toString(36);
    const deck_name = deckInfo.name;
    const data_deckVersion = await operateStorage({ data_deckVersion: JSON.stringify({}) }, "local", "get")
        .then(d => JSON.parse(d.data_deckVersion));
    const old_data = (Object.keys(data_deckVersion).indexOf(deck_name) === -1) ? {} : data_deckVersion[deck_name];
    if (mode === "set") {
        const deck_tag = deckInfo.tag || version_date;
        const row_results_min = Object.assign(...Object.entries(row_results)
            .map(([row_name, row_result]) => Object({
                [row_name]: {
                    cids: row_result.cids,
                    nums: row_result.nums
                }
            })
            ));
        const new_data_deckVersion = {
            [deck_name]: Object.assign({
                [version_key]: {
                    row_results_min: row_results_min,
                    date: version_date,
                    tag: deck_tag
                }
            }, old_data)
        };
        const new_saved_json = Object.assign(data_deckVersion, new_data_deckVersion);
        await operateStorage({ data_deckVersion: JSON.stringify(new_saved_json) }, "local", "set");
        //console.log("saved");
    } else if (mode === "get") {
        if (Object.keys(old_data).length === 0) return;
        const deck_tag_key = deckInfo.tag_key;
        const deck_version = (Object.keys(old_data).indexOf(deck_tag_key) === -1) ? {} : old_data[deck_tag_key];
        const row_results_min = deck_version.row_results_min;
        // re-convert row_results
        const df = await obtainDF(obtainLang());
        const row_results = Object.assign(...Object.entries(row_results_min)
            .map(([row_name, row_result]) => Object({
                [row_name]: {
                    cids: row_result.cids,
                    nums: row_result.nums,
                    names: row_result.cids.map(cid => df_filter(df, "name", ["cid", cid])[0]),
                    limits: row_result.cids.map(d => "not_limited")
                }
            })))
        console.log("loaded");
        return row_results;
    } else if (mode === "delete") {
        if (Object.keys(old_data).length === 0) return;
        const deck_tag_key = deckInfo.tag_key;
        //const deck_version = (Object.keys(old_data).indexOf(deck_tag_key) === -1) ? {} : old_data[deck_tag_key];
        //const row_results_min = deck_version.row_results_min;
        // re-convert row_results
        //const df = await obtainDF(obtainLang());
        const new_data_deckVersion = {
            [deck_name]: Object.assign(...Object.entries(old_data).map(([k, v]) => {
                if (k !== deck_tag_key) return { [k]: v };
                else return null;
            }).filter(d => d !== null))
        };
        const new_saved_json = Object.assign(data_deckVersion, new_data_deckVersion);
        await operateStorage({ data_deckVersion: JSON.stringify(new_saved_json) }, "local", "set");
    }
}

const obtainDeckListOfficial = async (html_parse_dic_in = null) => {
    const html_parse_dic = html_parse_dic_in || parse_YGODB_URL(location.href, true);
    const sps = {
        ope: "4",
        wname: html_parse_dic.wname,
        cgid: obtainMyCgid(),
        request_locale: obtainLang()
    }
    if (sps.cgid == null) return null;
    const url = `https://www.db.yugioh-card.com/yugiohdb/member_deck.action?` + Object.entries(sps).map(([k, v]) => `${k}=${v}`).join("&");
    const body = await obtainStreamBody(url);
    return Array.from($("div#deck_list>div.t_body>div.t_row>div>div.inside", body))
        .map(d => Object({
            name: $("div.dack_set>div.text_set>span.name>span.name", d).text(),
            dno: $("input.link_value", d).val().match(/dno=(\d+)/)[1]
        }));
}

const setDeckNames = async (datalist) => {
    const deck_infos = await obtainDeckListOfficial()
    //const datalist=$("#deck_nameList");
    datalist.empty();
    deck_infos.map((deckInfo) => {
        const option = $("<option>", { value: `${deckInfo.name} #${deckInfo.dno}` });
        datalist.append(option);
    })
}

"use strict";

const deleteKeyword = async (e) => {
    console.log(e, this)
    const button_target = e.target.matches("a.button_delete_keyword") ? e.target : e.target.closest("a.button_delete_keyword");
    button_target.previousElementSibling.setAttribute("value", "");
    if (button_target.matches("#deck_header dl#deck_version_box *")) await setDeckVersionTagList(false);
}

const listen_clickAndDbclick = async () => {
    let clicked = false;
    document.addEventListener("mousedown", async (e) => {
        if (clicked === true) {
            listen_dbclick(e);
            clicked = false;
            return;
        }
        clicked = true;
        setTimeout(async () => {
            if (clicked === true) {
                listen_mousedown(e);
            }
            clicked = false;
        }, 200);
    })

    let clicked2 = false;
    document.addEventListener("click", async (e) => {
        if (clicked2 === true) {
            clicked2 = false;
            return;
        }
        clicked2 = true;
        setTimeout(async () => {
            if (clicked2 === true) {
                await listen_click(e);
            }
            clicked2 = false;
        }, 200);
    })



}

const listen_dbclick = async (e) => {
    const html_parse_dic = parse_YGODB_URL(null, true);
    // console.log(e.target)
    if (html_parse_dic.ope == 2) {
        if (e.button === 0 && e.target.matches("#card_frame img, span:has(img.img_chex),span:has(img.img_chex) *, div.box_card_img:has(img), div.box_card_img:has(img) *")) {
            const img = e.target.closest("#card_frame, div.box_card_img, span:has(img.img_chex)").querySelector("img");
            if (img === null) return;
            const url = img.getAttribute("card_url");
            if (url === null) return false;
            openUrlInfoArea(url);
        } else if (e.button === 0 && e.target.matches("#deck_header .selected_options>span")) {
            const target = e.target;
            const option_value = target.getAttribute("chex_value");
            const option = target.closest("div.table_l").querySelector(`select>option[value="${option_value}"]`);
            console.log(option_value, option, option.selected)
            // option.selected = false;
            option.removeAttribute("selected");
            showSelectedOption();

        }
        // else if (e.button === 2) {
        //     // let isIntextMenuOpen = false;

        //     // document.addEventListener("contextmenu", function (e) {
        //     //     console.log(e);

        //     //     isIntextMenuOpen = true
        //     // });
        //     // function hideContextmenu(e) {
        //     //     if (isIntextMenuOpen) {
        //     //         console.log(e);
        //     //     }

        //     //     isIntextMenuOpen = false;
        //     // }
        //     // $(window).blur(hideContextmenu);

        //     // $(document).click(hideContextmenu);
        //     // e.preventDefault();
        //     backNextInfoArea(-1);
        //     // e.stopPropagation();
        //     // console.log(e);
        //     // console.log(document.getElementById('contextMenuId'))
        // } else if (e.button === 0) backNextInfoArea(1);
    } else if (html_parse_dic.ope == 1) {
        if (e.button === 0 && e.target.matches("div.image_set span:has(img), div.image_set span:has(img) *")) {
            const span_tmp = e.target.matches("div.image_set span:has(img)") ?
                e.target :
                $(e.target).parents("div.image_set span:has(img)")[0];
            const img_target = span_tmp.querySelector("img");
            if (img_target.getAttribute("card_url") !== undefined) {
                const url = img_target.getAttribute("card_url");
                window.open(url);

            }
        }

    }
}

const listen_click = async (e) => {
    const df = await obtainDF(obtainLang());
    const settings = await operateStorage({ settings: JSON.stringify({}) }, "sync")
        .then(items => Object.assign(defaultSettings, JSON.parse(items.settings), { valid_feature_sideChange: true }));

    const callId2Func_base = {
        "#button_searchShowHide": operate_searchArea,
        "#button_infoShowHide": operate_infoArea,
        "#button_fixScroll": operate_fixScroll,
    }
    const callId2Func_await = {
    }
    const callId2Func = Object.assign(callId2Func_base, callId2Func_await)
    // else if (e.target.matches(Object.keys(callId2Func).map(d => `${d}, ${d} *`).join(", "))) {
    //     const selector = Object.keys(callId2Func).join(", ");
    //     const target = (e.target.matches(selector)) ? e.target : e.target.closest(selector);
    //     callId2Func["#" + target.id]();
    // } else if (e.target.matches(Object.keys(callId2Func_await).map(d => `${d}, ${d} *`).join(", "))) {
    //     const selector = Object.keys(callId2Func_await).join(", ");
    //     const target = (e.target.matches(selector)) ? e.target : e.target.closest(selector);
    //     await callId2Func_await["#" + target.id]();

    const info_area = document.getElementById("info_area");
    const html_parse_dic = parse_YGODB_URL(location.href, true);
    if (e.target.matches("#deck_header a.button_size_header, #deck_header a.button_size_header *")) {
        const button = $([$(e.target).children(), e.target]
            .filter(d => $(d).length > 0)
        [0]).parents("a.button_size_header");
        const ctc_name = $(button).prop("id").match("button_size_header_(.*)")[1];
        changeSize_deckHeader(ctc_name);
    } else if (e.target.matches("#mode_deckEdit.tablink_deckSupport ul *")) {
        const tablink_now = $(e.target).parents(".tablink_deckSupport")[0];
        const ul_now = $("ul", tablink_now);
        const li_now = e.target.matches("li") ? e.target : $(e.target).parents("li")[0];
        Array.from($("li", ul_now)).map(li_tmp => {
            if (li_tmp == li_now) $(li_tmp).addClass("now");
            else $(li_tmp).removeClass("now");
        });
        const key_show = $(li_now).attr("value");
        operate_deckEditVisible(key_show);
    } else if (e.target.matches("a.button_delete_keyword, a.button_delete_keyword *")) {
        const button_target = e.target.matches("a.button_delete_keyword") ? e.target : e.target.closest("a.button_delete_keyword");
        button_target.previousElementSibling.value = "";
        if (button_target.matches("#deck_header dl#deck_version_box *")) await setDeckVersionTagList(false);
    } else if (e.target.matches("img#keyword_delete")) {
        const button_target = e.target;
        button_target.previousElementSibling.value = "";
        // if (button_target.matches("#deck_header dl#deck_version_box *")) await setDeckVersionTagList(false);
    } else if (e.target.matches(Object.keys(callId2Func).map(d => `${d}, ${d} *`).join(", "))) {
        const selector = Object.keys(callId2Func).join(", ");
        const target = (e.target.matches(selector)) ? e.target : e.target.closest(selector);
        callId2Func["#" + target.id](e);
    } else if (e.target.matches("#header_box a.button_deckVersion, #header_box a.button_deckVersion *")) {
        const button_target = e.target.matches("a.button_deckVersion") ? e.target : $(e.target).parents("a.button_deckVersion")[0];
        $(button_target).toggleClass("red");
        const row_results = obtainRowResults(df);
        const deck_name = $("#deck_version_name").val().replace(/^\s*|\s*$/g, "");
        const deck_tag = $("#deck_version_tag").val().replace(/^\s*|\s*$/g, "").replace(/#\w+$/, "");
        const deck_tag_key_tmp = $("#deck_version_tag").val().replace(/^\s*|\s*$/g, "").match(/#(\w+)$/);
        if ($(button_target).hasClass("button_save")) {
            await operateDeckVersion("set", { name: deck_name, tag: deck_tag }, row_results);
            setDeckVersionTagList(true);
        } else if ($(button_target).hasClass("button_load")) {
            if (deck_tag_key_tmp.length < 2) return;
            const deck_tag_key = deck_tag_key_tmp[1];
            const row_results = await operateDeckVersion("get", { name: deck_name, tag_key: deck_tag_key });
            importDeck(row_results);
            if (settings.valid_feature_deckEditImage === true) insertDeckImg(df, row_results);
        } else if ($(button_target).hasClass("button_delete")) {
            if (deck_tag_key_tmp.length < 2) return;
            const deck_tag_key = deck_tag_key_tmp[1];
            await operateDeckVersion("delete", { name: deck_name, tag_key: deck_tag_key });
            console.log(deck_tag_key);
            $("#deck_version_tag").val("");
            setDeckVersionTagList(false);
        }
        sleep(500).then(() => $(button_target).toggleClass("red")); // await
    } else if (e.target.matches("#header_box a.button_deckOfficial *")) {
        // ### button deck official
        const button_target = e.target.matches("a.button_deckOfficial") ? e.target : e.target.closest("a.button_deckOfficial");
        //const toSave = $(button_target).hasClass("button_save");
        button_target.classList.toggle("orn");
        const deck_name_tmp = document.getElementById("dnm").value.trim();
        const deck_name_opened = document.getElementById("dnm").getAttribute("placeholder").trim();
        const deck_dno_opened = document.getElementById("deck_dno_opened").innerText.trim();
        const deck_dno_tmp = deck_name_tmp.match(/#(\d+)$/);
        const target_class = button_target.classList;
        if (target_class.contains("button_save")) {
            const deck_name_tmp2 = deck_name_tmp.replace(/\s*#\d+$/, "");
            const deck_name = deck_name_tmp2.length > 0 ? deck_name_tmp2 : deck_name_opened || Date.now().toString();
            // const row_results = obtainEditImg_RowResults();
            const row_results = await obtainRowResults(df);
            importDeck(row_results);
            // console.log(row_results);
            const html_parse_dic = parse_YGODB_URL();
            //const url_ope2 = "https://www.db.yugioh-card.com/yugiohdb/member_deck.action?" +
            //    (new URLSearchParams(html_parse_dic)).toString();
            const serialized_dic = {
                ope: "ope=3",
                wname: "wanme=" + obtain_YGODB_fromHidden("wname"),
                ytkn: "ytkn=" + obtain_YGODB_fromHidden("ytkn"),
                header: $("#deck_header input, #deck_header select, #deck_header textarea").serialize(),
                deck: serializeRowResults(row_results)
            }
            const serialized_data = Object.values(serialized_dic).join("&");
            // console.log(serialized_data);
            const res = await _Regist_fromYGODB(html_parse_dic); // , serialized_data
            if (res.error) {
                console.log("Failed to save");
            }
            operateDeckVersion("set", { name: "@@Auto", tag: "_save_" + deck_name }, row_results).then(() => {
                setDeckVersionTagList(true);
            });
        } else if (target_class.contains("button_load")) {
            //const deck_name = deck_name_tmp.replace(/#\d+$/, "");
            if (deck_dno_tmp.length < 2) return;
            const deck_dno = deck_dno_tmp[1];
            await load_deckOfficial(df, deck_dno, settings, null);
        } else if (target_class.contains("button_new")) {
            // const my_cgid = obtainMyCgid();
            const dno_new = await generateNewDeck()//.then(d=>d.dno);
            await load_deckOfficial(df, dno_new, settings, null);
        } else if (target_class.contains("button_copy")) {
            // const my_cgid = obtainMyCgid();
            const row_results = await obtainRowResults(df);
            const dno_new = await generateNewDeck();
            await load_deckOfficial(df, dno_new, settings, null);
            importDeck(row_results);
            if (settings.valid_feature_deckEditImage === true) insertDeckImg(df, row_results);
            await _Regist_fromYGODB();

        } else if (target_class.contains("button_delete")) {
            const my_cgid = obtainMyCgid();
            const deck_name_tmp2 = deck_name_tmp.replace(/\s*#\d+$/, "");
            const deck_name = deck_name_tmp2.length > 0 ? deck_name_tmp2 : deck_name_opened || Date.now().toString();
            const deck_dno = (deck_dno_tmp != null && deck_dno_tmp.length >= 2) ? deck_dno_tmp[1] : deck_dno_opened;
            await delete_deckOfficial(
                df,
                settings,
                deck_dno,
                deck_name,
                true,
                my_cgid,
                obtainRowResults(df, true));
        }
        sleep(500).then(() => $(button_target).toggleClass("orn"));
        setDeckNames($("#deck_nameList"));
    } else if (e.target.matches("#deck_header dl.category_tag>dd select>option")) {
        const select = $(e.target).parents("select")[0];
        //console.log($(select).attr("multiple"), select)
        if ($(e.target).attr("value") !== "") $(e.target).attr({ "selected": $(e.target).attr("selected") === undefined });
        if ($(e.target).attr("value") === "" || $(e.target).attr("selected") === undefined) $(e.target).prop("selected", false);
        showSelectedOption();
    }
}


const listen_mousedown = async (e) => {
    const callId2Func_base = {
        "#button_visible_header": toggleVisible_deckHeader
    }
    const callId2Func_await = {
        "#button_guess": guess_clicked,
        "#button_sortSave": sortSaveClicked,
        "#button_backToView": backToView,
        "#button_reloadSort": reloadSort,
        "#button_deckScreenshot": saveDeckScreenshot
        // "#button_delete_keyword":deleteKeyword
    }

    const callId2Func = Object.assign(callId2Func_base, callId2Func_await)
    const df = await obtainDF(obtainLang());
    // const sideChangeOnViewIsValid = ["1", null].indexOf(html_parse_dic.ope) !== -1 &&
    //     (settings.valid_feature_sideChange === true) &&
    //     $("#button_sideChange").length > 0 &&
    //     $("#button_sideChange").hasClass("on");
    const html_parse_dic = parse_YGODB_URL();
    const sideChangeOnViewIsValid = ["1", null].indexOf(html_parse_dic.ope) !== -1;
    const clickIsToOpenURL = $("#deck_image").length > 0 &&
        $("#deck_image").hasClass("click_open_url");
    // # ----- button ------
    if (e.target.matches("a.button_export, a.button_export *")) {
        const form_dic = { 0: "id", 2: "name", 1: "cid" }
        const form = form_dic[e.button];
        // const form = (e.button === 0) ? "id" : "name";
        console.log(`export deck as ${form}`)
        await exportAs(form);
    } else if (e.target.matches("a.button_shuffle, a.button_shuffle *")) {
        const mode_shuffle = "shuffle"; (e.button === 0) ? "shuffle" : "sort";
        const button_target = e.target.matches("a") ? $(e.target) : $(e.target).parents("a")[0];
        const set_type = $(button_target).attr("set_type");
        shuffleCards(mode_shuffle, set_type);
    } else if (e.target.matches("a.button_sort, a.button_sort *")) {
        const mode_shuffle = "sort"; //(e.button === 0) ? "shuffle" : "sort";
        const button_target = e.target.matches("a") ? $(e.target) : $(e.target).parents("a")[0];
        const set_type = $(button_target).attr("set_type");
        shuffleCards(mode_shuffle, set_type);
    } else if (e.target.matches("a.button_sideChange, a.button_sideChange *")) {
        const mode_sideChange = (e.button === 2) ? "toggle" : "reset";
        if (mode_sideChange === "reset" && !sideChangeOnViewIsValid) return;
        operateSideChangeMode(mode_sideChange, df);
    } else if (e.target.matches(Object.keys(callId2Func).map(d => `${d}, ${d} *`).join(", "))) {
        const selector = Object.keys(callId2Func).join(", ");
        const target = (e.target.matches(selector)) ? e.target : e.target.closest(selector);
        callId2Func["#" + target.id](e);
    } else if (e.target.matches("#faq>ul>li, #faq>ul>li *")) {
        const main_target = (e.target).matches("li") ? e.target : e.target.closest("li");
        const ul = main_target.parentElement;
        if (main_target.classList.contains("now")) return;
        for (const li of ul.children) {
            li.classList.toggle("now");
        }
        for (const div_article of ul.parentElement.parentElement.querySelectorAll("div.info_article")) {
            if (div_article.style.display == "none") div_article.style.display = "block";
            else div_article.style.display = "none";
            // div_article.classList.toggle("none");
        }
        return;
    } else if (e.target.matches("#info_faq div.t_body>div.t_row, #info_faq div.t_body>div.t_row *")) {
        const input_link = e.target.closest("div.t_row").querySelector("input.link_value");
        openUrlInfoArea(input_link.value)
    } else if (e.target.matches("#info_faq a, #update_list>div.t_body>div.t_row>div.inside, #update_list>div.t_body>div.t_row>div.inside *")) {
        const target = e.target;
        const link = target.getAttribute("_href") || target.closest("div.inside").querySelector("input.link_value").value;
        if (link === null) return;
        if (e.button === 1) {
            window.open(link, "_blank");
            return;
        }
        openUrlInfoArea("https://www.db.yugioh-card.com" + link.replace("https://www.db.yugioh-card.com", ""));

        // # ------- deck image --------
    } else if (e.target.matches("#deck_image div.image_set span:has(img), #deck_image div.image_set span:has(img) *")) {
        e.preventDefault();

        const span_tmp = e.target.matches("div.image_set span:has(img)") ?
            e.target :
            $(e.target).parents("div.image_set span:has(img)")[0];
        const img_target = $("img", span_tmp);
        if ((sideChangeOnViewIsValid || [1, 2].indexOf(e.button) !== -1) &&
            (e.ctrlKey) &&
            $(img_target).attr("card_url") !== undefined) {
            const url = $(img_target).attr("card_url");
            window.open(url);

            return;
        } else if (!sideChangeOnViewIsValid && ([0].indexOf(e.button) !== -1 && e.ctrlKey) &&
            $(img_target).attr("card_url") !== undefined) {
            // await openCardInfoArea($(img_target).attr("card_url"));
            openUrlInfoArea($(img_target).attr("card_url"))
            return;
        }
        else if (!e.target.matches("div.image_set_MouseUI *") && !sideChangeOnViewIsValid) return;
        const row_results = obtainRowResults(df)//sideChangeOnViewIsValid ? obtainRowResults(): obtainRowResults_Edit(df);
        const cid_now = $(img_target).attr("card_cid");
        const elm_dno = document.querySelector("#dno");
        const dno = (elm_dno !== null) ? elm_dno.value : null;
        // const classInfo = parseCardClass(img_target);
        const from_set_type = $(img_target).parents("div.image_set").attr("set_type");
        const row_type = judgeCardType(df, ["cid", cid_now], "row");
        const set_type_raw = ["monster", "spell", "trap"].indexOf(row_type) !== -1 ? "main" : row_type;
        const num_now_dic = {
            text: () => Object.values(row_results).map((d, ind) => {
                const ind_fromCid = d.cids.indexOf(cid_now);
                if (ind_fromCid !== -1) return d.nums[ind_fromCid];
                else return 0;
            }).filter(d => d !== null).map(d => parseInt(d)).concat([0]).reduce((acc, cur) => acc + cur),
            image: () => $(`#deck_image .image_set span:has(img[card_cid='${cid_now}']):not(.del_card)`).filter(":not(#temp *)").length
        }
        const num_now = num_now_dic[sideChangeOnViewIsValid ? "image" : "text"]();
        const num_image = num_now_dic.image();
        /*const cardInfo={
            name:$(img_target).attr("card_name"),
            cid:cid_now,
            id:$(img_target).attr("card_id"),
            num:num_now
        }*/
        const change_dic = { 2: -1, 1: +1 }
        if ([1, 2].indexOf(e.button) !== -1) {
            const change_now = change_dic[e.button];
            const to_set_type_tmp = change_now < 0 ? "temp" : null;
            const to_set_type = from_set_type === "temp" ? set_type_raw : to_set_type_tmp;
            const from_row_type = (["main", "temp"].indexOf(from_set_type) !== -1) ? row_type : from_set_type;
            //const to_row_type = (["temp"].indexOf(to_row_type_tmp) !== -1) ? null : to_row_type_tmp;
            //const to_row_type = (from_set_type === "temp") ? row_type : from_row_type;
            const change_for_image = (from_set_type === "temp") ? Math.abs(change_now) : change_now;
            const row_results_new = operateRowResults(row_results, cid_now, change_for_image, from_row_type, df);
            // console.log(row_results_new, row_results, dno);
            if (sideChangeOnViewIsValid === false) importDeck(row_results_new, row_results, dno);
            if (num_image == 3 && from_set_type === "temp" && change_now < 0) modifyDeckImg(img_target, change_now, null);
            else if (num_image + change_now <= 3 && (num_now < 3 || from_set_type !== "temp")) modifyDeckImg(img_target, change_now, to_set_type);
            //insertDeckImg(df, row_results_new);
        } else if (e.button === 0 && e.target.matches("#deck_image .image_set *")) {
            const onEdit = !sideChangeOnViewIsValid;
            const change_now = (from_set_type === "temp") ? 1 : 0;
            if (num_now + change_now <= 3) sideChange_deck(df, img_target, onEdit, row_results);
        }
        // # ------ search result, info area ---------
    } else if (e.target.matches("#search_result #card_list .t_row img, #info_area img.img_chex")) {
        e.preventDefault();
        const img_target = e.target;
        const cardInfo_tmp = ["name", "id", "cid", "type", "url"].map(d => Object({ [d]: $(img_target).attr(`card_${d}`) }));
        const card_tRow = $(img_target).parents("#search_result>#card_list>.t_row");
        const card_limit_div = $("dl.flex_1>dd.icon.top_set>div.lr_icon", card_tRow);
        const dno = document.querySelector("#dno").value;
        const card_limit_dic = { forbidden: "fl_1", limited: "fl_2", semi_limited: "fl_3" };
        const card_limit = card_limit_div.length == 0 ? "not_limited" :
            Object.entries(card_limit_dic)
                .map(([lim_name, lim_class]) => {
                    if ($(card_limit_div).hasClass(lim_class)) return lim_name;
                    else return null;
                }).filter(d => d !== null)[0];
        const cardInfo = Object.assign(...cardInfo_tmp, { limit: card_limit });
        if (([0].indexOf(e.button) !== -1 && e.ctrlKey) && $(img_target).attr("card_url") !== undefined) {
            openUrlInfoArea($(img_target).attr("card_url"))
            return;
        } else if ([0, 2].indexOf(e.button) !== -1) {
            const row_results = obtainRowResults(df)//obtainRowResults_Edit();
            console.log(row_results.spell.names);
            const num_now_dic = {
                text: () => Object.values(row_results).map((d, ind) => {
                    const ind_fromCid = d.cids.indexOf(cardInfo.cid);
                    if (ind_fromCid !== -1) return d.nums[ind_fromCid];
                    else return null;
                }).filter(d => d !== null).map(d => parseInt(d)).concat([0]).reduce((acc, cur) => acc + cur),
                image: () => $(`#deck_image .image_set span:has(img[card_cid='${cid_now}']):not(.del_card)`).filter(":not(#temp *)").length
            }
            const num_now_text = num_now_dic.text();
            if (num_now_text < 3) {
                const to_row_type = e.button === 0 ? cardInfo.type : "side";
                const to_set_type = ["monster", "spell", "trap"].indexOf(to_row_type) !== -1 ? "main" : to_row_type;
                const row_results_new = operateRowResults(row_results, cardInfo.cid, +1, to_row_type, df);
                importDeck(row_results_new, row_results, dno);
                const row_result = row_results[cardInfo.type];
                const ind_new = row_result.nums.length;
                const span = _generateDeckImgSpan(df, cardInfo.type, { name: cardInfo.name, cid: cardInfo.cid }, `${ind_new}_1`, cardInfo.limit);
                modifyDeckImg($("img", span), +1, to_set_type);
            }
        } else if (e.button === 1) {
            const url = cardInfo.url;
            window.open(url, "_blank");
        }
    } else if (e.button === 0 && e.target.matches("div.item_history.info_history, div.item_history.info_history *")) {
        const target = e.target.matches("div.item_history") ? e.target : e.target.closest("div.item_history");
        const pos_diff = parseInt(target.querySelector("span.main_info_history").getAttribute("pos_diff"))
        backNextInfoArea(pos_diff);
        removeElms(document.querySelectorAll("div.area_history"));
    } else if (e.button === 0 && e.target.matches("div.item_history.deck_history, div.item_history.deck_history *")) {
        const target = e.target.matches("div.item_history") ? e.target : e.target.closest("div.item_history");
        const uid = target.querySelector("div.main_deck_history").getAttribute("deck_history_uid");
        const dno = document.getElementById("dno").value;
        // console.log(dno, uid)
        callDeckHistory(dno, uid, df);
        removeElms(document.querySelectorAll("div.area_history"));
    } else if (e.button === 0 && e.target.matches("#info_area, #info_area *")) {
        if (document.querySelector("#info_area>div").getAttribute("info_url") !== null) return;
        const left_limit = info_area.offsetLeft + info_area.offsetWidth / 3;
        const right_limit = info_area.offsetLeft + info_area.offsetWidth * 2 / 3;
        // console.log(e.clientX, left_limit, right_limit, e)
        if (e.clientX < left_limit) {
            backNextInfoArea(-1);
        } else if (e.clientX > right_limit) {
            backNextInfoArea(+1);
        }

    }

    //if (sideChangeOnViewIsValid===true) 
    updateDeckCount();
    // remove additional script
    const script_initial_count = await operateStorage({ temps: JSON.stringify({}) }, "local"
    ).then(items => Object.assign({}, JSON.parse(items.temps))
    ).then(temps => temps.script_initial_count);
    if (script_initial_count !== null) {
        $(`script[type='text/javascript']:gt(${script_initial_count - 1})`).remove();
    }
}


const longPress = {
    //プロパティ
    el: "",
    count: 0,
    ms: 1000,
    interval: 10,
    timerId: 0,

    //メソッド
    init: function (param) {
        //引数のパラメータ取得
        this.el = document.querySelector(param.el);
        this.ms = param.ms;
        //イベントリスナー
        // let clicked = false;
        this.el.addEventListener("mousedown", async (e) => {
            if (e.button === 0 && document.querySelector("div.model_history") === null) this.start(e);
            // if (clicked === true) {
            //     clicked = false;
            //     return;
            // }
            // clicked = true;
            // setTimeout(async () => {
            //     if (clicked === true) {
            //         this.start(e);
            //     }
            //     clicked = false;
            // }, 200);
        }, false)

    },
    start: function (e) {
        document.addEventListener("mouseup", (e) => { this.end(e) }, false);
        this.timerId = setInterval(() => {

            this.count++;
            if (this.count * this.interval == this.ms) {
                setCircle(e);
                clearInterval(this.timerId);
            }
        }, this.interval);
    },
    end: function (e) {
        clearInterval(this.timerId);
        this.count = 0;
        removeProgressingCircle(e);
    },

}

const removeProgressingCircle = () => {
    setTimeout(() => {
        for (const elm of document.querySelectorAll("div.circle.progressing")) {
            elm.classList.remove("progressing");
            elm.classList.add("will-remove");
        }
    }, 100);
    setTimeout(() => {
        for (const elm of document.querySelectorAll("div.circle.will-remove")) {
            elm.remove();
        }
    }, 350);

}

const setCircle = (e) => {
    console.log(e);
    const div = document.createElement("div");
    const inner = document.createElement("p");
    inner.setAttribute("class", "circle-inner")
    div.setAttribute("class", "circle progressing will-appear");
    div.setAttribute(`style`, `position: fixed; top:${e.clientY - 15}px; left:${e.clientX - 15}px`)
    div.append(inner)
    document.querySelector("body").prepend(div);
    setTimeout(() => {
        for (const elm of document.querySelectorAll("div.circle.progressing")) {
            elm.classList.remove("progressing");
            elm.classList.add("finished");
        }
    }, 950);
    setTimeout(() => {
        const finishedCircles = document.querySelectorAll("div.circle.finished");
        if (finishedCircles.length == 0) {
            return;
        }
        const co = [finishedCircles[0].offsetLeft + finishedCircles[0].offsetWidth / 2,
        finishedCircles[0].offsetTop + finishedCircles[0].offsetHeight / 2]
        for (const elm of finishedCircles) {
            elm.classList.add("will-remove");
        }
        removeProgressingCircle();
        openAreaHistory(co);
    }, 1000)
}

const openAreaHistory = (co) => {
    const modal = document.createElement("div");
    // modal.style.position = "fixed";
    // modal.style.top = `${co[0]}px`;
    // modal.style.left = `${co[1]}px`;
    modal.setAttribute("class", "modal_history");
    document.getElementById("bg").append(modal);
    Promise.all([showInfoHistory(modal), showDeckHistory(modal)]).then(() => {

        for (const elm of modal.querySelectorAll("div.area_history")) {
            elm.addEventListener("wheel", (e) => {
                if (e.deltaX === 0) {
                    const reg = 1.5;
                    elm.scrollLeft += e.deltaY * reg;
                    e.preventDefault();
                }
            })
        }
        setTimeout(() => {
            document.addEventListener("mousedown", async (e) => {
                if (!e.target.matches("div.area_history, div.area_history *")) {
                    removeElms(document.querySelectorAll("div.area_history"));
                }
            }, false);
        }, 200)
    })

}
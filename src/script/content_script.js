"use strict";


//------------------------------------
//         #  on loading

//window.addEventListener("DOMContentLoaded",  async function(){
window.onload = async function () {
    const url_now = location.href;
    const html_parse_dic = parse_YGODB_URL(url_now, true);
    const url_body = parse_YGODB_URL_body(url_now);
    if (url_body !== "member_deck.action") return;
    const my_cgid = obtainMyCgid();

    const settings = await operateStorage({ settings: JSON.stringify({}) }, "sync")
        .then(items => Object.assign(defaultSettings, JSON.parse(items.settings)));
    //console.log(settings)

    const script_initial_count = $("script[type='text/javascript']").length;
    $("#footer_icon svg").css({ height: "min(5vh, 30px)" })
    if (html_parse_dic.ope == "8") {
        await guess_clicked();
    }
    if (["2", "8"].indexOf(html_parse_dic.ope) !== -1) {
        const IsCopyMode = html_parse_dic.ope === "8";
        // ## deck edit
        //const area = $("#header_box .save"); // before// 2022/4/18
        const area_bottom = $("#bottom_btn_set"); // after 2022/4/18

        // other buttons for bottom
        const button_bottom_dic = {
            back: $("<a>", { class: "btn hex orn button_backtoView", id: "button_backToView" })
                .append("<span>Back</span>"),
            header_visible: $("<a>", {
                class: "btn hex red button_visible_header hide", type: "button", id: "button_visible_header",
                style: "position: relative;user-select: none;"
            }).append("<span>Header HIDE</span>"),
            reloadSort: $("<a>", { class: "btn hex red button_reloadSort", id: "button_reloadSort" })
                .append("<span>Reload & Sort</span>"),
            searchShowHide: $("<a>", { class: "btn hex red button_searchShowHide", id: "button_searchShowHide" }).append("<span>Search SHOW</span>"),
            test: $("<a>", { class: "btn hex red button_sort", id: "button_test" }).append("<span>Test</span>")
        };
        for (const [button_type, button_tmp] of Object.entries(button_bottom_dic)) {
            if (settings.valid_feature_deckHeader === false && ["header_visible"].indexOf(button_type) !== -1) continue;
            if (settings.valid_feature_deckEditImage === false && ["reloadSort", "searchShowHide"].indexOf(button_type) !== -1) continue;
            if (settings.valid_feature_deckManager === false && !IsCopyMode && ["back"].indexOf(button_type) !== -1) continue;
            if (IsLocalTest === false && ["test"].indexOf(button_type) !== -1) continue;
            $(area_bottom).append(button_tmp);
        }
        // import button
        if (settings.valid_feature_importExport === true) {
            const label = $("<label>", { for: "button_importFromYdk_input" });
            const button_import = $("<a>", {
                class: "btn hex red button_import", type: "button", id: "button_importFromYdk",
                style: "position: relative;user-select: none;"
            })
                .append("<span>Import</span>")
            const input_button = $("<input>", { type: "file", accpet: "text/*.ydk", style: "display: none;", id: "button_importFromYdk_input" });
            button_import.append(input_button);
            label.append(button_import);
            area_bottom.append(label);
        }
        if (settings.valid_feature_deckHeader === true) {
            toggleVisible_deckHeader(settings.default_visible_header || IsCopyMode);

            // deck header
            const header_ids_dic = { category: "dckCategoryMst", tag: "dckTagMst", comment: "biko" };
            ["category", "tag", "comment"].map(ctc_name => {
                const ctc_now = $(`#${header_ids_dic[ctc_name]}`);
                const isCT = ["category", "tag"].indexOf(ctc_name) != -1;
                const ctc_span = $("dt>span", (isCT) ? ctc_now.parent().parent().parent() : ctc_now.parent().parent());
                const button = $("<a>", {
                    class: `btn hex button_size_header ${ctc_name} ` + (isCT ? " isCT" : " isComment"),
                    type: "button", id: `button_size_header_${ctc_name}`,
                    style: "position: relative;user-select: none;min-width: 0;"
                }).append("<span>Size</span>");
                $(ctc_span).append(button);
                const ctc_ind_size = 0;
                changeSize_deckHeader(ctc_name, ctc_ind_size - 1);
            })
            const button_guess = $("<a>", { class: "btn hex red button_guess", id: "button_guess" }).append("<span>Guess</span>");
            $(`#button_size_header_category`).after(button_guess);
            $(".box_default .box_default_table dt span").css({ "min-width": "0" });
            showSelectedOption();
        }
        if (html_parse_dic.ope !== "8" && settings.valid_feature_deckManager === true) {
            const header_box = $("div#deck_header>div#header_box");
            const dl_deck_name = $("dl:has(dd>input#dnm)", header_box);
            const img_delete = $("<a>", {
                class: "ui-draggable ui-draggable-handle button_keyword_delete",
                style: "flex:none;width:20px;height:20px;"
            })

            const dl_deck_version = $("<dl>", { class: "tab_mh100 alwaysShow", id: "deck_version_box" });
            const dt = $("<dt>").append($("<span>", { style: "min-width:0px;" }).append("Deck in Cache"));
            const dd = $("<dd>");
            //input_version_name=$("<select>", {id:"deck_version_name"});
            //input_version_tag=$("<select>", {id:"deck_version_tag"});
            const btns_version = {
                save: $("<a>", { class: "btn hex red button_deckVersion button_save", id: "button_deckVersionSave" })
                    .append("<span>Save</span>"),
                load: $("<a>", { class: "btn hex red button_deckVersion button_load", id: "button_deckVersionLoad" })
                    .append("<span>Load</span>"),
                delete: $("<a>", { class: "btn hex red button_deckVersion button_delete", id: "button_deckVersionDelete" })
                    .append("<span>Delete</span>"),
            };
            ["name", "tag"].map(key => {
                //const select=$("<select>", {type:"text", class:`select_deck_version ${key}`, style:"flex:1;"});
                const placeholder_dic = { name: "deck name", tag: "version tag" };
                const flex_dic = { name: 4, tag: 3 };
                const input = $("<input>", {
                    type: "text",
                    placeholder: `${placeholder_dic[key]}`,
                    list: `deckVersion_${key}List`,
                    id: `deck_version_${key}`,
                    style: `flex: ${flex_dic[key]}`
                });
                //const input_dummy=$("<input>", {style:"display:none;"});
                const datalist = $("<datalist>", { id: `deckVersion_${key}List` });
                dd.append($(img_delete).clone()).append(input).append(datalist);//.append(input_dummy)
                //dd.append(select)
            })
            //dd.append(input_version_name).append(input_version_tag)
            Object.values(btns_version).map(d => dd.append(d));
            dl_deck_version.append(dt).append(dd);
            dl_deck_name.after(dl_deck_version);
            //const deck_name=$("#dnm").val().replace(/^\s*|\s*$/g, "");
            //if (deck_name.length>0) $("#deck_version_name").val(deck_name);
            setDeckVersionTagList(true);

            const dnm = $("#dnm");
            const span_opened_dic = {
                dno: $("<span>", {
                    id: `deck_dno_opened`,
                    style: "flex:none;margin:0 2px 0;height:100%;background-color:#ddd;border: solid 1px #aaa"
                }).append(`${html_parse_dic.dno}`)
                    .css({
                        "font-weight": "bold",
                        "vertical-align": "middle"
                    }),
                name: $("<span>", {
                    id: `deck_name_opened`,
                    style: "flex:none;mrgin:0 2px 0;height:100%;background-color:#ddd;border: solid 1px #aaa"
                }).append(`${$(dnm).val()}`)
                    .css({
                        "font-weight": "bold",
                        "vertical-align": "middle"
                    })
            }
            Object.values(span_opened_dic).map(d => $(dnm).before(d));
            $(dnm).attr({ list: `deck_nameList` }).css({ flex: "4" });
            const datalist_deckName = $("<datalist>", { id: "deck_nameList" });
            const btns_official = {
                new: $("<a>", { class: "btn hex orn button_deckOfficial button_new", id: "button_deckOfficialNew" })
                    .append("<span>New</span>"),
                delete: $("<a>", { class: "btn hex orn button_deckOfficial button_delete", id: "button_deckOfficialDelete" })
                    .append("<span>Delete</span>"),
                copy: $("<a>", { class: "btn hex orn button_deckOfficial button_copy", id: "button_deckOfficialCopy" })
                    .append("<span>Copy</span>"),
                load: $("<a>", { class: "btn hex orn button_deckOfficial button_load", id: "button_deckOfficialLoad" })
                    .append("<span>Load</span>"),
                save: $("<a>", { class: "btn hex orn button_deckOfficial button_save", id: "button_deckOfficialSave" })
                    .append("<span>Save</span>"),
            };
            $(dnm).css({ width: "auto" });
            $(dnm).before($(img_delete).clone());
            // save, load button
            for (const [key, btn] of Object.entries(btns_official)){
                if (IsLocalTest===false && ["delete", "copy", "new"].indexOf(key)!==-1) continue;
                $(dnm).after(btn);
            };
            $("#btn_regist").css({ display: "none" });
            $(dnm).after(datalist_deckName);
            //$(dnm).after(input);
            //$(dnm).after($(img_delete).clone());
            //$(dnm).attr({list:"deck_nameList"});
            await setDeckNames(datalist_deckName);
        }
        if (settings.valid_feature_deckEditImage === true) {
            $("#article_body").attr({ oncontextmenu: "return false;" })
            // tablink for image/text
            const div_tablink = $("<div>", { class: "tablink tablink_deckSupport tablink_deckEdit", id: "mode_deckEdit" });
            const liInfo_dic = { text: { class: "deck_edit_text", text: "Text" }, image: { class: "deck_edit_image", text: "Image" } };
            const ul_now = $("<ul>")
            const select_now = $("<select>", { class: "deck_display MouseUI", id: "deck_dispaly" })
            Object.entries(liInfo_dic).map(([key_text, liInfo]) => {
                const liIsSelected = (settings.default_deck_edit_image === true && key_text === "image") ||
                    (settings.default_deck_edit_image === true && key_text === "image");
                const li_tmp = $("<li>", { class: liInfo.class + (liIsSelected ? " now" : ""), value: key_text });
                const span_tmp = $("<span>").append(liInfo.text)
                li_tmp.append(span_tmp);
                ul_now.append(li_tmp);
                const option_tmp = $("<option>", { value: liInfo.text }).append(liInfo.text);
                select_now.append(option_tmp);
            })
            div_tablink.append(ul_now);
            div_tablink.append(select_now);

            const div_num_total = $("#num_total");
            //$(div_num_total).css({margin: "0 0 0"})
            div_num_total.css({ display: "none" });
            area_bottom.append(div_tablink);

            // deck image
            const df = await obtainDF(obtainLang());
            const row_results = obtainRowResults(df);//obtainRowResults_Edit(df);
            console.log(row_results)
            insertDeckImg(df, row_results, false);
            updateCardLimitClass(row_results);
            const key_show = settings.default_deck_edit_image ? "image" : "text";
            operate_deckEditVisible(key_show);

            // shuffle button
            if (settings.valid_feature_sortShuffle === true) addShuffleButton(true);

            // operate click mode
            const span_tmp = $("<span>", { style: "border:none; line-height: 30px; min-width: 135px;" })
                .append(`Click|MOVE CARD/open url`);
            const button_clickMode = $("<a>", {
                class: `btn hex button_clickMode red`,
                id: "button_clickMode",
                oncontextmenu: "return false;"
            })
                .append(span_tmp.clone());
            addButtonAfterMainShuffle(button_clickMode);

            // search Area
            $("#bg>div:eq(0)").css({ background: "none" });
            $("div#wrapper").css({ width: "100%", "min-width": "fit-content" });
            $("#bg").css({ overflow: "scroll" });
            $("#num_total").css({ display: "none" });
            const div_search = obtainSearchForm();
            //const script_search=obtainSearchScript();
            const table = $("<div>", { style: "display:table;" });
            const div_body = $("<div>", { style: "display:none;width:40vw;", class: "none", id: "search_area" }); //table-cell
            const article = $("article");
            const article_body = $("#article_body");
            $(article_body).css({ display: "table-cell", "width": "50vw" });
            article.css({ "max-width": "initial", "scroll-snap-type": "y" });
            //$(div_body).append(script_search);
            const div_search_result = $("<div>", { id: "search_result", style: "max-height:80vh;overflow-y:scroll;", oncontextmenu: "return false;" });
            $(div_body).append(div_search);
            $(table).append(article_body).append(div_body);
            $(article).append(table);
            $("#form_search").after(div_search_result);
            obtainSearchScript();
            $("#deck_image .image_set").css({ "min-height": "min(4.1vw, 87px)" });
            operate_searchArea(settings.default_searchArea_visible && !IsCopyMode);
        }
    }
    else if (["1", null].indexOf(html_parse_dic.ope) != -1) {
        // ## deck view
        //const settings=await getSyncStorage({settings: defaultString}).then(items=>JSON.parse(items.settings));
        //const edit_area = $("#header_box #button_place_edit"); // before 2022/4/18
        const edit_area = $("#bottom_btn_set"); // after 2022/4/18
        const area = (edit_area.length > 0) ? edit_area : $("<span>", { id: "bottom_btn_set" }).appendTo($("#deck_header"));
        //console.log(area)
        const button_dic = {
            export: $("<a>", { class: "btn hex red button_export", oncontextmenu: "return false;" })
                .append("<span>Export (L:id/R:Name)</span>"),
            sortSave: $("<a>", { class: "btn hex red button_sort", id: "button_sortSave" })
                .append("<span>Sort & Save</span>"),
            test: $("<a>", { class: "btn hex red button_sort", id: "button_test" }).append("<span>Test</span>")
        };
        for (const [button_type, button_tmp] of Object.entries(button_dic)) {
            if (button_type === "sortSave" &&
                (my_cgid == null || html_parse_dic.cgid !== my_cgid || settings.valid_feature_sortShuffle === false)) continue;
            if (settings.valid_feature_importExport === false && ["import", "export"].indexOf(button_type) !== -1) continue;
            //if (settings.valid_feature_sideChange === false && ["sideChange"].indexOf(button_type) !== -1) continue;
            if (IsLocalTest === false && ["test"].indexOf(button_type) !== -1) continue;
            $(area).append(button_tmp);
        }
        if (settings.valid_feature_sortShuffle === true) addShuffleButton();
        if (settings.valid_feature_sideChange === true) {
            const deck_image = $("#deck_image");
            $(deck_image).addClass("deck_image").css({ "min-height": "890px" });
            $("#deck_image div.card_set div.image_set a").css({ "max-width": "max(6.5%, 55px)" });
            $("#deck_image div.card_set").css({ "margin": "0px 0px 0px" });

            const span_tmp = $("<span>", { style: "border:none; line-height: 30px; min-width: 180px;" })
                .append(`SideChange|L:Reset/R:ON`);
            const button_sideChange = $("<a>", {
                class: `btn hex button_sideChange sideChange`,
                id: "button_sideChange",
                oncontextmenu: "return false;"
            }).append(span_tmp.clone());
            addButtonAfterMainShuffle(button_sideChange);


            const card_set_temp = obtainNewCardSet("temp");
            //$(card_set_temp).css({display:"none"});
            $(deck_image).append(card_set_temp);
            const df = await obtainDF(obtainLang());
            const row_results = obtainRowResults(df);
            //let count = 0;
            for (const card_a of Array.from($("#deck_image div.card_set div.image_set a"))) {
                const span = $("span:eq(0)", card_a);
                const img = $("img", span);
                const classInfo = parseCardClass(img);
                //const classInfo_tmp=$(img).attr("class").match(/card_image_([^_]+)_(\d+)_(\d+).*/);
                /*const classInfo={
                    type:classInfo_tmp[1],
                    ind1:classInfo_tmp[2],
                    ind2:classInfo_tmp[3]
                };*/
                const row_result = row_results[classInfo.type];
                const cid_now = row_result.cids[classInfo.ind1];
                if (cid_now == null) console.log({ classInfo, row_result })
                //const id_now= df_filter(df, "id", ["cid", cid_now])[0];
                const attr_dic = {
                    card_name: row_result.names[classInfo.ind1],
                    card_cid: cid_now,//card_id:id_now,
                    card_type: classInfo.type,
                    card_url: `https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=2&cid=${cid_now}`
                }
                $(img).attr(attr_dic);
                $(img).css({ position: "relative", width: "100%" });
                //$(card_a).css({padding: "1px"});
                $(span).css({ "max-width": "max(6.5%, 55px)", padding: "1px", "box-sizing": "border-box", display: "block", position: "relative" });
                $(img).addClass("url_open");
                $(card_a).before(span);
                //if (settings.default_sideChange_view===true) $(span).css({"max-width": "6.5%", padding:"1px", "box-sizing":"border-box", display: "block"});
                //else $(card_a).css({"max-width": "6.5%", padding:"1px", "box-sizing":"border-box", display: "block"});
                //$(span).attr({a_span:count});
                //$(card_a).attr({a_span:count});
                $(card_a).remove();
                //count += 1;
            }
            ["main", "extra", "side"].map(set_type => {
                const card_set = $(`#deck_image div.card_set#${set_type}`);
                const image_set = $("div.image_set", card_set);
                if (image_set.length > 0) $(image_set).attr({ "set_type": $(card_set).attr("id") });
                else {
                    const card_set_new = obtainNewCardSet(set_type);
                    const image_set_new = $("div.image_set", card_set_new);
                    $(card_set).append(image_set_new);
                }
            })
            /*Array.from($("#deck_image div.card_set")).map(card_set =>{
                const image_set=$("div.image_set", card_set);
            })*/
            if (settings.default_sideChange_view === true) operateSideChangeMode("toggle");
            //const card_class_arr=
            //    .map(d=>$("img", d).attr("class").match(/card_image_([^_]+)_(\d+)_(\d+).*/)).map(d=>Object({type:d[1], ind1:d[2], ind2:d[3]}));
        }
    }

    const lastModifiedDate = await operateStorage({ lastModifiedDate: 0 }, "local").then(items => items.lastModifiedDate);
    await getSyncStorage({ settings: defaultString }).then(async storage => {
        //const df = JSON.parse(storage.df);
        const settings = JSON.parse(storage.settings);
        //console.log(Date.now() - lastModifiedDate);
        const passedTime = Date.now() - lastModifiedDate;
        const todayDay = (new Date(Date.now())).getDay() - 1;
        if (settings.autoUpdateDB && (passedTime > 1 * 86400 * 1000) &&
            (todayDay % 3 == 2 || passedTime > 3 * 86400 * 1000)) {
            await updateDB({ display: "", settings: settings });
        }
    })

    // # button clicked
    document.addEventListener("click", async function (e) {
        if ($(e.target).is("a.button_size_header, a.button_size_header *")) {
            const button = $([$(e.target).children(), e.target]
                .filter(d => $(d).length > 0)
            [0]).parents("a.button_size_header");
            const ctc_name = $(button).prop("id").match("button_size_header_(.*)")[1];
            changeSize_deckHeader(ctc_name);
        } else if ($(e.target).is(".tablink_deckSupport ul *")) {
            const tablink_now = $(e.target).parents(".tablink_deckSupport")[0];
            const ul_now = $("ul", tablink_now);
            const li_now = $(e.target).is("li") ? e.target : $(e.target).parents("li")[0];
            Array.from($("li", ul_now)).map(li_tmp => {
                if (li_tmp == li_now) $(li_tmp).addClass("now");
                else $(li_tmp).removeClass("now");
            });
            const key_show = $(li_now).attr("value");
            operate_deckEditVisible(key_show);
            //const row_results=obtainRowResults_Edit(df);
            //insertDeckImg(df, row_results, false);
        } else if ($(e.target).is("a.button_keyword_delete")) {
            $(e.target).next("input").val("");
            if ($(e.target).is("#deck_header dl#deck_version_box *")) await setDeckVersionTagList(false);
        } else if ($(e.target).is("a.button_deckVersion, a.button_deckVersion *")) {
            const button_target = $(e.target).is("a.button_deckVersion") ? e.target : $(e.target).parents("a.button_deckVersion")[0];
            $(button_target).toggleClass("red");
            const row_results = obtainRowResults(df);
            const deck_name = $("#deck_version_name").val().replace(/^\s*|\s*$/g, "");
            const deck_tag = $("#deck_version_tag").val().replace(/^\s*|\s*$/g, "").replace(/#\w+$/, "");
            const deck_tag_key_tmp = $("#deck_version_tag").val().replace(/^\s*|\s*$/g, "").match(/#(\w+)$/);
            if ($(button_target).hasClass("button_save")) {
                await operateDeckVersion("set", { name: deck_name, tag: deck_tag }, row_results);
                setDeckVersionTagList(true);
            } else if ($(button_target).hasClass("button_load")){
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
            await sleep(500);
            $(button_target).toggleClass("red");
        } else if ($(e.target).is("a.button_deckOfficial *")) {
            const button_target = $(e.target).is("a.button_deckOfficial") ? e.target : $(e.target).parents("a.button_deckOfficial")[0];
            //const toSave = $(button_target).hasClass("button_save");
            $(button_target).toggleClass("orn");
            const deck_name_tmp = $("#dnm").val().replace(/^\s*|\s*$/g, "");
            const deck_name_opened = $("#deck_name_opened").val().replace(/^\s*|\s*$/g, "");
            const deck_dno_opened = $("#deck_dno_opened").val().replace(/^\s*|\s*$/g, "");
            const deck_dno_tmp = deck_name_tmp.match(/#(\d+)$/);

            if ($(button_target).hasClass("button_save")) {
                const deck_name_tmp2 = deck_name_tmp.replace(/\s*#\d+$/, "");
                const deck_name = deck_name_tmp2.length > 0 ? deck_name_tmp2 : deck_name_opened || Date.now().toString();
                const row_results = obtainRowResults(df);
                const serialized_dic = {
                    header: $("#deck_header input, #deck_header select, #deck_header textarea").serialize(),
                    deck: serializeRowResults(row_results)
                };
                //console.log(serialized_dic);
                // const serialized_data = "ope=3&" + Object.values(serialized_dic).join("&");

                // await _Regist_fromYGODB(html_parse_dic, serialized_data);
                await _Regist_fromYGODB(html_parse_dic);
                await operateDeckVersion("set", { name: "@@Auto", tag: "_save_"+deck_name }, row_results);
                setDeckVersionTagList(true);
            } else if ($(button_target).hasClass("button_load")) {
                //const deck_name = deck_name_tmp.replace(/#\d+$/, "");
                if (deck_dno_tmp.length < 2) return;
                const deck_dno = deck_dno_tmp[1];
                await load_deckOfficial(df, my_cgid, deck_dno, settings);
            } else if ($(button_target).hasClass("button_new")){
                const my_cgid = obtainMyCgid();
                const dno_new=await generateNewDeck()//.then(d=>d.dno);
                //const deck_headr_hidden=_obtainHiddenHeader(body);
                //console.log($(body).prop("outerHTML"))
                await load_deckOfficial(df, my_cgid, dno_new, settings);
                //const res=await fetch(url)
                //console.log(body);
            } else if ($(button_target).hasClass("button_copy")){
                const my_cgid = obtainMyCgid();
                const dno = $("#dno").val();
                const lang = obtainLang();
                //const sps=new URLSearchParams(deck_header_tmp);
                //sps.set("dnm", Date.now().toString());
                const dno_new=await generateNewDeck();
                const deck_header_tmp=$("#deck_header input, #deck_header select, #deck_header textarea").serialize();
                const sps=new URLSearchParams(deck_header_tmp);
                sps.set("dno", dno_new);
                const serialized_dic={
                    header:sps.toString(),
                    deck:serializeRowResults(obtainRowResults(df))
                }
                const serialized_data="ope=3&"+Object.values(serialized_dic).join("&");
                console.log(serialized_data)
                await _Regist_fromYGODB({dno:dno_new, cgid:my_cgid, request_locale:lang}, serialized_data);
                await load_deckOfficial(df, my_cgid, dno_new, settings);
            } else if ($(button_target).hasClass("button_delete")){
                const my_cgid = obtainMyCgid();
                //const dno = $("#dno").val();
                const lang = obtainLang();
                const deck_name_tmp2 = deck_name_tmp.replace(/\s*#\d+$/, "");
                const deck_name = deck_name_tmp2.length > 0 ? deck_name_tmp2 : deck_name_opened || Date.now().toString();
                const deck_dno = (deck_dno_tmp!=null && deck_dno_tmp.length >=2) ? deck_dno_tmp[1]:deck_dno_opened;
                const sps_dic={cgid:my_cgid, request_locale:lang, dno:deck_dno, ope:7};
                const sps=new URLSearchParams(sps_dic);
                const url="https://www.db.yugioh-card.com/yugiohdb/member_deck.action?"+sps.toString();
                const html_dic=await _obtainDeckRecipie(my_cgid, deck_dno, lang, "1");
                const row_results=obtainRowResults(df, true, html_dic.text);
                await operateDeckVersion("set", { name: "@@Auto", tag: "_delete_"+deck_name }, row_results);
                const res=await fetch(url);
                if (!res.ok) {
                    console.log(res);
                    return;
                }
                const deckList=await obtainDeckListOfficial();
                const dnos=deckList.map(d=>d.dno);
                const dnos_smaller=dnos.filter(d=>parseInt(d)<deck_dno);
                const dno_load= (dnos_smaller.length===0) ? Math.max(...dnos) : Math.max(...dnos_smaller);
                await load_deckOfficial(df, my_cgid, dno_load, settings);
            }
            await sleep(500);
            $(button_target).toggleClass("orn");
            await setDeckNames($("#deck_nameList"));
        } else if ($(e.target).is("#deck_header dl.category_tag>dd select>option")) {
            const select=$(e.target).parents("select")[0];
            //console.log($(select).attr("multiple"), select)
            if ($(e.target).attr("value") !== "") $(e.target).attr({ "selected": $(e.target).attr("selected") === undefined });
            if ($(e.target).attr("value") === "" || $(e.target).attr("selected") === undefined) $(e.target).prop("selected", false);
            showSelectedOption();
        }
    });
    // ## mousedown
    const df = await obtainDF(obtainLang());
    document.addEventListener("mousedown", async function (e) {
        const sideChangeOnViewIsValid = ["1", null].indexOf(html_parse_dic.ope) !== -1 &&
            settings.valid_feature_sideChange === true &&
            $("#button_sideChange").length > 0 &&
            $("#button_sideChange").hasClass("on");
        const clickIsToOpenURL = $("#deck_image").length > 0 && $("#deck_image").hasClass("click_open_url");
        if ($(e.target).is("a.button_export, a.button_export *")) {
            const form = (e.button === 0) ? "id" : "name";
            console.log(`export deck as ${form}`)
            await exportAs(form);
        } else if ($(e.target).is("a.button_shuffle, a.button_shuffle *")) {
            const mode_shuffle = (e.button === 0) ? "shuffle" : "sort";
            const button_target = $(e.target).is("a.button_shuffle") ? $(e.target) : $(e.target).parents("a.button_shuffle")[0];
            const set_type = $(button_target).attr("set_type");
            shuffleCards(mode_shuffle, set_type);
        } else if ($(e.target).is("a.button_sideChange, a.button_sideChange *")) {
            const mode_sideChange = (e.button === 2) ? "toggle" : "reset";
            if (mode_sideChange === "reset" && !sideChangeOnViewIsValid) return;
            operateSideChangeMode(mode_sideChange, df);
        } else if ($(e.target).is("#deck_image div.image_set span:has(img), #deck_image div.image_set span:has(img) *")) {
            e.preventDefault();
            const span_tmp = $(e.target).is("div.image_set span:has(img)") ? e.target : $(e.target).parents("div.image_set span:has(img)")[0];
            const img_target = $("img", span_tmp);
            if (clickIsToOpenURL && $(img_target).attr("card_url") !== undefined) {
                if ([0, 1].indexOf(e.button) !== -1) {
                    const url = $(img_target).attr("card_url");
                    window.open(url);
                }
                return;
            } else if (!$(e.target).is("div.image_set_MouseUI *") && !sideChangeOnViewIsValid) return;
            const row_results = obtainRowResults(df)//sideChangeOnViewIsValid ? obtainRowResults(): obtainRowResults_Edit(df);
            const cid_now = $(img_target).attr("card_cid");
            const classInfo = parseCardClass(img_target);
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
                if (sideChangeOnViewIsValid === false) importDeck(row_results_new);
                if (num_image == 3 && from_set_type === "temp" && change_now < 0) modifyDeckImg(img_target, change_now, null);
                else if (num_image + change_now <= 3 && (num_now < 3 || from_set_type !== "temp")) modifyDeckImg(img_target, change_now, to_set_type);
                //insertDeckImg(df, row_results_new);
            } else if (e.button === 0 && $(e.target).is("#deck_image .image_set *")) {
                const onEdit = !sideChangeOnViewIsValid;
                const change_now = (from_set_type === "temp") ? 1 : 0;
                if (num_now + change_now <= 3) sideChange_deck(df, img_target, onEdit);
            }
        } else if ($(e.target).is("#search_result #card_list .t_row img")) {
            e.preventDefault();
            const img_target = e.target;
            const cardInfo_tmp = ["name", "id", "cid", "type", "url"].map(d => Object({ [d]: $(img_target).attr(`card_${d}`) }));
            const card_tRow = $(img_target).parents("#search_result>#card_list>.t_row");
            const card_limit_div = $("dl.flex_1>dd.icon.top_set>div.lr_icon", card_tRow);
            const card_limit_dic = { forbidden: "fl_1", limited: "fl_2", semi_limited: "fl_3" };
            const card_limit = card_limit_div.length == 0 ? "not_limited" :
                Object.entries(card_limit_dic)
                    .map(([lim_name, lim_class]) => {
                        if ($(card_limit_div).hasClass(lim_class)) return lim_name;
                        else return null;
                    }).filter(d => d !== null)[0];
            const cardInfo = Object.assign(...cardInfo_tmp, { limit: card_limit });
            if ([0, 2].indexOf(e.button) !== -1) {
                const row_results = obtainRowResults(df)//obtainRowResults_Edit();
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
                    importDeck(row_results_new);
                    const row_result = row_results[cardInfo.type];
                    const ind_new = row_result.nums.length;
                    const span = _generateDeckImgSpan(df, cardInfo.type, { name: cardInfo.name, cid: cardInfo.cid }, `${ind_new}_1`, cardInfo.limit);
                    modifyDeckImg($("img", span), +1, to_set_type);
                }
            } else if (e.button === 1) {
                const url = cardInfo.url;
                window.open(url, "_blank");
            }
        }

        //if (sideChangeOnViewIsValid===true) 
        updateDeckCount();
        // remove additional script
        $(`script[type='text/javascript']:gt(${script_initial_count - 1})`).remove();
    })

    // ## double click
    document.addEventListener("dblclick", async function (e) {
        if ($(e.target).is("#deck_header dl.category_tag>dd select>option")) {
            console.log($(e.target).prop("selected"))
            //$(e.target).prop("selected", !$(e.target).prop("selected"));
            //$(e.target).toggleClass("clicked");
        }
    })
    // ## button id
    $("#button_importFromYdk").on("change", async function () {
        await importFromYdk();
    });
    $("#button_sortSave").on("click", async function () {
        await sortSaveClicked();
    });
    $("#button_reloadSort").on("click", async function () {
        if ($("#deck_text").css("display") !== "none") return;
        const row_results = obtainRowResults(df);//obtainRowResults_Edit(df);
        const row_results_new = await sortCards(row_results);
        importDeck(row_results_new);
        insertDeckImg(df, row_results_new);
        /*for (const set_type of ["main", "extra", "side", "temp"]){
            shuffleCards("reset", set_type);
        }*/
        //await sortClicked();
    });
    $("#button_searchShowHide").on("click", async function () {
        operate_searchArea();
    });
    $("#button_clickMode").on("click", async function () {
        //operate_clickMode();
        $("#deck_image").toggleClass("click_open_url");
        $(this).toggleClass("red");
        const clickIsToOpenURL = $("#deck_image").hasClass("click_open_url");
        $("span", this).html(`Click|` + (clickIsToOpenURL ? "move card/OPEN URL" : "MOVE CARD/open url"));
    });

    $("#button_guess").on("click", async function () {
        await guess_clicked();
    });



    $("#button_test").on("click", async function () {
        const url="https://www.db.yugioh-card.com/yugiohdb/member_deck.action?ope=4&cgid=87999bd183514004b8aa8afa1ff1bdb9"
        const body=await obtainStreamBody(url);
        //const dno_new=$("#bottom_btn>a", body).attr("href").match(/dno=(\d+)/)[1];
        console.log(body);
    });

    $("#button_visible_header").on("click", function () {
        toggleVisible_deckHeader();
    });
    $("#button_backToView").on("click", async function () {
        const my_cgid = obtainMyCgid();
        const dno = $("#dno").val();
        const lang = obtainLang();
        const sps = { ope: "1", cgid: my_cgid, dno: dno, request_locale: lang };
        const url = `https://www.db.yugioh-card.com/yugiohdb/member_deck.action?` + Object.entries(sps).filter(([k, v]) => v !== null).map(([k, v]) => `${k}=${v}`).join("&");
        location.href = url;
    });
    
    // ## change
    $("#deck_version_name").on("change", async function () {
        await setDeckVersionTagList(false);
    });

    /*$("#button_sort").on("click", async function (){
        const row_results=obtainRowResults(df)//obtainRowResults_Edit(df);
        //console.log(row_results)
        const MouseUIIsVisible=$(".tablink_deckEdit ul li.deck_edit_image").hasClass("now");
        insertDeckImg(df, row_results, MouseUIIsVisible);
    })*/
    // ## trigger
    /*window.addEventListener("message", async function (e) {
        const content = e.data;
        if (!/^trigger_/.test(content)) return;
        //console.log(content);
        if (/_sortCard/.test(content)) {
            const json_dumped = content.replace("trigger_sortCard_", "");
            const row_results_new = JSON.parse(json_dumped);
            //const row_results_new=await sortCards(row_results);
            //console.log(row_results_new);
            const row_names = ["monster", "spell", "trap", "extra", "side"];
            const row_str_new = JSON.stringify(row_names
                .map(row_name => ({ [row_name]: { names: row_results_new[row_name].names, nums: row_results_new[row_name].nums.map(d => parseInt(d)) } })))
            while (true) {
                importDeck(row_results_new);
                const row_results = obtainRowResults()//obtainRowResults_Edit();
                const row_str = JSON.stringify(row_names
                    .map(row_name => ({ [row_name]: { names: row_results[row_name].names, nums: row_results[row_name].nums } })))
                if (row_str == row_str_new) {
                    const regist_btn = $("#btn_regist>span");
                    const save_text = regist_btn.text();
                    //document.querySelector("#btn_regist").classList.remove("orn");
                    //$("#btn_regist").toggleClass("orn");
                    //$("#btn_regist").toggleClass("pnk");
                    //regist_btn.text(save_text + " (CLICK HERE)");
                    await _Regist_fromYGODB().then(async _ => {
                        await sleep(500);
                        window.opener.postMessage("trigger_closeWindow", "*");
                    });
                    //console.log("Sorted. Please save and close.");
                    //console.log(window.opener);
                    //window.opener.postMessage("trigger_closeWindow", "*");
                    //Regist() // function on YGO
                    // message on HTML*/
    /*document.addEventListener("click", async function (e) {
        if ($(e.target).is("#btn_regist *")) {
            window.opener.postMessage("trigger_closeWindow", "*");
        }
    })*//*
    break;

} else await sleep(500);
};
}
if (/_closeWindow/.test(content)) {
setTimeout(() => { e.source.close() }, 200);
setTimeout(() => { location.reload() }, 1000);
}
})*/
};
//});


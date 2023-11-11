"use strict";

const news_message = " / New Updates about Info Area are Coming, <a href=\"https://github.com/TomoTom0/YGO_deck_extension/blob/5df4dcd0c8e38069576ad58d0c617599b10b97d6/intro/NEWS_v2p1.md\" target=\"_blank\">Read Here</a>"

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
        .then(items => Object.assign(defaultSettings, JSON.parse(items.settings), { valid_feature_sideChange: true }));

    // # -------- prepare ----------

    const script_initial_count = document.querySelectorAll("script[type='text/javascript']").length;
    operateStorage({ temps: JSON.stringify({}) }, "local") //const temps = await 
        .then(items => Object.assign({}, JSON.parse(items.temps), { script_initial_count: script_initial_count })
        ).then(temps => {
            operateStorage({ temps: JSON.stringify(temps) }, "local", "set")
        });


    if (settings.flag_showFooterIcons === false) {
        document.getElementById("footer_icon").style.display = "none";
    } else document.querySelector("#footer_icon svg").style.height = "min(5vh, 30px)";
    if (html_parse_dic.ope == "8") {
        guess_clicked(); // await 
    }
    if (["2", "8"].indexOf(html_parse_dic.ope) !== -1) {
        const IsCopyMode = html_parse_dic.ope === "8";
        // ## deck edit
        //const area = $("#header_box .save"); // before// 2022/4/18
        const area_bottom = $("#bottom_btn_set"); // after 2022/4/18

        // other buttons for bottom
        const button_bottom_dic = {
            back: $("<a>", { class: "btn hex orn square button_backtoView", id: "button_backToView" })
                .append($("<span>", { title: "back" }).append(svgs.arrowBack)),
            headerShowHide: $("<a>", {
                class: "btn hex red square button_visible_header hide", type: "button", id: "button_visible_header",
                style: "position: relative;user-select: none;"
            }).append($("<span>", { title: "show Header" }).append(svgs.toc)),
            test: $("<a>", { class: "btn hex square red button_sort", id: "button_test" }).append("<span>Test</span>"),
            export: $("<a>", { class: "btn hex red square button_export", oncontextmenu: "return false;" })
                .append($("<span>", { title: "Export deck recipie with id/cid/Name", style: "font-size:10px;" }).append(svgs.download + "id/cid/Name"))// "<span>Export (L:id/M:cid/R:Name)</span>"),
        };

        for (const [button_type, button_tmp] of Object.entries(button_bottom_dic)) {
            if (settings.valid_feature_deckHeader === false && ["headerShowHide"].indexOf(button_type) !== -1) continue;
            if (settings.valid_feature_deckEditImage === false && ["reloadSort", "searchShowHide", "infoShowHide"].indexOf(button_type) !== -1) continue;
            if (settings.valid_feature_deckManager === false && !IsCopyMode && ["back"].indexOf(button_type) !== -1) continue;
            if (IsLocalTest === false && ["test", "hoverName"].indexOf(button_type) !== -1) continue;
            button_tmp.css({ margin: "2px 2px" })
            $(area_bottom).append(button_tmp);
        }
        // import button
        if (settings.valid_feature_importExport === true) {
            const label = $("<label>", { for: "button_importFromYdk_input" });
            const button_import = $("<a>", {
                class: "btn hex red square button_import", type: "button", id: "button_importFromYdk",
                style: "position: relative;user-select: none;"
            })
                .append($("<span>", { title: "import from .ydk file" }).append(svgs.upload));
            const input_button = $("<input>", { type: "file", accpet: "text/*.ydk", style: "display: none;", id: "button_importFromYdk_input" });
            button_import.append(input_button);
            label.append(button_import);
            area_bottom.append(label);

        }
        if (html_parse_dic.ope !== "8" && settings.valid_feature_deckManager === true) {
            const header_box = $("div#deck_header>div#header_box");
            const dl_deck_name = $("dl:has(dd>input#dnm)", header_box);
            const img_delete = $("<a>", {
                class: "ui-draggable ui-draggable-handle button_delete_keyword",
                style: "flex:none;width:20px;height:20px;cursor:pointer;"
            }).append(svgs.backspace);
            const class_deck_version = "tab_mh100" + (settings.flag_showCacheDeck === true ? " alwaysShow" : "")
            const dl_deck_version = $("<dl>", { class: class_deck_version, id: "deck_version_box" });
            const dt = $("<dt>").append($("<span>", { style: "min-width:0px;" }).append("Deck in Cache"));
            const dd = $("<dd>");
            //input_version_name=$("<select>", {id:"deck_version_name"});
            //input_version_tag=$("<select>", {id:"deck_version_tag"});
            const btns_version = {
                save: $("<a>", { class: "btn hex red square button_deckVersion button_save", id: "button_deckVersionSave" })
                    .append($("<span>", { title: "cache save" }).append(svgs.save)),
                load: $("<a>", { class: "btn hex red square button_deckVersion button_load", id: "button_deckVersionLoad" })
                    .append($("<span>", { title: "cache load" }).append(svgs.style)),
                delete: $("<a>", { class: "btn hex red square button_deckVersion button_delete", id: "button_deckVersionDelete" })
                    .append($("<span>", { title: "cache delete" }).append(svgs.delete)),
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
                dd.append(input).append($(img_delete).clone()).append(datalist);//.append(input_dummy)
                //dd.append(select)
            })
            //dd.append(input_version_name).append(input_version_tag)
            Object.values(btns_version).map(d => dd.append(d.css({ flexBasis: "20px", padding: "2px" })));
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
                        "vertical-align": "middle",
                        "max-height": "30px"
                    }),
                // name: $("<span>", {
                //     id: `deck_name_opened`,
                //     style: "flex:none;mrgin:0 2px 0;height:100%;background-color:#ddd;border: solid 1px #aaa"
                // }).append(`${$(dnm).val()}`)
                //     .css({
                //         "font-weight": "bold",
                //         "vertical-align": "middle"
                //     })
            }
            Object.values(span_opened_dic).map(d => $(dnm).before(d));
            $(dnm).attr({ list: `deck_nameList` }).css({ flex: "4" });
            document.getElementById("dnm").setAttribute("placeholder", $(dnm).val());
            const datalist_deckName = $("<datalist>", { id: "deck_nameList" });
            const btns_official = {
                copy: $("<a>", { class: "btn hex orn square button_deckOfficial button_copy", id: "button_deckOfficialCopy" })
                    .append($("<span>", { title: "official copy" }).append(svgs.copy)),
                delete: $("<a>", { class: "btn hex orn square button_deckOfficial button_delete", id: "button_deckOfficialDelete" })
                    .append($("<span>", { title: "official delete" }).append(svgs.delete)),
                new: $("<a>", { class: "btn hex orn square button_deckOfficial button_new", id: "button_deckOfficialNew" })
                    .append($("<span>", { title: "official new" }).append(svgs.add)),
                save: $("<a>", { class: "btn hex orn square button_deckOfficial button_save", id: "button_deckOfficialSave" })
                    .append($("<span>", { title: "official save" }).append(svgs.save)),
                load: $("<a>", { class: "btn hex orn square button_deckOfficial button_load", id: "button_deckOfficialLoad" })
                    .append($("<span>", { title: "official load" }).append(svgs.style)),

            };
            $(dnm).css({ width: "auto" });

            // save, load button
            const div_saveload = document.createElement("div");
            div_saveload.style.flex = 8;
            div_saveload.style.display = "flex";
            div_saveload.style.maxHeight = "30px";
            div_saveload.setAttribute("class", "div_officialButton div_saveloadButtons")
            const div_others = document.createElement("div");
            div_others.style.flex = 1;
            div_others.style.display = "flex";
            div_others.style.maxHeight = "30px";
            div_others.setAttribute("class", "div_officialButton div_otherButtons")
            $(dnm).after(div_others);
            $(dnm).after(div_saveload);
            // document.getElementById("dnm").closest("dl").querySelector("dl>dt>span").appendChild(div_saveload);
            $(dnm).css({ maxHeight: "30px" })
            for (const [key, btn] of Object.entries(btns_official)) {
                if (["delete", "copy", "new"].indexOf(key) !== -1) {
                    $(div_others).append(btn);
                } else $(div_saveload).append(btn);
            };
            $("#btn_regist").css({ display: "none" });
            $(dnm).after(datalist_deckName);
            $(dnm).after($(img_delete).clone());
            //$(dnm).after(input);
            //$(dnm).after($(img_delete).clone());
            //$(dnm).attr({list:"deck_nameList"});
            await setDeckNames(datalist_deckName);
            showMessage(`Loaded ${news_message}`);
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
            // console.log(row_results)
            insertDeckImg(df, row_results, false);
            updateCardLimitClass(row_results);
            const key_show = settings.default_deck_edit_image ? "image" : "text";
            operate_deckEditVisible(key_show);

            // shuffle button
            if (settings.valid_feature_sortShuffle === true) addShuffleButton(true);

            const button_bottom_dic = {
                searchShowHide: $("<a>", { class: "btn hex square button_searchShowHide", id: "button_searchShowHide" }
                ).append($("<span>", { title: "show search area" }).append(svgs.search)),
                infoShowHide: $("<a>", { class: "btn hex red square button_infoShowHide", id: "button_infoShowHide" }
                ).append($("<span>", { title: "show info area" }).append(svgs.contancts)),
                fixScroll: $("<a>", { class: "btn hex square show button_fixScroll", id: "button_fixScroll" })
                    .append($("<span>", { title: "fit editor" }).append(svgs.fullscreen)),
                // hoverName: $("<a>", { class: "btn hex square red show button_toggleHoverName", id: "button_toggleHoverName" })
                //     .append($("<span>", { title: "show card names on mouse hovering" }).append(svgs.liveHelp)),
                reloadSort: $("<a>", { class: "btn hex square red button_reloadSort", id: "button_reloadSort" })
                    .append($("<span>", { title: "sort all cards" }).append(svgs.sort)),
            };
            const main_span_num = document.querySelector("#main > div.subcatergory > div.top > span:last-child");
            console.log(main_span_num)

            for (const [button_type, button_tmp] of Object.entries(button_bottom_dic)) {
                if (settings.valid_feature_deckManager === false && !IsCopyMode && ["back"].indexOf(button_type) !== -1) continue;
                if (IsLocalTest === false && ["test", "hoverName"].indexOf(button_type) !== -1) continue;
                button_tmp.css({ margin: "2px 2px" })
                if (main_span_num !== null) $(main_span_num).before(button_tmp);
                else $(area_bottom).append(button_tmp);
            }

            $("#bg>div:eq(0)").css({ background: "none" });
            $("div#wrapper").css({ width: "100%", "min-width": "fit-content", "height": "fit-content" });
            $("#bg").css({ overflow: "scroll" });
            $("#num_total").css({ display: "none" });

            const article = $("article");
            article.css({ "max-width": "initial", "scroll-snap-type": "y" });
            const div_article_body = $("div#article_body");
            $(div_article_body).css({ "flex": "5 1 35vw", minWidth: "10vw" });//, "max-width": "35vw"

            const div_search = parseHTML(obtainSearchForm());
            div_search.querySelector("#submit_area").style.flex = "2 0 10%";
            // div_search.querySelector(".search_btn_set").style.maxWidth="80%";
            const search_key_area = div_search.querySelector("div.search");
            search_key_area.style["max-width"] = "80%";
            search_key_area.querySelector("#first_search").style["max-width"] = "50%";
            search_key_area.querySelector("#first_search input").style["max-width"] = "80%";
            search_key_area.querySelector("#stype").style["max-width"] = "40%";
            const table = $("<div>", { style: "display:flex;" });
            $(article).append(table);
            $(table).append(div_article_body);

            const div_body = $("<div>", {
                style: "padding:5px;flex: 1 5 30vw;min-width: 10vw;",//max-width:30vw;
                class: "",
                id: "search_area"
            });
            const div_search_result = $("<div>", {
                id: "search_result",
                style: "max-height:70vh;overflow-y:scroll;",
                oncontextmenu: "return false;"
            });
            $(div_body).append(div_search.outerHTML);

            // const splitter = document.createElement("div");
            // splitter.setAttribute("style", "flex-basis:50px;cursor:col-resize;background: #000;");
            // splitter.setAttribute("class", "flex_splitter");
            // const splt_tmp = splitter.cloneNode();
            // splt_tmp.setAttribute("left-id", "article_body");
            // splt_tmp.setAttribute("right-id", "search_area");
            // table.append(splt_tmp);
            $(table).append(div_body);
            $("#form_search").after(div_search_result);

            obtainSearchScript();
            $("#deck_image .image_set").css({ "min-height": "min(3.5vw, 45px)" });
            operate_searchArea(settings.default_searchArea_visible && !IsCopyMode);


            // console.log(doc_get);
            const div_info = $("<div>", { style: "width:100%;max-height:80vh;overflow-y:scroll;" });
            const div_info_body = $("<div>", {
                style: "padding:5px;flex: 3 2 30vw;min-width: 10vw;", //min-width:30vw;max-width:30vw;
                class: "",
                id: "info_area"
            });
            $(div_info_body).append(div_info);
            // const splt_tmp2 = splitter.cloneNode();
            // splt_tmp2.setAttribute("left-id", "info_area");
            // splt_tmp2.setAttribute("right-id", "article_body");
            // table.prepend(splt_tmp2);
            $(table).prepend(div_info_body);
            operate_infoArea(settings.default_infoArea_visible && !IsCopyMode);

            operate_fixScroll(settings.default_fit_edit && !IsCopyMode);

            //openCardInfoArea();

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
            export: $("<a>", { class: "btn hex red square button_export", oncontextmenu: "return false;" })
                .append($("<span>", { title: "Export deck recipie with id/cid/Name", style: "font-size:10px;" }).append(svgs.download + "id/cid/Name")),
            // sortSave: $("<a>", { class: "btn hex red square button_sort", id: "button_sortSave" })
            //     .append($("<span>", { title: "sort all cards" }).append(svgs.sort)),
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
        if (true || settings.valid_feature_sideChange === true) {
            const deck_image = $("#deck_image");
            $(deck_image).addClass("deck_image").css({ "min-height": "890px" });
            $("#deck_image div.card_set div.image_set a").css({ "max-width": "min(6.5%, 55px)" });
            $("#deck_image div.card_set").css({ "margin": "0px 0px 0px" });

            // const span_tmp = $("<span>", { style: "border:none; line-height: 30px; min-width: 180px;" })
            //     .append(`SideChange|L:Reset/R:ON`);
            // const button_sideChange = $("<a>", {
            //     class: `btn hex button_sideChange sideChange`,
            //     id: "button_sideChange",
            //     oncontextmenu: "return false;"
            // }).append(span_tmp.clone());
            // addButtonAfterMainShuffle(button_sideChange);


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
            if (true || settings.default_sideChange_view === true) operateSideChangeMode("toggle");
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
            refreshCacheHtml();
        }
    })

    // # --------- button clicked -----------
    listen_clickAndDbclick(); // await
    // document.addEventListener("click", listen_click);
    // ## mousedown
    // const df = await obtainDF(obtainLang());
    // document.addEventListener("mousedown", listen_mousedown);

    // ## double click
    document.addEventListener("dblclick", async function (e) {
        if (e.target.matches("#deck_header dl.category_tag>dd select>option")) {
            console.log($(e.target).prop("selected"))
            //$(e.target).prop("selected", !$(e.target).prop("selected"));
            //$(e.target).toggleClass("clicked");
        }
    })
    // ## button id
    $("#button_importFromYdk").on("change", async function () {
        await importFromYdk();
    });
    // $("#button_sortSave").on("click", async function () {
    //     await sortSaveClicked();
    // });
    // $("#button_reloadSort").on("click", async function () {
    //     const reloadSort = async ()=>{
    //         if ($("#deck_text").css("display") !== "none") return;
    //         const row_results = obtainRowResults(df);//obtainRowResults_Edit(df);
    //         const row_results_new = await sortCards(row_results);
    //         importDeck(row_results_new);
    //         insertDeckImg(df, row_results_new);    
    //     }
    //     /*for (const set_type of ["main", "extra", "side", "temp"]){
    //         shuffleCards("reset", set_type);
    //     }*/
    //     //await sortClicked();
    // });
    // $("#button_searchShowHide").on("click", async function () {
    //     operate_searchArea();
    // });
    // $("#button_infoShowHide").on("click", async function () {
    //     operate_infoArea();
    // });
    // $("#button_fixScroll").on("click", async function () {
    //     operate_fixScroll();
    // });
    // $("#button_visible_header").on("click", function () {
    //     toggleVisible_deckHeader();
    // });
    // $("#button_clickMode").on("click", async function () {
    //     //operate_clickMode();
    //     $("#deck_image").toggleClass("click_open_url");
    //     $(this).toggleClass("red");
    //     const clickIsToOpenURL = $("#deck_image").hasClass("click_open_url");
    //     $("span", this).html(`Click|` + (clickIsToOpenURL ? "move card/OPEN URL" : "MOVE CARD/open url"));
    // });

    // $("#button_guess").on("click", async function () {
    //     await guess_clicked();
    // });



    $("#button_test").on("click", async function () {
        // const url = "https://www.db.yugioh-card.com/yugiohdb/member_deck.action?ope=4&cgid=87999bd183514004b8aa8afa1ff1bdb9"
        // const body = await obtainStreamBody(url);
        // //const dno_new=$("#bottom_btn>a", body).attr("href").match(/dno=(\d+)/)[1];
        // console.log(body);
        // refreshCacheHtml(0);
        // await operateStorage({ urlHistory: JSON.stringify({}) }, "local", "set");
        // await operateStorage({ cacheInfos: JSON.stringify({}) }, "local", "set");
        // const df = await obtainDF(obtainLang());
        // const row_results = await obtainRowResults(df);

        // console.log(row_results)

        // await addUrlHistory("https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=2&cid=17069")
        // operateStorage({ urlHistory: JSON.stringify({}) }, "local", "get"
        // ).then(items => Object.assign({ urls: [], pos: -1 }, JSON.parse(items.urlHistory))
        // ).then(urlHistory => {
        //     console.log(JSON.stringify(urlHistory))
        // })
        // backNextInfoArea(-1);
    });


    // $("#button_backToView").on("click", async function () {
    //     const html_parse_dic = parse_YGODB_URL(location.href, true);
    //     const my_cgid = obtainMyCgid();
    //     const dno = $("#dno").val();
    //     const lang = obtainLang();
    //     const sps = { ope: "1", wname: html_parse_dic.wname, cgid: my_cgid, dno: dno, request_locale: lang };
    //     const url = `https://www.db.yugioh-card.com/yugiohdb/member_deck.action?` + Object.entries(sps).filter(([k, v]) => v !== null).map(([k, v]) => `${k}=${v}`).join("&");
    //     location.href = url;
    // });

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
        if (e.target.matches("#btn_regist *")) {
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


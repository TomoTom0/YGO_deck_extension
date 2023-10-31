"use strict";

const limitedKey = ["atk", "def", "race", "type", "attribute", "set", "LMarker", "cid", "ot"];
const numberKey = ["scale", "level", "id"];
const includeKey=["type", "set"];

const langs=["ja", "en", "de", "fr", "it", "es", "pt", "ko"];

function makeTable(tableContent={},captionText=""){
    const table=$("<table>", {class:"part"});
    const caption=$("<caption>").append(captionText);
    const thead=$("<thead>");
    const tbody=$("<tbody>");
    const labelArray=Object.keys(tableContent);
    const dataArray=Object.values(tableContent);
    const tr=$("<tr>");
    labelArray.forEach(d=>tr.append($("<th>").append(d)));
    thead.append(tr);
    [...Array(dataArray[0].length).keys()].forEach(ind=>{
        const tr=$("<tr>");
        dataArray.forEach(data=>{
            const data_formated= (typeof(data[ind])=="string") ? data[ind].replace(/,/g, " ") : data[ind];
            tr.append($("<td>").append(data_formated));
        })
        tbody.append(tr);
    })
    table.append(caption).append(thead).append(tbody);
    return table;
}

const searchFunc = async (df)=>{
    //const df=await obtainDF();
    let searchKVs = [];
    Array.from($("span.spanSearchKV")).map(obj => {
        const key = $(".selectSearchKey", obj).val();
        const val = $(".inputSearchVal", obj).val();
        if (val && numberKey.indexOf(key) != -1) searchKVs.push([key, val - 0]);
        else if (val) searchKVs.push([key, val]);
    });
    //console.log(searchKVs)
    const searcheResults = searchKVs.reduce((df_tmp, cur) => {
        const langs=["ja", "en", "de", "fr", "it", "es", "pt", "ko"];
        const name_langs=langs.map(d=>`name_${d}`);
        const condition = ([...includeKey, "name", ...name_langs].indexOf(cur[0])!=-1) ? "in" : "=";
        const ids = df_filter(df_tmp, "ind", cur, condition);
        return df_filter(df_tmp, Object.keys(df), ["ind", ids])
    }, df)
    console.log(searcheResults);
    const searchResultArea=$("#searchResultArea");
    searchResultArea.empty();
    const table=makeTable(searcheResults, "Search Results");
    searchResultArea.append(table);
}

const load_deckVersionText=(df, deckVersions, deck_name ,deck_version_area)=>{
    deck_version_area.empty();
    //deck_version_area.append($("<div>").css({"font-weight":"bold"}).append(deck_name));
    $("#deck_version_name_loaded").text(deck_name);
    $("#area_for_buttonDeckVersionTagAll").css({display:"block"});
    Object.entries(deckVersions).map(([tag_key, deck_version])=>{
        const row_results=convertRowResults(df, deck_version.row_results_min, false);
        //insertDeckImg(df, row_results, true, div_deck_image);
        const display_text=`${deck_version.date}:  ${deck_version.tag}  #${tag_key}`;
        const div_deck_text=insertDeckText(row_results, null, display_text);
        $(".deck_text_table", div_deck_text).attr("tag_key", tag_key);
        const checkbox=$("<span>", {type:"", class:"custom-control custom-checkbox"}).css({margin:"10px"})
            .append($("<input>", {type:"checkbox", class:"deck_version_checkbox custom-control-input", tag_key:tag_key}));
        const showHide_version=$("<span>", {class:"button_toggleShowHide_deckVersion button_DeckVersion", tag_key:tag_key})
            .css({"background-color":"#7777ee", color:"#eeeeee", padding:"0 6px 0"}).append("v");
        $("div.top", div_deck_text).prepend(checkbox).prepend(showHide_version);
        $(div_deck_text).attr("tag_key", tag_key);
        deck_version_area.append(div_deck_text);
    })
}
const showHide_deckVersion=(tag_key, toShowIn=null)=>{
    const deck_text_table=$(`#area_deckVersionImages .deck_text_table[tag_key='${tag_key}']`);
    if (toShowIn===null) $(deck_text_table).toggleClass("hide");
    else if (toShowIn===true) $(deck_text_table).removeClass("hide");
    else if (toShowIn===false) $(deck_text_table).addClass("hide");
    const toShow=!$(deck_text_table).hasClass("hide");
    deck_text_table.css({display:toShow ? "block" : "none"});
}

// # on load
$(async function () {
    const items=await getSyncStorage({settings: JSON.stringify({}), repoInfos:defaultRepoStrings});
    const settings=Object.assign(defaultSettings, JSON.parse(items.settings));
    for (const [key, val] of Object.entries(settings)){
        const checkArea=$(`#check_${key}`);
        if (checkArea.length>0) $(checkArea).prop({checked:val});
    }
    const repoInfos=JSON.parse(items.repoInfos);
    const items2=await operateStorage({ df: JSON.stringify({}), lastModifiedDate: 0}, "local");
    const df_init = (Date.now() - items2.lastModifiedDate < 3 * 86400 * 1000) ? JSON.parse(items2.df) :
        await updateDB({display:"", settings, repoInfos});


    const select_lang=$("select#value_defaultLang");
    langs.map(lang=>{
        const option=$("<option>", {value:lang}).append(lang);
        select_lang.append(option);
    })


    Array.from($(".selectSearchKey")).map( obj => {
        Object.keys(df_init).forEach(key => {
            const option = $("<option>").val(key).text(key);
            $(obj).append(option);
        })
    })
    const modifiedDateString = (new Date(items2.lastModifiedDate)).toLocaleDateString();
    $(".CardDBSection").text(`Card DataBase: Last Update@${modifiedDateString}`);
    Object.entries(settings).map(([key,val])=>{
        if (typeof(val)=="boolean") {
            const checkArea=$(`#check_${key}`);
            if (checkArea.lenth>0) checkArea.prop({"checked":val});
        } else if (typeof(val)=="string" && /^value_/.test(key)) {
            const area=$(`#${key}`);
            $(area).val(val);
        }
    })
    //console.log(repoInfos)
    Object.entries(repoInfos).forEach(([repoKey, repoInfo])=>{
        //const repoKey=kv[0];
        const repoArea=$(`.btnSave_change${repoKey}Repo`);
        Object.entries(repoInfo).forEach(([key, val])=>{
            //const key=kv2[0];
            //const val=kv2[1];
            const key_cap=key[0].slice(0,1).toUpperCase()+key[0].slice(1);
            $(`.inputChange${key_cap}`, repoArea).val(val[1]);
        })
    })
    await setDeckVersionTagList(true);
    // # button
    const area_deckVersionName=$("#area_for_buttonDeckVersionName");
    const buttons_deckVersionName={
        clear:$("<button>", {type:"button",class:"button_DeckVersion button_clear btn btn-primary"}).append("X"),
        load:$("<button>", {type:"button",class:"button_DeckVersion button_load btn btn-primary"}).append("Load"),
        copyRename:$("<button>", {type:"button",class:"button_DeckVersion button_copyRename btn btn-primary"}).append("Copy & Rename"),
        //copy:$("<button>", {type:"button",class:"button_DeckVersion button_copy btn btn-primary"}).append("Copy"),
        delete:$("<button>", {type:"button",class:"button_DeckVersion button_delete btn btn-primary"}).append("Delete"),
        test:$("<button>", {type:"button",class:"button_DeckVersion button_test btn btn-primary"}).append("Test"),
    }
    for (const [key, button] of  Object.entries(buttons_deckVersionName)){
        if (!IsLocalTest && key==="test") continue;
        $(area_deckVersionName).append(button);
    }

    const area_deckVersionAll=$("#area_for_buttonDeckVersionTagAll");
    const buttons_deckVersionAll={
        showHideAll:$("<button>", {type:"button",class:"button_DeckVersion button_toggleShowHide_deckVersion btn btn-secondary toShow"}).append("All SHOW/hide"),
        rename:$("<button>", {type:"button",class:"button_DeckVersion button_rename btn btn-secondary"}).append("Rename"),
        copy:$("<button>", {type:"button",class:"button_DeckVersion button_copy btn btn-secondary"}).append("Copy"),
        delete:$("<button>", {type:"button",class:"button_DeckVersion button_delete btn btn-secondary"}).append("Delete"),
    }
    for (const [key, button] of  Object.entries(buttons_deckVersionAll)){
        $(area_deckVersionAll).append(button);
    }

    // # addEventListener
    document.addEventListener("click", async function (e) {
        const settings=await getSyncStorage({settings:defaultString}).then(items=>Object.assign(defaultSettings, JSON.parse(items.settings)));
        const lang=settings.value_defaultLang;
        const df=await obtainDF(lang);
        if ($(e.target).is(".btnSearchDelete")) {
            const divCol = $(e.target).parent();
            divCol.remove();
        } else if ($(e.target).is(".btnSearchClear")) {
            const selectedValArea = $(".inputSearchVal", $(e.target).parent());
            selectedValArea.val("");
        } else if ($(e.target).is(".btnSave_changeRepo")) {
            const repoKey=$(e.target).attr("class").match(/(?<=btnSave_change)\S+(?=Repo)/)[0];
            const KVs=Array.from($("input", $(e.target).parent())).map(obj=>{
                const inputKey=$(obj).attr("class").replace(/inputChange/, "").toLowerCase();
                const inputVal=$(obj).val();
                console.log(inputKey, inputVal)
                return [[inputKey, inputVal]];
            });
            let repoInfos=await getSyncStorage({repoInfos:defaultRepoStrings}).then(items=>JSON.parse(items.repoInfos))
            repoInfos[repoKey]=Object.assign(...Array.from(KVs)
                .map(kv=>Object({[kv[0]]:kv[1]}) ));
            await setSyncStorage({repoInfos:JSON.stringify(repoInfos)});
        } else if ($(e.target).is(".btn_SearchDB")) {
            await searchFunc(df);
        } else if ($(e.target).is(".btnShowDB")) {
            console.log(df);
        } else if ($(e.target).is(".btnUpdateDB")) {
            const display = $(".displayUpdateDB", $(e.target).parent().parent());
            //const settings=await getSyncStorage({settings: defaultString}).then(items=>Object.assign(defaultSettings, JSON.parse(items.settings)));
            display.text("Updating now...\t");
            await updateDB({display, settings:settings});
            display.text("DB has been updated.");
            const modifiedDateString = new Date().toLocaleDateString();
            $(".CardDBSection").text(`Card DataBase: Last Update@${modifiedDateString}`);

        } else if ($(e.target).is(".btnSearchAdd")) {
            const DateNow = `${Date.now()}`;
            const span = $("<span>", { class: "spanSearchKV" });
            const searchKey = $("<select>", { type: "text", style: "width:80px;", class: "selectSearchKey" });
            const searchVal = $("<input>", { type: "text", placeholder: "a word or value", style: "width:200px;", class: "inputSearchVal", list: `selectSearchList_${DateNow}`});
            const datalist = $("<datalist>", { id: `selectSearchList_${DateNow}` });
            const clearButton = $("<button>", { type: "button", class: "btnSearchClear btn btn-primary" }).append("X");
            const deleteButton = $("<button>", { type: "button", class: "btnSearchDelete btn btn-primary" }).append("Delete");
            Object.keys(df).forEach(key => {
                const option = $("<option>").val(key).text(key);
                searchKey.append(option);
            })
            span.append(searchKey).append(searchVal).append(datalist);
            const divDB = $(".divSearchDB");
            const divCol = $("<div>", { class: "col-lg-10 col-lg-offset-2" })
            $(divDB).append(divCol.append("<br>").append(span).append(clearButton).append(deleteButton));

        } else if ($(e.target).is(".btnClearStorage")) {
            ;
            //await chrome.storage.local.getBytesInUse("df", items=>console.log(items));
            //console.log(await getSyncStorage({df:JSON.stringify({})}))
        } else if ($(e.target).is(".button_DeckVersion")){
            //console.log(e.target);
            const button_target=e.target;
            if ($(button_target).is(".button_clear")){
                $("#deck_version_name").val("");
                return;
            }
            const isForCheckedTags=$(e.target).is("#area_for_buttonDeckVersionTagAll *");
            const checked_tag_keys=Array.from($("#area_deckVersionImages input[type='checkbox']")).filter(d=>$(d).prop("checked")).map(d=>$(d).attr("tag_key"));
            const all_tag_keys=Array.from($("#area_deckVersionImages input[type='checkbox']")).map(d=>$(d).attr("tag_key"));
            const deck_name_new=$("#deck_version_name").val();
            const deck_name_tmp=$("#deck_version_name_loaded").text();
            const deck_name=deck_name_tmp.length===0 ? deck_name_new : deck_name_tmp;
            const data_deckVersion = await operateStorage({ data_deckVersion: JSON.stringify({}) }, "local", "get")
                .then(d => JSON.parse(d.data_deckVersion));
            console.log(deck_name, deck_name_new, button_target);
            if (Object.keys(data_deckVersion).indexOf(deck_name)===-1) return;
            const deckVersions=data_deckVersion[deck_name];
            const deck_version_area=$("#area_deckVersionImages");
            if (checked_tag_keys.length===0 && isForCheckedTags && !$(e.target).is(".button_toggleShowHide_deckVersion")) return;
            if ($(button_target).is(".button_load")) {
                if (Object.keys(data_deckVersion).indexOf(deck_name_new)===-1) return;
                const deckVersions_loaded=data_deckVersion[deck_name_new];
                load_deckVersionText(df, deckVersions_loaded, deck_name_new ,deck_version_area);
                return ;
            } else if ($(button_target).is(".button_copyRename") && !isForCheckedTags){
                console.log(deck_name_new)
                if (deck_name_new==="@@Auto" || deck_name_new.length===0) return;
                else if (Object.keys(data_deckVersion).indexOf(deck_name_new)!==-1) return;
                const data_deckVersion_new=Object.assign(data_deckVersion, {[deck_name_new]:deckVersions});
                // save
                console.log(240)
                await operateStorage({ data_deckVersion: JSON.stringify(data_deckVersion_new) }, "local", "set");
            } else if ($(button_target).is(".button_delete")){
                if (!isForCheckedTags && deck_name==="@@Auto") return;
                const data_deckVersion_new=Object.assign(...Object.entries(data_deckVersion).map(([key_deck_name,val_deck_versions])=>{
                    if (key_deck_name===deck_name) {
                        if (!isForCheckedTags) return null;
                        else return {[key_deck_name]:Object.assign(...Object.entries(val_deck_versions).map(([key_tag, val_version])=>{
                            if (checked_tag_keys.indexOf(key_tag)!==-1) return null;
                            else return {[key_tag]:val_version};
                        }).filter(d=>d!==null).concat([{}]) )}
                    } else return {[key_deck_name]:val_deck_versions};
                }).filter(d=>d!==null).concat([{}]));
                // save
                await operateStorage({ data_deckVersion: JSON.stringify(data_deckVersion_new) }, "local", "set");
            } else if (($(button_target).is(".button_copy") || $(button_target).is(".button_rename")) && isForCheckedTags){
                const toCopy=$(button_target).is(".button_copy");
                const toRename=$(button_target).is(".button_rename");
                const new_tag_names_dic=Object.assign(...checked_tag_keys.map(tag_key=>{
                    return {[tag_key]:$(`#area_deckVersionImages>.deck_version_text[tag_key='${tag_key}'] input.input_deck_version_tag_rename`).val()};
                }).concat([{}]));
                const data_deckVersion_new=Object.assign(...Object.entries(data_deckVersion).map(([key_deck_name,val_deck_versions])=>{
                    if (key_deck_name===deck_name) {
                        const versions_arr_tmp=Object.entries(val_deck_versions).map(([key_tag, val_version])=>{
                            const new_tag_name=new_tag_names_dic[key_tag];
                            if (checked_tag_keys.indexOf(key_tag)!==-1 && toRename && new_tag_name.length>0) {
                                return {[key_tag]:Object.assign(val_version, {tag:new_tag_name})};
                            } else if (checked_tag_keys.indexOf(key_tag)!==-1 && !toCopy ) return null;
                            else return {[key_tag]:val_version};
                        }).filter(d=>d!==null).concat([{}]) ;
                        const versions_arr_new=Object.entries(val_deck_versions).map(([key_tag, val_version])=>{
                            if (checked_tag_keys.indexOf(key_tag)!==-1 && toCopy) {
                                console.log(val_version)
                                const old_tag_name=val_version.tag;
                                const new_tag_name= "COPY_"+old_tag_name;
                                const new_tag_key= Date.now().toString(36);
                                const date=new Date().toLocaleDateString();
                                return {[new_tag_key]:Object.assign(val_version, {tag:new_tag_name, date:date})};
                            } else return null;
                        }).filter(d=>d!==null).concat([{}]);
                        return {[key_deck_name]:Object.assign(...versions_arr_tmp, ...versions_arr_new)};
                    } else return {[key_deck_name]:val_deck_versions};
                }).filter(d=>d!==null));
                // save
                await operateStorage({ data_deckVersion: JSON.stringify(data_deckVersion_new) }, "local", "set");
            } else if ($(e.target).is(".button_test")){
                const data_deckVersion = await operateStorage({ data_deckVersion: JSON.stringify({}) }, "local", "get")
                    .then(d => JSON.parse(d.data_deckVersion));
                const data_deckVersion_new=Object.assign(...Object.entries(data_deckVersion).map(([key_deck_name,val_deck_versions])=>{
                    if (/^l3/.test(key_deck_name)) {
                        if (true) return null;
                        else return {[key_deck_name]:Object.assign(...Object.entries(val_deck_versions).map(([key_tag, val_version])=>{
                            if (checked_tag_keys.indexOf(key_tag)!==-1) return null;
                            else return {[key_tag]:val_version};
                        }).filter(d=>d!==null) )}
                    } else return {[key_deck_name]:val_deck_versions};
                }).filter(d=>d!==null).concat([{}]));
                console.log(data_deckVersion_new)
                await operateStorage({ data_deckVersion: JSON.stringify(data_deckVersion_new) }, "local", "set");
            } else if ($(e.target).is(".button_toggleShowHide_deckVersion")){
                const button_target=e.target;
                if ($(e.target).is("#area_for_buttonDeckVersionTagAll *")){
                    $(button_target).toggleClass("toShow");
                    const toShow=!$(button_target).hasClass("toShow");
                    $(button_target).text("All "+(toShow ? "show/HIDE" : "SHOW/hide"));
                    all_tag_keys.map(tag_key=>{
                        showHide_deckVersion(tag_key, toShow);
                    })
                } else {
                    const tag_key=$(button_target).attr("tag_key");
                    showHide_deckVersion(tag_key);
                }
            }
            // re-read for tags or decks
            const data_deckVersion_new = await operateStorage({ data_deckVersion: JSON.stringify({}) }, "local", "get")
                .then(d => JSON.parse(d.data_deckVersion));
            const deck_name_valid= $(e.target).is(".button_copyRename") ? deck_name_new : deck_name;
            if (!$(e.target).is(".button_toggleShowHide_deckVersion")){
                if (data_deckVersion_new[deck_name_valid]!==undefined) {
                    load_deckVersionText(df, data_deckVersion_new[deck_name_valid], deck_name_valid, deck_version_area);
                } else {
                    $(deck_version_area).empty();
                    $("#area_for_buttonDeckVersionTagAll").css({display:"none"});
                    $("#deck_version_name").val("");
                }
                if ($(e.target).is("#area_for_buttonDeckVersionName *")){
                    await setDeckVersionTagList(true);
                }
            }
        }
    })
    // enter then search
    document.addEventListener("keydown", async function (e) {
        if ($(e.target).is("input.inputSearchVal") && e.key == "Enter") {
            const settings=await getSyncStorage({settings:defaultString}).then(items=>Object.assign(defaultSettings, JSON.parse(items.settings)));
            const lang=settings.value_defaultLang;
            const df=await obtainDF(lang);
            await searchFunc(df);
        }
    })
    document.addEventListener("change", async function (e) {
        //const df=await obtainDF();
        if ($(e.target).is(".selectSearchKey")) {
            const selectedKey = $(e.target).val();
            const selectedValArea = $(".inputSearchVal", $(e.target).parent());
            //const selectedVal=selectedValArea.val();
            const valList = $("datalist", $(e.target).parent());
            if (limitedKey.indexOf(selectedKey) != -1) {
                selectedValArea.prop({ type: "text" });
                valList.empty();
                const optionVals= (includeKey.indexOf(selectedKey)!=-1) ?
                [].concat(...df[selectedKey].map(d=>d.split(/,/g))) : df[selectedKey] ;

                Array.from(new Set(optionVals)).sort().forEach(optionVal => {
                    const option = $("<option>").val(optionVal).text(optionVal);
                    valList.append(option);
                })
            } else if (numberKey.indexOf(selectedKey) != -1) {
                selectedValArea.prop({ type: "number"});
                valList.empty();
            } else {
                selectedValArea.prop({ type: "text" });
                valList.empty();
            };
        } else if ($(e.target).is(".check_settings")){
            let settings=await getSyncStorage({settings:defaultString}).then(items=>JSON.parse(items.settings));
            const checkKey=$(e.target).attr("id").replace(/check_/, "");
            settings[checkKey]=$(e.target).prop("checked");
            await setSyncStorage({settings:JSON.stringify(settings)});
        } else if ($(e.target).is(".value_settings")){
            let settings=await getSyncStorage({settings:defaultString}).then(items=>JSON.parse(items.settings));
            const checkKey=$(e.target).attr("id");
            settings[checkKey]=$(e.target).val();
            await setSyncStorage({settings:JSON.stringify(settings)});
        }
    })
});

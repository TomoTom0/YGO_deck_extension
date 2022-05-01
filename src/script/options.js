"use strict";

// ----------------------------------
//            # initial

const defaultSettings = {
    autoUpdateDB: true,
    addDate: false,
    valid_feature_importExport: true,
    valid_feature_sortShuffle: true,
    valid_feature_deckHeader: true,
    default_visible_header:true
}; // , changeCDBRepo: false, showColor: true
const defaultString = JSON.stringify(defaultSettings);

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
    const df = (Date.now() - items2.lastModifiedDate < 3 * 86400 * 1000) ? JSON.parse(items2.df) :
        await updateDB({display:"", settings, repoInfos});

    $(".selectSearchKey").map((ind, obj) => {
        Object.keys(df).forEach(key => {
            const option = $("<option>").val(key).text(key);
            $(obj).append(option);
        })
        const modifiedDateString = (new Date(items2.lastModifiedDate)).toLocaleDateString();
        $(".CardDBSection").text(`Card DataBase: Last Update@${modifiedDateString}`);
        Object.entries(settings).map(kv=>{
            if (typeof(kv[1])=="boolean") {
                const checkArea=$(`#check_${kv[0]}`);
                if (checkArea.lenth>0) checkArea.prop({"checked":kv[1]});
            }
        })
        //console.log(repoInfos)
        Object.entries(repoInfos).forEach(kv=>{
            const repoKey=kv[0];
            const repoArea=$(`.btnSave_change${repoKey}Repo`);
    
            Object.entries(kv[1]).forEach(kv2=>{
                const key=kv2[0];
                const val=kv2[1];
                $(`.inputChange${key[0].slice(0,1).toUpperCase()+key[0].slice(1)}`, 
                repoArea).val(val[1]);
            })
        })

        // enter then search
        document.addEventListener("keydown", async function (e) {
            if ($(e.target).is("input.inputSearchVal") && e.key == "Enter") {
                await searchFunc();
            }
        })
    })
});

// # button
$(".btnUpdateDB").on("click", async function (e) {
    const display = $(".displayUpdateDB", $(e.target).parent().parent());
    const settings=await getSyncStorage({settings: defaultString}).then(items=>JSON.parse(items.settings));
    display.text("Updating now...\t");
    const df = await updateDB({display, settings:settings});
    display.text("DB has been updated.");
    const modifiedDateString = (new Date(Date.now())).toLocaleDateString();
    $(".CardDBSection").text(`Card DataBase: Last Update@${modifiedDateString}`);
})
$(".btnShowDB").on("click", async function () {
    const df=await obtainDF();
    console.log(df);
})
$("button.btnClearStorage").on("click", async function () {

    //await chrome.storage.local.clear();
    await chrome.storage.local.getBytesInUse("df", items=>console.log(items));
    console.log(await getSyncStorage({df:JSON.stringify({})}))

})

const limitedKey = ["race", "type", "attribute", "set", "LMarker", "cid", "ot"];
const numberKey = ["atk", "def", "scale", "level", "id"];
const includeKey=["type", "set"];

$(".btnSearchDB").on("click", async function (e) {
    await searchFunc();

})

const searchFunc = async ()=>{
    const df=await obtainDF();
    let searchKVs = [];
    $("span.spanSearchKV").map((ind, obj) => {
        const key = $(".selectSearchKey", $(obj)).val();
        const val = $(".inputSearchVal", $(obj)).val();
        if (val && numberKey.indexOf(key) != -1) searchKVs.push([key, val - 0]);
        else if (val) searchKVs.push([key, val]);
    });
    //console.log(searchKVs)
    const searcheResults = searchKVs.reduce((df_tmp, cur) => {
        const condition = ([...includeKey, "name"].indexOf(cur[0])!=-1) ? "in" : "=";
        const ids = df_filter(df_tmp, "id", cur, condition);
        return df_filter(df_tmp, Object.keys(df), ["id", ids])
    }, df)
    console.log(searcheResults);
    const searchResultArea=$("#searchResultArea");
    searchResultArea.empty();
    const table=makeTable(searcheResults, "Search Results");
    searchResultArea.append(table);
}

$(".btnSearchAdd").on("click", async function (e) {
    const df=await obtainDF();
    const DateNow = `${Date.now()}`;
    const span = $("<span>", { class: "spanSearchKV" });
    const searchKey = $("<select>", { type: "text", style: "width:80px;", class: "selectSearchKey" });
    const searchVal = $("<input>", { type: "text", placeholder: "a word or value", style: "width:200px;", class: "inputSearchVal", list: `selectSearchList_${DateNow}`});
    const datalist = $("<datalist>", { id: `selectSearchList_${DateNow}` });
    const clearButton = $("<button>", { type: "button", class: "btnSearchClear btn btn-primary" }).append("Clear");
    const deleteButton = $("<button>", { type: "button", class: "btnSearchDelete btn btn-primary" }).append("Delete");
    Object.keys(df).forEach(key => {
        const option = $("<option>").val(key).text(key);
        searchKey.append(option);
    })
    span.append(searchKey).append(searchVal).append(datalist);
    const divDB = $(".divSearchDB");
    const divCol = $("<div>", { class: "col-lg-10 col-lg-offset-2" })
    $(divDB).append(divCol.append("<br>").append(span).append(clearButton).append(deleteButton));
})

// # addEventListener
document.addEventListener("click", async function (e) {
    if ($(e.target).attr("class") && $(e.target).attr("class").indexOf("btnSearchDelete") != -1) {
        const divCol = $(e.target).parent();
        divCol.remove();
    }
    if ($(e.target).attr("class") && $(e.target).attr("class").indexOf("btnSearchClear") != -1) {
        const selectedValArea = $(".inputSearchVal", $(e.target).parent());
        selectedValArea.val("");
    }
    if ($(e.target).attr("class") && $(e.target).attr("class").indexOf("btnSave_changeRepo") != -1) {
        const repoKey=$(e.target).attr("class").match(/(?<=btnSave_change)\S+(?=Repo)/)[0];
        const KVs=$("input", $(e.target).parent()).map((ind, obj)=>{
            const inputKey=$(obj).attr("class").replace(/inputChange/, "").toLowerCase();
            const inputVal=$(obj).val();
            console.log(inputKey, inputVal)
            return [[inputKey, inputVal]];
        });
        let repoInfos=await getSyncStorage({repoInfos:defaultRepoStrings}).then(items=>JSON.parse(items.repoInfos))
        repoInfos[repoKey]=Object.assign(...Array.from(KVs)
            .map(kv=>Object({[kv[0]]:kv[1]}) ));
        await setSyncStorage({repoInfos:JSON.stringify(repoInfos)});
    }

})
document.addEventListener("change", async function (e) {
    const df=await obtainDF();
    if ($(e.target).attr("class") && $(e.target).attr("class").indexOf("selectSearchKey") != -1) {
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
    } else if ($(e.target).attr("class").indexOf("check_settings")!=-1){
        let settings=await getSyncStorage({settings:defaultString}).then(items=>JSON.parse(items.settings));
        const checkKey=$(e.target).attr("id").replace(/check_/, "");
        settings[checkKey]=$(e.target).prop("checked");
        await setSyncStorage({settings:JSON.stringify(settings)});
    }
})
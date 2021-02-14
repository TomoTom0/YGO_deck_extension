let GLOBAL_df = {};

const defaultSettings={autoUpdateDB:true, changeCDBRepo:false};
const defaultString=JSON.stringify(defaultSettings);

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

$(async function () {
    chrome.storage.local.get({ df: JSON.stringify({}), lastModifiedDate: 0, settings: defaultString}, async storage => {
        const df = JSON.parse(storage.df);
        if (Date.now() - storage.lastModifiedDate > 3 * 86400 * 1000) {
            GLOBAL_df = await updateDB();
        } else GLOBAL_df = df;
        $(".selectSearchKey").map((ind, obj) => {
            Object.keys(GLOBAL_df).forEach(key => {
                const option = $("<option>").val(key).text(key);
                $(obj).append(option);
            })
        })
        const modifiedDateString = (new Date(storage.lastModifiedDate)).toLocaleDateString();
        $(".CardDBSection").text(`Card DataBase: Last Update@${modifiedDateString}`);
        const settings=JSON.parse(storage.settings);
        console.log(settings)
        Object.entries(settings).map(kv=>{
            console.log(kv)
            const checkArea=$(`#check_${kv[0]}`);
            checkArea.prop({"checked":kv[1]});
        })
    })


    $(".btnUpdateDB").on("click", async function () {
        const display = $(".displayDB");
        display.text("Updating now...")
        GLOBAL_df = await updateDB();
        display.text("DB has been updated.");
    })
    $(".btnShowDB").on("click", async function () {
        console.log(df);
    })

    const limitedKey = ["race", "type", "attribute", "set", "LMarker"]
    const numberKey = ["atk", "def", "PS", "level", "id"]
    const includeKey=["type", "set"]

    $(".btnSearchDB").on("click", function (e) {
        let searchKVs = [];
        $("span.spanSearchKV").map((ind, obj) => {
            const key = $(".selectSearchKey", $(obj)).val();
            const val = $(".inputSearchVal", $(obj)).val();
            if (val && numberKey.indexOf(key) != -1) searchKVs.push([key, val - 0]);
            else if (val) searchKVs.push([key, val]);
        });
        console.log(searchKVs)
        const searcheResults = searchKVs.reduce((df_tmp, cur) => {
            const condition = ([...includeKey, "Eng"].indexOf(cur[0])!=-1) ? "in" : "=";
            const ids = df_filter(df_tmp, "id", cur, condition);
            return df_filter(df_tmp, Object.keys(GLOBAL_df), ["id", ids])
        }, GLOBAL_df)
        console.log(searcheResults);
        const searchResultArea=$(".searchResultArea");
        searchResultArea.empty();
        const table=makeTable(searcheResults, "Search Results");
        searchResultArea.append(table)

    })

    $(".btnSearchAdd").on("click", function (e) {
        const DateNow = Date.now();
        const span = $("<span>", { class: "spanSearchKV" });
        const searchKey = $("<select>", { type: "text", style: "width:80px;", class: "selectSearchKey" });
        const searchVal = $("<input>", { type: "number", placeholder: "search words", style: "width:200px;", class: "inputSearchVal", list: `selectSearchList_${DateNow}` });
        const datalist = $("<datalist>", { id: `selectSearchList_${DateNow}` });
        const clearButton = $("<button>", { type: "button", class: "btnSearchClear btn btn-primary" }).append("Clear");
        const deleteButton = $("<button>", { type: "button", class: "btnSearchDelete btn btn-primary" }).append("Delete");
        Object.keys(GLOBAL_df).forEach(key => {
            const option = $("<option>").val(key).text(key);
            searchKey.append(option);
        })
        span.append(searchKey).append(searchVal).append(datalist);
        const divDB = $(".divDB");
        const divCol = $("<div>", { class: "col-lg-10 col-lg-offset-2" })
        $(divDB).append(divCol.append("<br>").append(span).append(clearButton).append(deleteButton));
    })
    document.addEventListener("click", function (e) {
        if ($(e.target).attr("class") && $(e.target).attr("class").indexOf("btnSearchDelete") != -1) {
            const divCol = $(e.target).parent();
            divCol.remove();
        }
        if ($(e.target).attr("class") && $(e.target).attr("class").indexOf("btnSearchClear") != -1) {
            const selectedValArea = $(".inputSearchVal", $(e.target).parent());
            selectedValArea.val("");
        }

    })
    document.addEventListener("change", function (e) {
        if ($(e.target).attr("class") && $(e.target).attr("class").indexOf("selectSearchKey") != -1) {
            const selectedKey = $(e.target).val();
            const selectedValArea = $(".inputSearchVal", $(e.target).parent());
            //const selectedVal=selectedValArea.val();
            const valList = $("datalist", e.target.parent);
            if (limitedKey.indexOf(selectedKey) != -1) {
                selectedValArea.prop({ type: "text" });
                valList.empty();
                const optionVals= (includeKey.indexOf(selectedKey)!=-1) ?
                  [].concat(...GLOBAL_df[selectedKey].map(d=>d.split(/,/g))) : GLOBAL_df[selectedKey] ;

                  Array.from(new Set(optionVals)).sort().forEach(optionVal => {
                    const option = $("<option>").val(optionVal).text(optionVal);
                    valList.append(option);
                })
            } else if (numberKey.indexOf(selectedKey) != -1) {
                selectedValArea.prop({ type: "number" });
                valList.empty();
            } else {
                selectedValArea.prop({ type: "text" });
                valList.empty();
            };
        } else if ($(e.target).attr("class").indexOf("check_settings")!=-1){
            chrome.storage.local.get({settings:defaultString}, function(storage){
                let settings=JSON.parse(storage.settings);
                const checkKey=$(e.target).attr("id").replace(/check_/, "");
                settings[checkKey]=$(e.target).prop("checked");
                console.log(settings)
                chrome.storage.local.set({settings:JSON.stringify(settings)});
            })
        }
    })
});
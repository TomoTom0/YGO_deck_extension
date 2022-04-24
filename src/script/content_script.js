"use strict";

//--------------------------
//         # initial
const defaultSettings = { autoUpdateDB: true, addDate: false }; // , changeCDBRepo: false, showColor: true
const defaultString = JSON.stringify(defaultSettings);

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


// # deck recipe

const obtainRowResults = () => {
    const rows_num = $("#deck_text [id$='_list']").length;
    const row_names = [...Array(rows_num).keys()].map(row_ind => $(`#deck_text [id$='_list']:eq(${row_ind})`).attr("id")
        .match(/^\S*(?=_list)/)[0]);
    return Object.assign(...[...Array(rows_num).keys()].map(row_ind => {
        const row_name = row_names[row_ind]
        const card_length = $(`#deck_text [id$='_list']:eq(${row_ind}) td.card_name`).length;
        return {
            [row_name]: {
                names: [...Array(card_length).keys()]
                    .map(d => $(`#deck_text [id$='_list']:eq(${row_ind}) td.card_name:eq(${d})`).text().replaceAll(/^\s*|\s*$/g, "")),
                cids: [...Array(card_length).keys()]
                    .map(d => $(`#deck_text [id$='_list']:eq(${row_ind}) td.card_name:eq(${d})>input.link_value`)
                        .val().match(/(?<=cid=)\d+/)[0] - 0),
                nums: [...Array(card_length).keys()]
                    .map(d => $(`#deck_text [id$='_list']:eq(${row_ind}) td.num:eq(${d})`).text().match(/\d/)[0])
            }
        };
    }))
}

// from input mode
const obtainRowResults_Input = (df=undefined) => {
    const rows_num = $("#deck_text [id$='_list']").length;
    const row_names = [...Array(rows_num).keys()].map(row_ind => $(`#deck_text [id$='_list']:eq(${row_ind})`).attr("id")
        .match(/^\S*(?=_list)/)[0]);
    return Object.assign(...[...Array(rows_num).keys()].map(row_ind => {
        const row_name = row_names[row_ind];
        const row_short_name = row_name.slice(0, 2);
        //const card_length = $(`#deck_text [id$='_list']:eq(${row_ind}) td.card_name`).length;
        const card_length_max=$(`input[name='${row_short_name}nm']`).length;
        const result_tmp=[...Array(card_length_max).keys()].map(card_ind=>{
            const name_tmp=$(`#${row_short_name}nm_${card_ind+1}`).prop("value").replaceAll(/^\s*|\s*$/g, "");
            const num_tmp=parseInt($(`#${row_short_name}num_${card_ind+1}`).prop("value").replaceAll(/^\s*|\s*$/g, ""));
            if (name_tmp.length > 0 && Number.isInteger(num_tmp) && num_tmp > 0 && num_tmp < 4){
                return {name:name_tmp, num:num_tmp};
            } else return undefined;
        }).filter(d=>d!=undefined);
        return {
            [row_name]: {
                names: result_tmp.map(d=>d.name),
                nums: result_tmp.map(d=>d.num),
                cids: result_tmp.map(_=>undefined)
            }
        };
    }))
}

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

// ## sort cards

const _sortCards= (row_name, row_result, df)=>{
    const sort_cond_dic={
        "monster":{"level":-1, "atk":-1,"def":-1, "id":1, "cid":0},
        "spell":{"type":["Normal", "Quick-Play", "Continuous", "Equip", "Field"], "id":1, "cid":0},
        "trap":{"type":["Normal", "Continuous", "Counter"], "id":1, "cid":0},
        "extra":{"type":["Fusion", "Synchro", "XYZ", "Link"], "cid":0},
        "side":{"type":["Monster", "Spell", "Trap"], "cid":0}
    }
    const output_tmp = df_filter(df, Array.from(Object.keys(sort_cond_dic[row_name])), ["cid", row_result.cids]);
    //console.log(Object.keys(output_tmp).map(k=>({[k]:output_tmp[k][ind]})))
    //[]
    const output_arr = row_result.cids.map((cid, cid_ind)=>{
        const ind_tmp=output_tmp.cid.indexOf(cid);
        return Object.assign({cid:cid, name:row_result.names[cid_ind], num:row_result.nums[cid_ind]},
            ...Object.keys(output_tmp).map(k=>({[k]:output_tmp[k][ind_tmp]})))
    })
    if (["extra", "side"].indexOf(row_name)!=-1){
        const output_typed=sort_cond_dic[row_name].type.map(type_tmp=>{
            const output_filtered=output_arr.filter(d=>d.type.indexOf(type_tmp)!=-1);
            const output_res_tmp=Object.assign(...["cid", "name", "num"].map(k=>({[k+"s"]:output_filtered.map(d=>d[k])})));
            return _sortCards("monster", output_res_tmp, df);
        });
        return Object.assign(...["cid", "name", "num"].map(k=>({[k+"s"]:output_typed.map(d=>d[k+"s"]).flat()})));
    } else {
        const arr_sorted=output_arr.sort((a,b)=>{
            const diffs=(Object.keys(sort_cond_dic[row_name]).map(k=>{
                const sort_cond=sort_cond_dic[row_name][k];
                if (Number.isInteger(sort_cond)){
                    return [k, sort_cond*(parseInt(a[k])-parseInt(b[k]))];
                } else if (Array.isArray(sort_cond)){
                    const inds_for_sort=[a[k], b[k]].map(tmp_k=>sort_cond.map(d=>[tmp_k.indexOf(d), d]).filter(d=>d[0]!=-1).map(d=>sort_cond.indexOf(d[1])));
                    return [k, inds_for_sort[0] - inds_for_sort[1]];
                } else return [k, 1];
            }));
            //console.log(diffs, a,b )
            const diffs2=diffs.filter(d=> Number.isInteger(d[1]) && d[1]!=0);
            return diffs2[0][1];
        });
        return Object.assign(...["cid", "name", "num"].map(k=>({[k+"s"]:arr_sorted.map(d=>d[k])})));
    }
}

const sortCards = async (row_results)=>{
    const df=await obtainDF();
    const row_results_new=Object.assign(...Object.entries(row_results).map(d=>({[d[0]]:_sortCards(d[0], d[1], df)})));
    console.log(row_results_new);
    return row_results_new;
}

//---------------------------------
//         # export

async function exportAs(form = "id") {
    let exceptions = [];

    //const rows_num = $("#deck_text [id$='_list']").length;
    //const row_names = [...Array(rows_num).keys()].map(row_ind => $(`#deck_text [id$='_list']:eq(${row_ind})`).attr("id").match(/^\S*(?=_list)/)[0]);

    // const obtainRowResults

    const row_results = obtainRowResults();
    console.log(row_results);

    const df = await obtainDF();
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
            if (form == "Jap") output_comp = `${name_tmp}`;
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
                output_comp = `${name_Jap}\t${row_name}`;
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
    const deck_name = $("#broad_title>div>h1").html().match(/(?<=\s*).*(?=<br>)/)[0].replace(/^\s*/, "").replace(/\s/, "_"); // after 2022/4/18
    a.download = deck_name + ".ydk";
    a.href = url;
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    if (exceptions.length > 0 && form == "id") {
        const error_message = "一部のカードが変換できませんでした。\t" + exceptions.join(", ");
        console.log(error_message);
        alert(error_message);
    }
}

//--------------------------
//         # import

async function importFromYdk() {
    const import_file = $("#button_importFromYdk_input").prop("files")[0];
    const data_tmp = await import_file.text();
    const data_array = split_data(data_tmp);
    const imported_ids = obtain_deck_splited(data_array);

    const row_names = ["monster", "spell", "trap", "extra", "side"];
    let row_results = Object.assign(...row_names.map(row_name => ({ [row_name]: { names: [], nums: [], cids: [] } })));
    const df = await obtainDF();
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
    for (const [ind_import, ids] of Object.entries(imported_ids)) {
        for (const id_tmp of Array.from(new Set(ids)).filter(d => d.length > 0)) {
            const id = (isFinite(id_tmp)) ? id_tmp - 0 : id_tmp;
            let name_tmp = "";
            let types_tmp = "";
            // empty
            if (!/^\d+$/.test(id) && !id) name_tmp = "";
            // id
            else if (/^\d+$/.test(id) && id) {
                name_tmp = df_filter(df, "name", ["id", id])[0];
            }
            // Jap or Eng name
            else if (!/^\d+$/.test(id) && id) {
                name_tmp = id.split("\t")[0];
                types_tmp = id.split("\t")[1];
            }
            //console.log(id,id_tmp, name_tmp, ids.map(d => d.split("\t")[0]).filter(d => d == id), ids.map(d => d.split("\t")[0]).filter(d => d == id_tmp));

            const num_tmp = ids.map(d => d.split("\t")[0]).filter(d => d == id).length;
            if (!name_tmp) exceptions.push(`${id} ${name_tmp}`);
            else {
                let row_ind = 0;
                let row_name = "";
                if (ind_import == 0) {
                    if (types_tmp == "") types_tmp = df_filter(df, "type", ["id", id])[0];
                    try {
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
                row_results[row_name].names.push(name_tmp);
                row_results[row_name].nums.push(num_tmp);
                row_results[row_name].cids.push(undefined);
            }
        }
    }
    // deck_name
    const settings_tmp = await getSyncStorage({ settings: defaultString }).then(items => JSON.parse(items.settings));
    const deck_name = import_file.name.replace(/(?<=^[^(@@)]+)@@.*\.ydk$|\.ydk$/, "") + (settings_tmp.addDate ? "@@" + new Date().toLocaleDateString() : "");
    // input deck name
    $("#dnm").val(deck_name);

    const main_total_num = importDeck(row_results);
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
}

// # sort
async function sortWindow(){
    const url_now=location.href;
    const html_parse_keys=["cgid","dno","request_locale"];
    const html_parse_dic=Object.assign(...html_parse_keys.map(key=>{
        const match_tmp=url_now.match(new RegExp(`(?<=${key}=)([^&=]+)`, "g"));
        if (Array.isArray(match_tmp) && match_tmp.length > 0){
            return {[key]:match_tmp[0]};
        } else return undefined;
    }).filter(d=>d!=undefined));
    //console.log(html_parse_dic);
    if (["cgid", "dno"].some(d=>Object.keys(html_parse_dic).indexOf(d)==-1) ){
        return;
    }
    const url_ope2="https://www.db.yugioh-card.com/yugiohdb/member_deck.action?ope=2&"+
        Object.entries(html_parse_dic).map(d=>d[0]+"="+d[1]).join("&");
    const row_results = obtainRowResults();
    const row_results_new=await sortCards(row_results);
    const postMsg="trigger_sortCard_"+JSON.stringify(row_results_new);
    //console.log(row_results_new);
    //console.log(postMsg);
    const win = window.open(url_ope2, "sortCard", "width=500,toolbar=yes,menubar=yes,scrollbars=yes");
    win.addEventListener("load", () => {
        setTimeout(()=>{
            win.postMessage(postMsg, "*");
        }, 500);
    }, false);
}


//------------------------------------
//         #  on loading

$(async function () {
    const url_now = location.href;
    if (url_now.indexOf("ope=2&") != -1) {
        //const area = $("#header_box .save"); // before// 2022/4/18
        const area = $("#bottom_btn_set"); // after 2022/4/18

        const label = $("<label>", { for: "button_importFromYdk_input" });
        const button = $("<a>", { class: "btn hex red", type: "button", id: "button_importFromYdk", style: "position: relative;user-select: none;" })
            .append("<span>インポート</span>");
        const input_button = $("<input>", { type: "file", accpet: "text/*.ydk", style: "display: none;", id: "button_importFromYdk_input" });
        button.append(input_button);
        label.append(button);
        area.append(label);
    }
    else if (/ope=1&|deck\.action\?cgid/.test(url_now)) {
        //const settings=await getSyncStorage({settings: defaultString}).then(items=>JSON.parse(items.settings));
        //const edit_area = $("#header_box #button_place_edit"); // before 2022/4/18
        const edit_area = $("#bottom_btn_set"); // after 2022/4/18
        const area = (edit_area.length > 0) ? edit_area : $("<span>", { id: "bottom_btn_set" }).appendTo($("#deck_header"));
        //console.log(area)
        const buttons = [$("<a>", { class: "btn hex red button_export id" })
                .append("<span>エクスポート(id)</span>"),
            $("<a>", { class: "btn hex red button_export Jap" })
                .append("<span>エクスポート(日本語)</span>"), // , style: "position: relative;user-select: none;"
            $("<a>", { class: "btn hex red button_sort", id:"button_sort"})
                .append("<span>ソート</span>") // , style: "position: relative;user-select: none;"
        ]
        for (const button_tmp of buttons){
            $(area).append(button_tmp);
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

    // ## button clicked
    document.addEventListener("click", async function (e) {
        if ($(e.target).is("a.button_export, a.button_export *")) {
            const form = ["id", "Jap"].filter(d => $(e.target).is(`.${d}, .${d} *`))[0];
            console.log(`export deck as ${form}`)
            await exportAs(form);
        }
    })
    $("#button_importFromYdk").on("change", async function () {
        await importFromYdk();
    })
    $("#button_sort").on("click", async function () {
        await sortWindow();
    })
    // ## trigger
    window.addEventListener("message", async function (e) {
        const content = e.data;
        if (!/^trigger_/.test(content)) return;
        if (/_sortCard/.test(content)) {
            const json_dumped=content.replace("trigger_sortCard_", "");
            const row_results_new=JSON.parse(json_dumped);
            //const row_results_new=await sortCards(row_results);
            console.log(row_results_new);
            const row_names = ["monster", "spell", "trap", "extra", "side"];
            const row_str_new=JSON.stringify(row_names
                .map(row_name=>({[row_name]:{names:row_results_new[row_name].names, nums:row_results_new[row_name].nums.map(d=>parseInt(d))}})))
            const checkInputted=setInterval(()=>{
                importDeck(row_results_new);
                const row_results=obtainRowResults_Input();
                const row_str=JSON.stringify(row_names
                    .map(row_name=>({[row_name]:{names:row_results[row_name].names, nums:row_results[row_name].nums}})))
                if (row_str == row_str_new){
                    clearInterval(checkInputted);
                    console.log("Sorted. Please save and close.");
                    /*document.addEventListener("click", async function (e) {
                        if ($(e.target).is("#btn_regist")) {
                            window.close();
                        }
                    })*/
                }
            }, 500);
        }
    })
});
"use strict";

//--------------------------
//         # initial
//const db_path = "data/ygo_db_simple.tsv";
//const fromConstant_path = "data/fromConstant.tsv";
//let GLOBAL_df = {};
const defaultSettings = { autoUpdateDB: true, addDate: false }; // , changeCDBRepo: false, showColor: true
const defaultString = JSON.stringify(defaultSettings);

// ----------------------------------
//       # parse text funtions

/*function CSV2Dic(csv_data){
    const escape_sets=[{escaped:',',original: ",", re:"__COMMA__"}, {escaped:'""', original:'"', re:"__WQ__"}];
    csv_data=csv_data.map(csv_line=>{
        if (/^"|,"|""/.test(csv_line)){
            const line_splited_tmp=csv_line.replace(/",|,"/g, "__SEPARATED__").split("__SEPARATED__");
            if (line_splited_tmp.length%2!=1) console.log(csv_line);
            return line_splited_tmp.map((d,ind)=>{
                if (ind%2==0 && !/^"/.test(d)) return d;
                else return escape_sets.reduce((acc,ES)=> acc.split(ES.escaped).join(ES.re), d);
            }).join(",").split(",")
            .map(d=>escape_sets.reduce((acc,ES)=>acc.split(ES.re).join(ES.original), d))
            .filter(d=>d!="");
        }
        else return csv_line.split(",");
    })

    const headers=csv_data[0];
    let data_array=new Array(headers.length).fill().map(_=>[]);
    for(csv_row of csv_data.slice(1)){
        if (csv_row.length!=headers.length) {continue;}
        csv_row.forEach((d, ind)=>{
            data_array[ind].push(d);
        });
    }
    let result_data={};
    headers.forEach((d, ind) =>result_data[d]=data_array[ind]);
    return result_data;
}*/

function TSV2Dic(tsv_data) {
    tsv_line = tsv_data.map(d => d.split("\t"));

    const headers = tsv_line[0];
    let data_array = new Array(headers.length).fill().map(_ => []);
    for (tsv_row of tsv_line.slice(1)) {
        if (tsv_row.length != headers.length) { continue; }
        tsv_row.forEach((d, ind) => {
            if (/^".*"$/.test(d)) {
                d = d.slice(1, -1).replace(/""/g, '"');
            }
            data_array[ind].push(d);
        });
    }
    let result_data = {};
    headers.forEach((d, ind) => result_data[d] = data_array[ind]);
    return result_data;
}

function split_data(data) {
    const split_sep = "__SPLIT__";
    return data.replace(/\r\n|\r|\n/g, split_sep).split(split_sep);
}

function obtain_deck_splited(data_array) {
    const indexes = ["#main", "#extra", "!side"].map(d => data_array.indexOf(d))
        .concat([data_array.length]);
    return [0, 1, 2].map(d => data_array.slice(indexes[d] + 1, indexes[d + 1]));
};

// ## check valid

/*const obtainValidCids = async (lang = "en") => {
    const url_now = location.href;
    const url_Eng = url_now.replace(/&request_locale=\S\S/g, "") + `&request_locale=${lang}`;
    const res_Eng = await fetch(url_Eng).then(d => d.body)
        .then(d => d.getReader()).then(reader => reader.read());
    const content = new TextDecoder("utf-8").decode(res_Eng.value);
    return $(`#deck_text [id$='_list']`, content).map((_, row) => {
        return $(`input.link_value`, $(row)).map((ind, obj) => {
            const cid = $(obj).val().match(/(?<=cid=)\d+/);
            return cid ? cid[0] : "";
        }).toArray();
    }).toArray();
}

async function showValidCards(IsColored = true) {
    const validCids = await obtainValidCids().then(d => d.flat());
    $(`#deck_text [id$='_list']`).each((_, row) => {
        $(`input.link_value`, $(row)).each((ind, obj) => {
            const cid = $(obj).val().match(/(?<=cid=)\d+/);
            if (cid && validCids.indexOf(cid[0]) == -1) {
                const parent = $(obj).parents("tr.row");
                $("td div.num", parent).css({ background: IsColored ? "rgba(255,0,0,.3)" : "white" });
            }
        });
    });
    $(`#deck_image table.image_table`).each((_, row) => {
        $(`tbody tr td>a`, $(row)).each((ind, obj) => {
            const cid = $(obj).prop("href").match(/(?<=cid=)\d+/);
            if (cid && validCids.indexOf(cid[0]) == -1) {
                $(obj).parents("td").css({ background: IsColored ? "red" : "transparent" }) // linear-gradient(135deg, red 20%, 20%, transparent)
                $("span img", $(obj)).css({ opacity: IsColored ? 0.8 : 1 });
            }
        });
    });
    $(`#deck_detailtext table`).each((_, row) => {
        $(`input.link_value`, $(row)).each((ind, obj) => {
            const cid = $(obj).val().match(/(?<=cid=)\d+/);
            if (cid && validCids.indexOf(cid[0]) == -1) {
                const parent = $(obj).parents("tr.row");
                $("td.NofS div.num", parent).css({ background: IsColored ? "rgba(255,0,0,.3)" : "white" });
            }
        });
    });
}*/

//---------------------------------
//         # export

async function exportAs(form = "id") {
    let exceptions = [];

    const rows_num = $("#deck_text [id$='_list']").length;
    const row_names = [...Array(rows_num).keys()].map(row_ind => $(`#deck_text [id$='_list']:eq(${row_ind})`).attr("id")
        .match(/^\S*(?=_list)/)[0]);

    const obtainRowResults =  async () => {
        return [...Array(rows_num).keys()].map(row_ind => {
            const card_length = $(`#deck_text [id$='_list']:eq(${row_ind}) .card_name`).length;
            return {
                names: [...Array(card_length).keys()]
                    .map(d => $(`#deck_text [id$='_list']:eq(${row_ind}) .card_name:eq(${d})`).text()),
                cids : [...Array(card_length).keys()]
                    .map(d => $(`#deck_text [id$='_list']:eq(${row_ind}) .card_name:eq(${d})`)
                    .parent("td").children("input.link_value").val().match(/(?<=cid=)\d+/)[0]-0),
                nums: [...Array(card_length).keys()]
                    .map(d => $(`#deck_text [id$='_list']:eq(${row_ind}) .num:eq(${d})`).text().match(/\d/)[0])
            };
        })
    }

/*  const obtainRowResults_old = {
        Jap: async () => {
            return [...Array(rows_num).keys()].map(row_ind => {
                const card_length = $(`#deck_text [id$='_list']:eq(${row_ind}) .card_name`).length;
                return {
                    names: [...Array(card_length).keys()]
                        .map(d => $(`#deck_text [id$='_list']:eq(${row_ind}) .card_name:eq(${d})`).text()),
                    cids : [...Array(card_length).keys()]
                        .map(d => $(`#deck_text [id$='_list']:eq(${row_ind}) .card_name:eq(${d})`)
                        .parent("td").children("input.link_value").val().match(/(?<=cid=)\d+/)),
                    nums: [...Array(card_length).keys()]
                        .map(d => $(`#deck_text [id$='_list']:eq(${row_ind}) .num:eq(${d})`).text().match(/\d/)[0])
                };
            })
        },
        id: async () => {
            const cids = {
                en: Array.from(new Set(await obtainValidCids("en")))
            };
            // ja:Array.from(new Set(await obtainValidCids("ja")))
            const url_now = location.href;
            const original_lang = (url_now.match(/(?<=&request_locale=)\S\S/) || ["ja"])[0];
            const urlAttr = url_now.match(/(?<=\/)[^\/]*$/)[0]
            const urlAttrNew = urlAttr.replace(`&request_locale=${original_lang}`, "") + `&request_locale=${original_lang}`;
            history.replaceState("", "", urlAttrNew)
            const url_Eng = url_now.replace(/&request_locale=\S\S/g, "") + "&request_locale=en";
            const res_Eng = await fetch(url_Eng).then(d => d.body)
                .then(d => d.getReader()).then(reader => reader.read());
            const content = new TextDecoder("utf-8").decode(res_Eng.value);
            return [...Array(rows_num).keys()].map(row_ind => {
                const card_length = $(`#deck_text [id$='_list']:eq(${row_ind}) .card_name`).length;
                let count = 0;
                return [...Array(card_length).keys()]
                    .reduce((acc, d) => {
                        const cid_tmp = $(`#deck_text [id$='_list']:eq(${row_ind}) .card_name:eq(${d})`)
                            .parent("td").children("input.link_value").val().match(/(?<=cid=)\d+/);
                        const IsValid = cids.en.flat().indexOf(cid_tmp[0]) != -1;
                        const wrapper = IsValid ? content : $("body");
                        const ind_tmp = IsValid ? count++ : d;
                        const table = $(`#deck_text [id$='_list']:eq(${row_ind})`, wrapper)
                        const name_tmp = $(`.card_name:eq(${ind_tmp})`, table).text().replace(/\s*\(Updated from:.*$/, "");
                        const num_tmp = $(`.num:eq(${ind_tmp})`, table).text().match(/\d/);
                        if (!num_tmp) {
                            exceptions.push(name_tmp);
                            return acc;
                        }
                        acc.names.push(name_tmp);
                        acc.nums.push(num_tmp[0]);

                        return acc;
                    }, { names: [], nums: [] })
            })
        }
    }*/
    const row_results = await obtainRowResults();
    console.log(row_results)

    const df = await obtainDF();
    const keys = ["#main", "#extra", "!side"];
    let result_outputs = keys.map(_ => []);
    let result_exception_counts = keys.map(_ => 0);
    for (const [row_ind, row_result] of Object.entries(row_results)) {
        const out_ind = (row_ind < 3) ? 0 : row_ind - 2;
        for (const [ind, name_tmp] of Object.entries(row_result.names)) {
            const cid_tmp= row_result.cids[ind];
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
                output_comp = `${name_Jap}\t${row_names[row_ind]}`;
                result_exception_counts[row_ind]++;
            }
            result_outputs[out_ind].push(...Array(row_result.nums[ind] - 0).fill(output_comp))
        }
    }
    const content = result_outputs.map((id, ind) => keys[ind] + "\n" + id.join("\n")).join("\n");

    const convert_results_message = ["main", "extra", "side"].map((d, row_ind) =>
        `${d}: ${result_outputs[row_ind].length - result_exception_counts[row_ind]}/${result_outputs[row_ind].length}`)
        .join("\n")
    console.log(convert_results_message);

    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const deck_name = $("#wrapper article:eq(0) header h1").html().match(/(?<=\s*).*(?=<br>)/)[0].replace(/^\s*/, "").replace(/\s/, "_");
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
    let row_results = Array(5).fill({}).map(_ => ({ names: [], nums: [] }));
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
                let row_index = parseInt(ind_import) + 2;
                if (ind_import == 0) {
                    if (types_tmp == "") types_tmp = df_filter(df, "type", ["id", id])[0];
                    try {
                        const main_row = ["monster", "spell", "trap"].map(d => d.slice(0, 1).toUpperCase() + d.slice(1));
                        const row_type = main_row.filter(d => types_tmp.split(",").some(dd => dd == d))[0];
                        row_index = row_names.indexOf(row_type.toLowerCase());
                    } catch {
                        exceptions.push(`${id} ${name_tmp}`);
                        continue;
                    }
                }
                row_results[row_index].names.push(name_tmp);
                row_results[row_index].nums.push(num_tmp);
            }
        }
    }
    // deck_name
    const settings_tmp = await getSyncStorage({ settings: defaultString }).then(items => JSON.parse(items.settings));
    const deck_name = import_file.name.replace(/(?<=^[^(@@)]+)@@.*\.ydk$|\.ydk$/, "") + (settings_tmp.addDate ? "@@" + new Date().toLocaleDateString() : "");
    $("#dnm").val(deck_name);

    for (const tab_ind of [...Array(5).keys()]) {
        const row_name = row_names[tab_ind];
        const row_short_name = row_name.slice(0, 2);
        // reset
        [...Array(60).keys()].forEach(ind2 => {
            $(`#${row_name}_list #${row_short_name}nm_${ind2 + 1}`).val("");
            $(`#${row_name}_list #${row_short_name}num_${ind2 + 1}`).val("");
        })
        console.log(row_name, row_results[tab_ind]);
        if (row_results[tab_ind].names.length == 0) continue;
        const card_names = row_results[tab_ind].names;
        const card_nums = row_results[tab_ind].nums;
        //input name and number
        card_names.forEach((name, ind2) => {
            $(`#${row_name}_list #${row_short_name}nm_${ind2 + 1}`).val(name);
            $(`#${row_name}_list #${row_short_name}num_${ind2 + 1}`).val(card_nums[ind2]);
        })
        //input count
        const sum_num = card_nums.reduce((acc, cur) => acc + cur, 0);
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

    const message_forImportedData = `main: ${main_total_num}\n` + row_results.map((row, ind) => `${row_names[ind]}: ${row.names.length}`).join("\n");
    if (exceptions.length > 0 && !exceptions.every(d => /^\s*$/.test(d))) {
        const error_message = "一部のカードが変換できませんでした。\n" + exceptions.join(", ");
        console.log(error_message);
        alert(error_message + "\n" + message_forImportedData);
    } else {
        console.log(message_forImportedData);
        alert(message_forImportedData);
    }
}

//------------------------------------
//         #  on loading

$(async function () {
    const url_now = location.href;
    if (url_now.indexOf("ope=2&") != -1) {
        const area = $("#header_box .save");
        const label = $("<label>", { for: "button_importFromYdk_input" });
        const button = $("<a>", { class: "black_btn red", type: "button", id: "button_importFromYdk", style: "position: relative;user-select: none;" })
            .append("<b>インポート</b>");
        const input_button = $("<input>", { type: "file", accpet: "text/*.ydk", style: "display: none;", id: "button_importFromYdk_input" });
        button.append(input_button);
        label.append(button);
        area.append(label);
    }
    else if (/ope=1&|deck\.action\?cgid/.test(url_now)) {
        //const settings=await getSyncStorage({settings: defaultString}).then(items=>JSON.parse(items.settings));
        //const IsColored=settings.showColor;
        const edit_area = $("#header_box #button_place_edit");
        const area = (edit_area.length > 0) ? edit_area : $("<span>", { id: "button_place_edit" }).appendTo($("#header_box"));
        //console.log(area)
        const button = $("<a>", { class: "black_btn red button_export id", style: "position: relative;user-select: none;" })
            .append("<b>エクスポート(id)</b>");
        const button2 = $("<a>", { class: "black_btn red button_export Jap", style: "position: relative;user-select: none;" })
            .append("<b>エクスポート(日本語)</b>");
        $(area).append(button2);
        $(area).append(button);
        /*const btn_color = $("<a>", { class: `black_btn red btn_color ` + (IsColored ? "show" : ""), id: "button_color", style: "position: relative;" })
            .append(`<b>色を表示${IsColored ? "しない" : "する"}</b>`);
        const reg_area=$("form.sort_set");
        reg_area.prepend(btn_color);
        await showValidCards(IsColored);*/
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
    /*$("#button_color").on("click", async function (e) {
        let settings=await getSyncStorage({settings: defaultString}).then(items=>JSON.parse(items.settings));
        settings.showColor=!settings.showColor;
        $(e.target).html(`<b>色を表示${settings.showColor ? "しない" : "する"}</b>`);
        $(e.target).toggleClass("show");
        await showValidCards(settings.showColor);
        await setSyncStorage({settings: JSON.stringify(settings)});
    })*/
});
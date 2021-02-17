﻿//----------------------
//const db_path = "data/ygo_db_simple.tsv";
//const fromConstant_path = "data/fromConstant.tsv";
let GLOBAL_df = {};
const defaultSettings = { autoUpdateDB: true, changeCDBRepo: false };
const defaultString = JSON.stringify(defaultSettings);
let GLOBAL_settings = defaultSettings;

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

async function exportAs(form = "id") {
    const rows_num = $("#deck_text [id$='_list']").length;
    const row_names = [...Array(rows_num).keys()].map(row_ind => $(`#deck_text [id$='_list']:eq(${row_ind})`).attr("id")
        .match(/^\S*(?=_list)/)[0]);

    let row_results_tmp = { Jap: [], Eng: [] };
    row_results_tmp.Jap = [...Array(rows_num).keys()].map(row_ind => {
        const card_length = $(`#deck_text [id$='_list']:eq(${row_ind}) .card_name`).length;
        return {
            names: [...Array(card_length).keys()]
                .map(d => $(`#deck_text [id$='_list']:eq(${row_ind}) .card_name:eq(${d})`).text()),
            nums: [...Array(card_length).keys()]
                .map(d => $(`#deck_text [id$='_list']:eq(${row_ind}) .num:eq(${d})`).text().match(/\d/)[0])
        };
    })
    if (form == "id") {
        const url_Eng = location.href.replace(/&request_locale=\S\S/g, "") + "&request_locale=en";
        const res_Eng = await fetch(url_Eng).then(d => d.body)
            .then(d => d.getReader()).then(reader => reader.read());
        const content = new TextDecoder("utf-8").decode(res_Eng.value);
        row_results_tmp.Eng = [...Array(rows_num).keys()].map(row_ind => {
            const card_length = $(`#deck_text [id$='_list']:eq(${row_ind}) .card_name`, content).length;
            return {
                names: [...Array(card_length).keys()]
                    .map(d => $(`#deck_text [id$='_list']:eq(${row_ind}) .card_name:eq(${d})`, content).text()),
                nums: [...Array(card_length).keys()]
                    .map(d => $(`#deck_text [id$='_list']:eq(${row_ind}) .num:eq(${d})`, content).text().match(/\d/)[0])
            };
        })
    }
    const row_results = (form == "Jap") ? row_results_tmp.Jap : row_results_tmp.Eng;

    const df = GLOBAL_df;
    const keys = ["#main", "#extra", "!side"];
    let exceptions = [];
    let result_outputs = keys.map(_ => []);
    row_results.forEach((row_result, row_ind) => {
        let out_ind = row_ind - 2
        if (row_ind < 3) out_ind = 0;
        row_result.names.forEach((d, ind) => {
            let output_comp = "";
            if (form == "Jap") output_comp = `${d}`;
            else if (form == "id") {
                output_comp = df_filter(df, "id", ["name", d])[0];
                if (!output_comp) {
                    const name_Jap = row_results_tmp.Jap[row_ind].names[ind];
                    exceptions.push(name_Jap);
                    // form=id and db has error => Japanese name and type wil be outputed with tab-separation
                    output_comp = `${name_Jap}\t${row_names[row_ind]}`;
                };
            }
            result_outputs[out_ind].push(...Array(row_result.nums[ind]).fill(output_comp))
        })
    })
    const content = result_outputs.map((id, ind) => keys[ind] + "\n" + id.join("\n")).join("\n");

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

function split_data(data) {
    const split_sep = "__SPLIT__";
    return data.replace(/\r\n|\r|\n/g, split_sep).split(split_sep);
}

function obtain_deck_splited(data_array) {
    const indexes = ["#main", "#extra", "!side"].map(d => data_array.indexOf(d))
        .concat([data_array.length]);
    return [0, 1, 2].map(d => data_array.slice(indexes[d] + 1, indexes[d + 1]));
};

async function importFromYdk() {
    const import_file = $("#button_importFromYdk_input").prop("files")[0];
    const data_tmp = await import_file.text();
    const data_array = split_data(data_tmp);
    const imported_ids = obtain_deck_splited(data_array);

    const row_names = ["monster", "spell", "trap", "extra", "side"];
    const row_results = Array(5).fill({}).map(_ => { return { "names": [], "nums": [] } });
    const df = GLOBAL_df;
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
    imported_ids.forEach((ids, ind) => {
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
                let row_index = ind + 2;
                if (ind == 0) {
                    if (types_tmp == "") types_tmp = df_filter(df, "type", ["id", id])[0];
                    try {
                        const main_row = ["monster", "spell", "trap"].map(d => d.toUpperCase());
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
    }) // deck_name
    $("#dnm").val(import_file.name.replace(/\.ydk$/, ""));

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

    if (exceptions.length > 0 && !exceptions.every(d => /^\s*$/.test(d))) {
        const error_message = "一部のカードが変換できませんでした。\n" + exceptions.join(", ");
        console.log(error_message);
        alert(error_message);
    }
}


// on page load
$(async function () {
    const url_now = location.href;
    if (url_now.indexOf("ope=2&") != -1) {
        const area = $("#header_box .save");
        const label = $("<label>", { for: "button_importFromYdk_input" });
        const button = $("<a>", { class: "black_btn red", type: "button", id: "button_importFromYdk", style: "position: relative;" })
            .append("<b>インポート</b>");
        const input_button = $("<input>", { type: "file", accpet: "text/*.ydk", style: "display: none;", id: "button_importFromYdk_input" });
        button.append(input_button);
        label.append(button);
        area.append(label);
    }
    else if (/ope=1&|deck\.action\?cgid/.test(url_now)) {
        const area = $("#header_box #button_place_edit");
        const button = $("<a>", { class: "black_btn red", id: "button_exportAsYdk", style: "position: relative;" })
            .append("<b>エクスポート(id)</b>");
        const button2 = $("<a>", { class: "black_btn red", id: "button_exportAsJap", style: "position: relative;" })
            .append("<b>エクスポート(日本語)</b>");
        area.append(button2);
        area.append(button);
    }

    chrome.storage.local.get({ df: JSON.stringify({}), lastModifiedDate: 0, settings: defaultString }, async storage => {
        const df = JSON.parse(storage.df);
        const settings = JSON.parse(storage.settings);
        if (settings.autoUpdateDB && (Date.now() - storage.lastModifiedDate > 3 * 86400 * 1000)) {
            GLOBAL_df = await updateDB({ display: "", settings: GLOBAL_settings });
        } else GLOBAL_df = df;
    })

    $("#button_exportAsYdk").on("click", async function () {
        await exportAs("id");
    })
    $("#button_exportAsJap").on("click", async function () {
        await exportAs("Jap");
    })
    $("#button_importFromYdk").on("change", async function () {
        await importFromYdk();
    })
});
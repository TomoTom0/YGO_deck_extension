//----------------------
const db_path="data/ygo_db_simple.csv";
let GLOBAL_df;


function CSV2Dic(csv_data){
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
}

function df_filter(df, col_out, array_in){
    const key=array_in[0];
    const val=array_in[1];
    const indexes_in=df[key].map((d,ind)=>{
        if (d==val) return ind;
        else return false;
    }).filter(d=>d!=false);

    return Array.from(new Set(indexes_in)).map(d=>df[col_out][d]);
}
function exportAsYdk(){
    const tables=$(".image_table");
    if (tables==null) return -1;
    const keys=["#main", "#extra", "!side"];
    let card_names=[];
    for (tab_ind=0;tab_ind<tables.length;tab_ind++){
        const card_length=$(`#deck_image .image_table:eq(${tab_ind}) img`).length;
        card_names[tab_ind]=[...Array(card_length).keys()].map(d=>
            $(`#deck_image .image_table:eq(${tab_ind}) img:eq(${d})`).attr("title"));
    }
    const df=GLOBAL_df;
    let exceptions=[];
    const card_ids=card_names.map(d=>d.map(dd=>{
        const trans_id=df_filter(df, "id", ["Jap", dd])[0]
        if (!trans_id) exceptions.push(dd);
        return trans_id;
    }));
    const content=card_ids.map((id,ind)=>keys[ind]+"\n"+id.join("\n")).join("\n");

    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const deck_name=$("#wrapper article:eq(0) header h1").html().match(/(?<=\s*).*(?=<br>)/)[0].replace(/^\s*/, "").replace(/\s/, "_");
    a.download = deck_name+".ydk";
    a.href = url;
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    if (exceptions.length>0){
        alert("一部のカードが変換できませんでした。\n"+exceptions.join(" "));
    }
}

function split_data(data){
    const split_sep="__SPLIT__";
    return data.replace(/\r\n|\r|\n/g, split_sep).split(split_sep);
}

function obtain_deck_splited(data_array) {
    const indexes = ["#main", "#extra", "!side"].map(d=>data_array.indexOf(d))
    .concat([data_array.length]);
    return [0,1,2].map(d=>data_array.slice(indexes[d]+1,indexes[d+1]));
  };

async function importFromYdk(){
    const import_file=$("#button_importFromYdk_input").prop("files")[0];
    const data_tmp=await import_file.text();
    const data_array=split_data(data_tmp);
    const imported_ids=obtain_deck_splited(data_array);

    const row_names=["monster", "spell", "trap", "extra", "side"];
    const row_results=Array(5).fill({}).map(_ =>{ return {"names":[], "nums":[]}});
    const df=GLOBAL_df;
    let exceptions=[];
    imported_ids.forEach((ids, ind)=>{
        for (const id of Array.from(new Set(ids))){
            if (!id) continue;
            const name_tmp=df_filter(df, "Jap", ["id", id])[0];
            const num_tmp=ids.filter(d=>d==id).length;
            let types_tmp;
            let main_row;
            if (ind==0){
                types_tmp=df_filter(df, "type", ["id", id])[0];
                main_row=["monster", "spell", "trap"].map(d=>d.toUpperCase());
            }
            if (!name_tmp) exceptions.push(id, name_tmp);
            else {
                let row_index=ind+2;
                if (ind==0){
                    const row_type=main_row.filter(d=>types_tmp.split(" ").some(dd=>dd==d))[0];
                    row_index=row_names.indexOf(row_type.toLowerCase());
                }
                row_results[row_index].names.push(name_tmp);
                row_results[row_index].nums.push(num_tmp);
            }
        }
    })

    // deck_name
    $("#dnm").val(import_file.name.replace(/\.ydk$/, ""));

    for(const tab_ind of [...Array(5).keys()]){
        const row_name=row_names[tab_ind];
        const row_short_name=row_name.slice(0,2);
        // reset
        [...Array(60).keys()].forEach(ind2=>{
            $(`#${row_name}_list #${row_short_name}nm_${ind2+1}`).val("");
            $(`#${row_name}_list #${row_short_name}num_${ind2+1}`).val("");
        })
        console.log(row_results[tab_ind]);
        if (row_results[tab_ind].names.length==0) continue;
        const card_names=row_results[tab_ind].names;
        const card_nums=row_results[tab_ind].nums;
        card_names.forEach((name, ind2)=>{
            $(`#${row_name}_list #${row_short_name}nm_${ind2+1}`).val(name);
            $(`#${row_name}_list #${row_short_name}num_${ind2+1}`).val(card_nums[ind2]);
        })
        const sum_num=card_nums.reduce((acc,cur)=>acc+cur, 0);
        [0,1].forEach(d=>{
            const total_count=$(`.${row_name}_total:eq(${d})`);
            total_count.empty();
            total_count.append(sum_num);
        })
    }
    const main_total=$(".main_total");
    main_total.empty();
    const main_total_num=[0,1,2].reduce((acc, cur)=> acc+Number($(`.main_count:eq(${cur})`).text()), 0);
    main_total.append(main_total_num);
    if (exceptions.length>0){
        const error_message="一部のカードが変換できませんでした。\n"+exceptions.join(", ");
        alert(error_message);
    }

}

$(async function () {
    const url_now=location.href;
    if (url_now.indexOf("ope=2&")!=-1){
        const area=$("#header_box .save");
        const label=$("<label>", {for:"button_importFromYdk_input"});
        const button=$("<a>", {class:"black_btn red",type:"button" ,id:"button_importFromYdk", style:"position: relative;"})
        .append("<b>インポート</b>");
        const input_button=$("<input>", {type:"file", accpet: "text/*.ydk", style:"display: none;" ,id:"button_importFromYdk_input"});
        button.append(input_button);
        label.append(button);
        area.append(label);
    }
    else if (/ope=1&|deck\.action\?cgid/.test(url_now) ){
        const area=$("#header_box #button_place_edit");
        const button=$("<a>", {class:"black_btn red", id:"button_exportAsYdk", style:"position: relative;"})
        .append("<b>エクスポート</b>");
        area.append(button);
    }
    const data=await fetch(chrome.runtime.getURL(db_path), {method: "GET"})
    .then(res=>res.text() )
    .then(data_tmp=>split_data(data_tmp));
    GLOBAL_df=CSV2Dic(data);

    $("#button_exportAsYdk").on("click", function(){
        exportAsYdk();
    })
    $("#button_importFromYdk").on("change", async function(){
        await importFromYdk();
    })
});
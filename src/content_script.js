//----------------------
const db_path=chrome.runtime.getURL("data/ygo_db_simple.csv")
let GLOBAL_df;

$(async function () {
    area=$("#reg_area");
    button=$("<button>", {class:"black_btn", "onclick":"exportAsYdk()"}).append("<b>Export As .ydk</b>");
    area.append(button);
    GLOBAL_df=await $.ajax("GET", db_path)
    .then(res=>{ console.log(res);
         return res.text})
    .then(data_tmp=>data_tmp.replace(/(?<!\r)\n|\r(?!\n)/, "\r\n").split("\r\n"))
    .then(data=>CSV2Dic(data));
});

function CSV2Dic(csv_data){
    const headres=csv_data[0].split(",");
    let data_array=Array(headers.length).fill([]);
    for(csv_row of csv_data.slice(1)){
        csv_row.split(",").forEach((d, ind)=>data_array[ind].push(d));
    }
    let result_data={};
    headers.forEach((d, ind) =>result_data[headers[ind]]=d);
    return result_data;
}

function df_filter(df, col_out, dic_in){
    const key=Object.keys(dic_in)
    const indexes_in=df[key].map((d,ind)=>{
        if (d==dic_in[key]) return ind;
        else return false;
    }).filter(d=>d!=false);
    return Array.from(new Set(indexes_in)).map(d=>df[col_out][d])
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
    const card_ids=card_names.map(d=>d.map(dd=>df_filter(df, "id", {"Jap":dd})[0]));
    const content=card_ids.map((ind,d)=>keys[ind]+"\n"+d.join("\n")).join("\n");

    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.download = dl_name;
    a.href = url;
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}
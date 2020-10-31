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
    alert("一部のカードが変換できませんでした。\n"+exceptions.join(" "));
    console.log(content)
}



$(async function () {
    const area=$("#reg_area");
    const button=$("<button>", {class:"black_btn", type:"button", id:"button_exportAsYdk"}).append("<b>Export As .ydk</b>");
    area.append(button);
    const data=await fetch(chrome.runtime.getURL(db_path), {method: "GET"})
    .then(res=>res.text() )
    .then(data_tmp=>data_tmp.split("\n"))
    GLOBAL_df=CSV2Dic(data);

    $("#button_exportAsYdk").on("click", function(){
        console.log("clicked");
        exportAsYdk();
    })
});
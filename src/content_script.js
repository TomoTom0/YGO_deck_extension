//----------------------
const db_path="ygo_db_simple.csv"
let GLOBAL_df;

$(async function () {
    area=$("#reg_area");
    button=$("<button>", {class:"black_btn", "onclick":"exportAsYdk()"}).append("<b>Export As .ydk</b>");
    area.append(button);
    GLOBAL_df= await djfs.DataFrame.fromCSV(db_path);
});

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
    const card_ids=card_names.map(d=>d.map(dd=>df.filter(row=>row.get("Jap")==dd).toDict()["id"][0]));
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
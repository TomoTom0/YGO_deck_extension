```
<div class="image_set">
	
	
		
    <a target="_blank" href="/yugiohdb/card_search.action?ope=2&amp;cid=14741&amp;request_locale=ja">
        
        
            <span>
            <img class="card_image_monster_0_1 ui-draggable ui-draggable-handle" alt="原始生命態ニビル" title="原始生命態ニビル" src="/yugiohdb/get_image.action?type=1&amp;lang=ja&amp;cid=14741&amp;ciid=1&amp;enc=sQvHuRh3DhcHxLUtUIJ-mw&amp;osplang=1" style="position: relative;">
            <div><span></span></div></span>
        
    </a>
</div>
```

const obtainRowResults_Input = (df = undefined) => {
    const rows_num = $("#deck_text [id$='_list']").length;
    const row_names = [...Array(rows_num).keys()].map(row_ind => $(`#deck_text [id$='_list']:eq(${row_ind})`).attr("id")
        .match(/^\S*(?=_list)/)[0]);
    return Object.assign(...[...Array(rows_num).keys()].map(row_ind => {
        const row_name = row_names[row_ind];
        const row_short_name = row_name.slice(0, 2);
        //const card_length = $(`#deck_text [id$='_list']:eq(${row_ind}) td.card_name`).length;
        const card_length_max = $(`input[name='${row_short_name}nm']`).length;
        const result_tmp = [...Array(card_length_max).keys()].map(card_ind => {
            const name_tmp = $(`#${row_short_name}nm_${card_ind + 1}`).prop("value").replaceAll(/^\s*|\s*$/g, "");
            const num_tmp = parseInt($(`#${row_short_name}num_${card_ind + 1}`).prop("value").replaceAll(/^\s*|\s*$/g, ""));
            if (name_tmp.length > 0 && Number.isInteger(num_tmp) && num_tmp > 0 && num_tmp < 4) {
                return { name: name_tmp, num: num_tmp };
            } else return undefined;
        }).filter(d => d != undefined);
        return {
            [row_name]: {
                names: result_tmp.map(d => d.name),
                nums: result_tmp.map(d => d.num),
                cids: result_tmp.map(_ => undefined)
            }
        };
    }))
}

const row_results=obtainRowResults_Input();
const _judgeString = inputText => typeof inputText === "string" || inputText instanceof String;
const row_imgs_dic_tmp=["monster", "spell", "trap", "extra", "side"].map(type_card=>{
    const row_result=row_results[type_card];
    const encImgs=df_filter(df, "encImg", ["cid", row_result.cids]);
    const card_imgs=row_result.names.map((name_now, ind_card)=>{
        const cid_now=row_result.cids[ind_card];
        const num_ind=row_result.nums[ind_card];
        const encImg_now=encImgs[ind_card];
        const a_img=$("<a>", {href:"#", target:"_blank"});
        const span=$("<span>");
        const img=$("<img>", {
            class:`card_image_${type_card}_0_${ind_card+1} ui-draggable ui-draggable-handle`,
            alt:name_now,
            title:name_now,
            src:`/yugiohdb/get_image.action?type=1&amp;lang=ja&amp;cid=${cid_now}&amp;ciid=1&amp;enc=${encImg_now}&amp;osplang=1`,
            style:"position: relative;"});
        span.append(img);
        a_img.append(span);
        return [a_img,a_img,a_img].slice(0,num_ind);
    }).filter(d=>d!==null).flat();
    return {[type_card]:card_imgs};
});
const row_imgs_dic=Object.assign(...row_imgs_dic_tmp)
const deck_key_dic={main:["monster", "spell", "trap"], extra:["extra"], side:["side"]}
const deck_imgs_dic_tmp=Object.entries(deck_key_dic).map(([deck_key, card_type_arr]) => {
    const deck_imgs_tmp=card_type_arr.map(card_type=>row_imgs_dic[card_type])
    return Object({[deck_key]:deck_imgs_tmp.flat()})
});
const deck_imgs_dic=Object.assign(...deck_imgs_dic_tmp)

const div_deckHeader=$("#deck_header")
const div_imageSet=$("<div>", {class:"image_set", style:"display: flex; flex-wrap: wrap; border: 2px solid #000; padding: 1px;"});
div_imageSet.append(...deck_imgs_dic.main)

div_deckHeader.after(div_imageSet)

src="/yugiohdb/get_image.action?type=1&lang=ja&cid=16195&ciid=1&enc=mX8I79lWCES3fYrc34NaEA&osplang=1"
src="/yugiohdb/get_image.action?type=1&lang=ja&cid=14741&ciid=1&enc=sQvHuRh3DhcHxLUtUIJ-mw&osplang=1"
src="/yugiohdb/get_image.action?type=1&amp;lang=ja&amp;cid=14741&amp;ciid=1&amp;enc=sQvHuRh3DhcHxLUtUIJ-mw&amp;osplang=1"

const operate_row_result = (row_results={}, cidIn=10, change=1, type_new=null, df=null)=>{
Object.entries(row_results).map(([card_type, row_result])=>{
    const ind_fromCid=row_result.cids.indexOf(cidIn);
    if (ind_fromCid===-1 && type_new !== card_type && change <= 0) return {[card_type]:row_result}
    const num_old= (ind_fromCid===-1) ? 0: row_result.nums[ind_fromCid];
    const num_new=Math.max(0, Math.min(3, num_old+change))
    if (num_new===0) {
        const row_result_tmp=Object.entries(row_result)
            .map(([k,v])=>Object({[k]:[...v.slice(0,ind_fromCid), ...v.slice(ind_fromCid+1)]}));
        return Object.assign(...row_result_tmp);
    } else if (ind_fromCid === -1 && df!==null) {
        const name_now=df_filter(df, "name", ["cid", cidIn]);
        row_result.names.push(name_now)
        row_result.nums.push(num_new);
        row_result.cids.push(cidIn);
    } else if (ind_fromCid !== -1) {
        row_result.nums[ind_fromCid]=num_new;
    }
    return {[card_type]:row_result};
})}

ope=1&sess=1&rp=20&keyword=&stype=1&ctype=&othercon=2&starfr=&starto=&pscalefr=&pscaleto=&linkmarkerfr=&linkmarkerto=&link_m=2&atkfr=&atkto=&deffr=&defto=
ope=1&sess=1&rp=20&keyword=&stype=1&ctype=&othercon=2&starfr=&starto=&pscalefr=&pscaleto=&linkmarkerfr=&linkmarkerto=&link_m=2&atkfr=&atkto=&deffr=&defto=

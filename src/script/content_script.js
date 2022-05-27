﻿"use strict";

//--------------------------
//         # initial
const defaultSettings = {
    autoUpdateDB: true,
    addDate: false,
    valid_feature_importExport: true,
    valid_feature_sortShuffle: true,
    valid_feature_deckHeader: true,
    valid_feature_deckEditImage: true,
    valid_feature_sideChange: true,
    default_visible_header: true,
    default_deck_edit_image: true,
    default_sideChange_view: true,
    default_lang: "ja"
}; // , changeCDBRepo: false, showColor: true
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

const obtainMyCgid = () => {
    const my_deck_btn = $("#header_menu>nav>div.bottom>ul.main_menu>li.my.menu_my_decks>ul>li>a:eq(0)");
    if (my_deck_btn.length == 0) {
        return null;
    } else return $(my_deck_btn).prop("href").match(/cgid=([^\&=]+)/)[1];
}

const obtainLang = () => {
    const meta_lang = $("meta[http-equiv='COntent-Language']");
    if (meta_lang.length === 0) return null;
    else return $(meta_lang).prop("content");
}

const shuffleArray = (arr) => {
    const arr_len = arr.length;
    for (const ind_now of [...Array(arr_len).keys()].map(d => arr_len - 1 - d)) {
        const ind_rand = Math.floor(Math.random() * (ind_now + 1));
        [arr[ind_now], arr[ind_rand]] = [arr[ind_rand], arr[ind_now]];
    }
    return arr;
}


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
        const cids_tmp= (df !== undefined) ? result_tmp.map(d=>df_filter(df, "cid", ["name", d.name])[0]) : result_tmp.map(_=>undefined);
        return {
            [row_name]: {
                names: result_tmp.map(d => d.name),
                nums: result_tmp.map(d => d.num),
                cids: cids_tmp
            }
        };
    }))
}

const obtainDeckHeader_raw = async (url_deck = null) => {
    //const term_tables=await obtainTermTables();
    const _obtainDeckHeaderArea = async (url_deck = url_deck) => {
        const html_parse_dic = parse_YGODB_URL(url_deck || location.href);
        if (["cgid", "dno"].filter(d => html_parse_dic[d] != null).length !== 2) return [];
        else if (url_deck !== null && url_deck !== location.href) {
            const parsed_html = $.parseHTML(await obtainStreamBody(url_deck));
            return $("#deck_header", parsed_html);
        } else {
            return $("#deck_header");
        }
    }
    const header_area = await _obtainDeckHeaderArea(url_deck);
    if (header_area.length === 0) return null;
    return {
        pflag: $("#broad_title>div>h1", header_area).text().match(/【 (.*) 】/)[1],
        deck_type: Array.from($(".text_set>span:eq(0)", header_area)).text(),
        deck_style: Array.from($(".text_set>span:eq(1)", header_area)).text(),
        category: $(".regist_category>span", header_area).length === 0 ? [] : Array.from($(".regist_category>span", header_area)).map(d => d.textContent),
        tag: $(".regist_tag>span", header_area).length === 0 ? [] : Array.from($(".regist_tag>span", header_area)).map(d => d.textContent),
        comment: Array.from($(".text_set>span.biko", header_area)).text()
    }
}

const obtainDeckHeader_edit = async (html_parse_dic) => {
    const my_cgid = obtainMyCgid();
    if (["cgid", "dno"].filter(d => html_parse_dic[d] != null).length !== 2) return null;
    else if (html_parse_dic.cgid != my_cgid) return null;
    const html_parse_dic_valid = Object.assign(...["cgid", "dno"].map(k => Object({ [k]: html_parse_dic[k] })), { ope: 2 });
    const sps = new URLSearchParams(html_parse_dic_valid);
    const url_edit = `/yugiohdb/member_deck.action?` + sps.toString();
    const html_edit = await obtainStreamBody(url_edit);
    const parsed_html = $.parseHTML(html_edit);
    const serialized_obtain = $("#deck_header input, #deck_header select, #deck_header textarea", parsed_html).serialize();
    const sps_par = new URLSearchParams(serialized_obtain);
    ["dno", "pflg", "deck_type", "deckStyle"]
        .map(k => {
            const match_res = html_edit.match(new RegExp(`\\(\'#${k}\'\\)\.val\\(\'([^\\)]*)\'\\)`))
            return [k, (match_res.length < 1) ? "" : match_res[1]]
        }).map(kv => sps_par.set(...kv));
    return sps_par.toString();
}

const serializeRowResults = (row_results) => {
    const row_maxLength_dic = { monster: 65, spell: 65, trap: 65, extra: 20, side: 20 }
    return Object.entries(row_results).map(([row_name, row_result]) => {
        const row_name_veryShort = row_name.slice(0, 2);
        const row_maxLength = row_maxLength_dic[row_name];
        const row_length = row_result.names.length;
        return [...Array(row_maxLength).keys()].map(ind => {
            if (ind + 1 > row_length) {
                return {
                    [row_name_veryShort + "nm"]: "",
                    [row_name_veryShort + "num"]: ""
                }
            } else {
                return {
                    [row_name_veryShort + "nm"]: row_result.names[ind],
                    [row_name_veryShort + "num"]: row_result.nums[ind]
                }
            }
        }).map(d => (new URLSearchParams(d)).toString()).join("&");
    }).join("&");
}
// ## operate recipie
const operateRowResults = (row_results={}, cidIn=10, change=1, type_new=null, df=null)=>{
    const num_all=Object.values(row_results).map((d, _ind)=>{
        const ind_fromCid=d.cids.indexOf(cidIn);
        if (ind_fromCid!==-1) return d.nums[ind_fromCid];
        else return null;
    }).filter(d=>d!==null).map(d=>parseInt(d)).concat([0]).reduce((acc,cur)=>acc+cur);
    if (num_all+change>3) return row_results;
    const row_results_new_tmp=Object.entries(row_results).map(([set_type, row_result])=>{
        const ind_fromCid=row_result.cids.indexOf(cidIn);
        if ((ind_fromCid===-1 && change <= 0) || type_new !== set_type) return {[set_type]:row_result}
        const num_old= (ind_fromCid===-1) ? 0: row_result.nums[ind_fromCid];
        const num_new=Math.max(0, Math.min(3, num_old+change));
        if (ind_fromCid!==-1 && num_new===0) {
            const row_result_tmp=Object.entries(row_result)
                .map(([k,v])=>Object({[k]:[...v.slice(0,ind_fromCid), ...v.slice(ind_fromCid+1)]}));
            return {[set_type]:Object.assign(...row_result_tmp)};
        } else if (ind_fromCid === -1 && change>0 && df!==null) {
            const name_now=df_filter(df, "name", ["cid", cidIn])[0];
            row_result.names.push(name_now)
            row_result.nums.push(change);
            row_result.cids.push(cidIn);
        } else if (ind_fromCid !== -1) {
            row_result.nums[ind_fromCid]=num_new;
        }
        return {[set_type]:row_result};
    })
    return Object.assign(...row_results_new_tmp);
}


// obtain df tmp

/*const obtainDFDeck = () => {
    const obtainCardInfoFromTable = (t_row) => {
        const card_name = $("div.inside>div.card_name.flex_1>span.name", t_row).text().replaceAll(/^\s*|\s*$/g, "");
        const card_type_icon = $("div.inside>div.card_name.flex_1>img.ui-draggable:eq(0)", t_row).prop("src").match(/card_icon_(\S+)\.\w+$/)[1];
        const card_attr = $("div.inside>div.element>div.item_set>span:eq(0)>img.ui-draggable:eq(0)", t_row).prop("src").match(/attribute_icon_(\S+)\.\w+$/)[1];
        const card_attr2 = card_attr.slice(0, 1).toUpperCase() + card_attr.slice(1,).toLowerCase();
        //const card_num=parseInt($("div.cards_num_set>span", t_row).text().replaceAll(/^\s*|\s*$/g, ""));
        const flex_st = $("div.inside>div.element>div.flex_3.other", t_row);
        const flex_mon = $("div.inside>div.element>div.flex_2.other", t_row);
        const flex_mon_stat = $("div.inside>div.element>div.num_set.flex_1", t_row);

        // optionで編集できるように?
        const card_type_dic_dic = {
            spell: { "通常": "Normal", "速攻": "Quick-Play", "永続": "Continuous", "装備": "Equip", "フィールド": "Field" },
            trap: { "通常": "Normal", "永続": "Continuous", "カウンター": "Counter" },
            monster: { "効果": "Effect", "通常": "Non-Effect", "チューナー": "Tuner", "ペンデュラム": "Pendulumn", "融合": "Fusion", "シンクロ": "Synchro", "エクシーズ": "XYZ", "リンク": "Link" },
            monster_race: {}
        }
        const obtainCardType = (type_raw, card_type_dic, card_type_base) => {
            const card_type_base2 = card_type_base.slice(0, 1).toUpperCase() + card_type_base.slice(1,).toLowerCase();
            let card_type_tmp = Object.entries(card_type_dic).map(kv => {
                const content = kv[1];
                if (type_raw.indexOf(kv[0]) != -1 || type_raw.indexOf(kv[1]) != -1) {
                    return [true, content];
                } else {
                    return [false, content]
                }
            }).filter(d => d[0]).map(d => d[1]);
            card_type_tmp.push(card_type_base2);
            return card_type_tmp;
        }
        const df_keys = ["name", "type", "race", "atk", "def", "attribute", "scale", "level", "ot", "cid", "id"]
        const df_base = Object.assign(...df_keys.map(d => ({ [d]: null })));
        if (flex_st.length > 0) {
            // spell and trap
            const card_type_base = ["spell", "trap"].filter(d => card_type_icon.indexOf(d) != -1)[0];
            const card_type_dic = card_type_dic_dic[card_type_base]
            const card_type_raw = $("span:eq(0)", flex_st).text().replaceAll(/^\s*|【\s*|\s*】|\s*$/g, "");
            const card_type = obtainCardType(card_type_raw, card_type_dic, card_type_base);
            const df_now = { name: card_name, type: card_type.join(","), ot: "OCG+" }
            return Object.assign(df_base, df_now);
        } else if (flex_mon.length > 0 && flex_mon_stat.length > 0) {
            // monster
            const card_type_base = "monster";
            const card_type_dic = card_type_dic_dic[card_type_base]
            const card_type_raw = $("span:eq(0)", flex_mon).text().replaceAll(/^\s*|【\s*|\s*】|\s*$/g, "");
            const card_type = obtainCardType(card_type_raw, card_type_dic, card_type_base);
            const card_stat_par_dic = { level: "span:eq(0)", scale: "span:eq(1)", atk: "div:eq(0)>span:eq(0)", def: "div:eq(0)>span:eq(1)" }
            const card_stat = Object.assign(...Object.entries(card_stat_par_dic).map(kv => {
                const par_cand = $(kv[1], flex_mon_stat).text().match(/\d+/g)
                if (Array.isArray(par_cand)) return { [kv[0]]: par_cand[0] }
                else return { [kv[0]]: null }
            }))
            const df_now = {
                name: card_name, type: card_type.join(","),
                atk: card_stat.atk, def: card_stat.def,
                attribute: card_attr2, scale: card_stat.scale,
                level: card_stat.level, ot: "OCG+"
            };
            return Object.assign(df_base, df_now);
        }
    }
    const df_arr = Array.from($("#main_m_list>div.t_body>div.t_row.c_simple"))
        .map(t_row => obtainCardInfoFromTable(t_row))
    return Object.assign(...Object.keys(df_arr[0]).map(k => ({ [k]: df_arr.map(d => d[k]) })))
}*/

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

// ## save/regist

const _Regist_fromYGODB = async (html_parse_dic_in = null, serialized_data_in = null) => {
    const html_parse_dic = html_parse_dic_in || parse_YGODB_URL(location.href, true);
    if (["cgid", "dno"].filter(d => html_parse_dic[d] !== null).length !== 2) return;
    const lang = obtainLang()
    const request_locale = lang != null ? `&request_locale=` + lang : "";
    if (serialized_data_in === null && $("#form_regist").length === 0) return;
    const serialized_data = serialized_data_in || "ope=3&" + $("#form_regist").serialize();
    return await $.ajax({
        type: 'post',
        url: `/yugiohdb/member_deck.action?cgid=${html_parse_dic.cgid}&${request_locale}`,
        data: serialized_data,
        dataType: 'json',
        beforeSend: () => {
            $('#btn_regist').removeAttr('href');
            $('#message').hide().text('');
            $('#loader').show();
        },
        complete: () => {
            $('#loader').hide();
        },
        success: (data, dataType) => {
            if (data.result) {
                console.log("Registered");
                //location.href = "/yugiohdb/member_deck.action?cgid=87999bd183514004b8aa8afa1ff1bdb9&dno=42&request_locale=ja";
            } else {
                if (data.error) {
                    console.log("Register falied: ", data.error);
                    /*var lst = [];
                    $.each(data.error, function(index, value){
                        lst.push($.escapeHTML(value));
                    });
                    console.log(lst);*/
                    //$('#message').append('<ul><li>' + lst.join('</li><li>') + '</li></ul>').show();
                } else console.log("Register falied: ", data);
                //$('#btn_regist').attr('href', 'javascript:Regist();');
            }
        },
        error: function (xhr, status, error) {
            console.log(error);
        }
    });
}

/*const __FetchNotWork_Regist_fromYGODB = async () => {
    const html_parse_dic = parse_YGODB_URL(location.href, true);
    console.log(html_parse_dic);
    if (["cgid", "dno"].filter(d => html_parse_dic[d] != null).length !== 2) return;
    const request_locale = html_parse_dic.request_locale !== null ? `&request_locale=` + html_parse_dic.request_locale : "";

    $('#btn_regist').removeAttr('href');
    $('#message').hide().text('');
    $('#loader').show();
    const res = await fetch(`/yugiohdb/member_deck.action?cgid=${html_parse_dic.cgid}${request_locale}`, {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: 'ope=3&' + $('#form_regist').serialize()
    });
    console.log(res)
    //.then(d => d.body)
    //.then(d => d.getReader())
    //.then(reader => reader.read())
    //.then(res => new TextDecoder("utf-8").decode(res.value));
    //console.log(data);
    $('#loader').hide();
    if (res.ok) {
        console.log("Registered")
        //location.href = `/yugiohdb/member_deck.action?cgid=${html_parse_dic.cgid}&dno=${html_parse_dic.dno}${request_locale}`;
    } else {
        if (res.error) {
            var lst = [];
            $.each(data.error, function (index, value) {
                lst.push($.escapeHTML(value));
            });
            $('#message').append('<ul><li>' + lst.join('</li><li>') + '</li></ul>').show();
        }
        $('#btn_regist').attr('href', 'javascript:Regist();');
    }
}*/

// ## sort cards

const _sortCards = (row_name, row_result, df, df_now = {}) => {
    const sort_cond_base = { "cid": 0, "name": 0 }
    const sort_cond_dic_dic = {
        "monster": { "level": -1, "atk": -1, "def": -1, "id": 1 },
        "spell": { "type": ["Normal", "Quick-Play", "Continuous", "Equip", "Field"], "id": 1 },
        "trap": { "type": ["Normal", "Continuous", "Counter"], "id": 1 },
        "extra": { "type": ["Fusion", "Synchro", "XYZ", "Link"] },
        "side": { "type": ["Monster", "Spell", "Trap"] }
    }
    const sort_cond_dic = Object.assign(sort_cond_base, sort_cond_dic_dic[row_name])
    const output_tmp_cid = df_filter(df, Array.from(Object.keys(sort_cond_dic)), ["cid", row_result.cids]);
    //const output_tmp_jap = df_filter(df_now, Array.from(Object.keys(sort_cond_dic)), ["name", row_result.names]);
    // convert
    //console.log(Object.keys(output_tmp).map(k=>({[k]:output_tmp[k][ind]})))
    //[]
    const output_arr = row_result.cids.map((cid, ind_cid) => {
        const name_tmp = row_result.names[ind_cid];
        const ind_fromCid = output_tmp_cid.cid.indexOf(cid);
        //const ind_fromName = output_tmp_jap.name.indexOf(name_tmp);
        //console.log(ind_fromCid, ind_fromName)
        return Object.assign(
            ...Object.keys(output_tmp_cid).map(k => ({ [k]: output_tmp_cid[k][ind_fromCid] })),
            { cid: cid, name: name_tmp, num: row_result.nums[ind_cid] })
        /*return Object.assign(
            //...Object.keys(output_tmp_cid).map(k=>({[k]:output_tmp_cid[k][ind_fromCid]}))
            ...Object.keys(output_tmp_jap).map(k => {
                const val = output_tmp_jap[k][ind_fromName]
                if (["id", "cid"].indexOf(k) == -1) return { [k]: val }
                else if (["id"].indexOf(k) != -1) return { [k]: output_tmp_cid[k][ind_fromCid] }
                else if (["cid", "name"].indexOf(k) != -1) return { [k]: null };
            }), { cid: cid, name: name_tmp, num: row_result.nums[ind_cid] });*/
    })
    //console.log(output_arr);
    if (["extra", "side"].indexOf(row_name) != -1) {
        const output_typed = sort_cond_dic.type.map(type_tmp => {
            const output_filtered = output_arr.filter(d => d.type.indexOf(type_tmp) != -1);
            const output_res_tmp = Object.assign(...["cid", "name", "num"].map(k => ({ [k + "s"]: output_filtered.map(d => d[k]) })));
            const type_for_sort_dic = { extra: "monster", side: type_tmp.toLowerCase() }
            const type_for_sort = type_for_sort_dic[row_name];
            return _sortCards(type_for_sort, output_res_tmp, df, df_now);
        });
        return Object.assign(...["cid", "name", "num"].map(k => ({ [k + "s"]: output_typed.map(d => d[k + "s"]).flat() })));
    } else {
        const arr_sorted = output_arr.sort((a, b) => {
            const diffs = (Object.keys(sort_cond_dic).map(k => {
                const sort_cond = sort_cond_dic[k];
                const valIsValid = true//[a[k], b[k]].every(d => d!=null);
                if (valIsValid && Number.isInteger(sort_cond)) {
                    return [k, sort_cond * (parseInt(a[k]) - parseInt(b[k]))];
                } else if (valIsValid && Array.isArray(sort_cond)) {
                    const inds_for_sort = [a[k], b[k]].map(tmp_k => sort_cond.map(d => [tmp_k.indexOf(d), d]).filter(d => d[0] != -1).map(d => sort_cond.indexOf(d[1])));
                    return [k, inds_for_sort[0] - inds_for_sort[1]];
                } else return [k, 0];
            }));
            //console.log(diffs, a,b )
            const diffs2 = diffs.filter(d => Number.isInteger(d[1]) && d[1] != 0 && !Number.isNaN(d[1]));
            //console.log(diffs2[0], [...diffs2, ["",0]][0][1] ,a.name, b.name)
            return [...diffs2, ["", 0]][0][1];
        });
        return Object.assign(...["cid", "name", "num"].map(k => ({ [k + "s"]: arr_sorted.map(d => d[k]) })));
    }
}

const sortCards = async (row_results) => {
    const df = await obtainDF(obtainLang());
    //const df_now = obtainDFDeck();
    const row_results_new = Object.assign(...Object.entries(row_results).map(d => ({ [d[0]]: _sortCards(d[0], d[1], df) })));
    //console.log("sorted", row_results_new);
    return row_results_new;
}

// # shuffle

const shuffleCards = (mode="shuffle", set_type="main") => {
    const cards_pre_tmp = Array.from($(`#deck_image>#${set_type}>div.image_set>a:has(span>img)`));
    const cards_pre = cards_pre_tmp.length>0 ? cards_pre_tmp : Array.from($(`#deck_image>#${set_type}>div.image_set>span:has(img)`));
    const area = Array.from($(`#deck_image>#${set_type}>div.image_set`));
    if (cards_pre.length === 0 || area.length === 0) return;
    const new_cards = mode==="shuffle" ? shuffleArray(cards_pre): resetSortDeckImgs(cards_pre);
    new_cards.map(d=>$(area).append(d));
    //$(area).html(shuffled_cards.map(d => d.outerHTML).join("\n"));
}

const resetSortDeckImgs = (cards_pre) => {
    //const card_class_arr=Array.from(main_cards)
    //    .map(d=>$("img", d).attr("class").match(/card_image_([^_]+)_(\d+)_(\d+).*/)).map(d=>Object({type:d[1], ind1:d[2], ind2:d[3]}));
    const type_ind_dic={"monster":0, "spell":1, "trap":2, "extra":3, "side":4};
    return cards_pre.sort((a,b)=>{
        const class_arr=[a,b].map(d=>
            $("img", d).attr("class").match(/card_image_([^_]+)_(\d+)_(\d+).*/)).map(d=>Object({type:d[1], ind1:d[2], ind2:d[3]})
        );
        const diff_dic={
            type:class_arr.map(d=>type_ind_dic[d.type]),
            ind1:class_arr.map(d=>parseInt(d.ind1)),
            ind2:class_arr.map(d=>parseInt(d.ind2))
        }
        for (const [num_a,num_b] of Object.values(diff_dic)){
            if (num_a!==num_b) return num_a - num_b;
        }
        return 0;
    })
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

    const df = await obtainDF(obtainLang());
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
                output_comp = `${name_Jap}`; //\t${row_name}
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
    const df = await obtainDF(obtainLang());
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
async function sortClicked() {
    const url_now = location.href;
    const html_parse_dic = Object.assign(parse_YGODB_URL(url_now), { ope: 2 });
    //console.log(html_parse_dic);
    if (["cgid", "dno"].some(d => Object.keys(html_parse_dic).indexOf(d) === -1)) {
        return;
    }
    //const url_ope2 = "https://www.db.yugioh-card.com/yugiohdb/member_deck.action?" +
    //    (new URLSearchParams(html_parse_dic)).toString();
    const row_results = obtainRowResults();
    const row_results_new = await sortCards(row_results);
    const serialized_dic = {
        ope: "ope=3",
        header: await obtainDeckHeader_edit(html_parse_dic),
        deck: serializeRowResults(row_results_new)
    }
    const serialized_data = Object.values(serialized_dic).join("&");
    //console.log(serialized_data);
    //return; // test
    await _Regist_fromYGODB(html_parse_dic, serialized_data).then(async res => {
        //console.log(res);
        console.log("Reload");
        await sleep(100);
        location.reload();
    });
    /*const postMsg = "trigger_sortCard_" + JSON.stringify(row_results_new);
    //console.log(row_results_new);
    //console.log(postMsg);
    const win = window.open(url_ope2, "sortCard", "width=500,toolbar=yes,menubar=yes,scrollbars=yes");
    win.addEventListener("load", () => {
        setTimeout(() => {
            win.postMessage(postMsg, "*");
        }, 100);
    }, false);*/
}

// # deck header show / hide
const toggleVisible_deckHeader = (toShow_in = null) => {
    const html_parse_dic = parse_YGODB_URL(location.href, true);
    if (html_parse_dic.ope != 2) return;
    const button = $("#button_visible_header");
    const toShow = (typeof (toShow_in) !== "boolean") ? $(button).hasClass("show") : toShow_in;
    const showHide = { true: "show", false: "hide" };
    $(button).removeClass(showHide[toShow]);
    $(button).addClass(showHide[!toShow]);
    $("span", button).text("Header " + showHide[!toShow].toUpperCase());
    const dls = Array.from($("#deck_header>div>div>dl"));
    for (const dl_tmp of dls) {
        if (dls.indexOf(dl_tmp) !== 0 && toShow === false) {
            $(dl_tmp).css({ display: "none" });
        } else {
            $(dl_tmp).css({ display: "" }) // relativeにするとnoneで固定された
        }
    }
}

const changeSize_deckHeader = (ctc_name, ctc_ind_size_old_in = null) => {
    const arr_size_ct = [120, 500] // [120,300,500]

    const html_parse_dic = parse_YGODB_URL(location.href, true);
    if (html_parse_dic.ope != 2) return;

    const header_ids_dic = { category: "dckCategoryMst", tag: "dckTagMst", comment: "biko" };
    const ctc_now = $(`#${header_ids_dic[ctc_name]}`);
    const ctc_ind_size_old = ctc_ind_size_old_in || ctc_now.attr("class").match(/ctc_size_(\d*)/)[1];
    const ctc_ind_size = (1 + parseInt(ctc_ind_size_old)) % arr_size_ct.length;
    ctc_now.removeClass(`ctc_size_${ctc_ind_size_old}`);
    ctc_now.addClass(`ctc_size_${ctc_ind_size}`);
    const isCT = ["category", "tag"].indexOf(ctc_name) !== -1
    if (isCT) {
        const size_now = arr_size_ct[ctc_ind_size];
        ctc_now.addClass(`ctc_size_${ctc_ind_size}`);
        ctc_now.css({ height: size_now });
    } else {
        const row_now = 6 * (1 + ctc_ind_size % arr_size_ct.length);
        ctc_now.addClass(`ctc_size_${ctc_ind_size}`);
        ctc_now.prop("rows", row_now);
    }
}

// # insert deck image
const _generateDeckImgSpan=(df, card_type, card_name_cid={name:null, cid:null}, card_class_ind=0)=>{
    const span=$("<span>", {
        style:"max-width: 6.5%; padding:1px; box-sizing:border-box; display: block;"
    });

    const card_input=Object.assign({name:null, cid:null}, card_name_cid);
    if (card_input.name == null && card_input.cid == null) return span;
    const name_now = (card_input.name == null) ? df_filter(df, "name", ["cid", card_input.cid])[0] : card_input.name;
    const cid_now = (card_input.cid == null) ? df_filter(df, "cid", ["name", card_input.name])[0] : card_input.cid;
    const encImg_now=df_filter(df, "encImg", ["cid", cid_now])[0];
    const id_now=df_filter(df, "id", ["cid", cid_now])[0];
    const img_tmp=$("<img>", {
        class:`card_image_${card_type}_${card_class_ind} ui-draggable ui-draggable-handle`,
        alt:name_now,
        title:name_now,
        card_id:id_now,
        card_cid:cid_now,
        card_type:card_type,
        card_name:name_now,
        src:`/yugiohdb/get_image.action?type=1&lang=ja&cid=${cid_now}&ciid=1&enc=${encImg_now}&osplang=1`,
        style:"position: relative;width: 100%;"});
    span.append(img_tmp);
    //a_img.append(span);
    return span; // a_img;
}

const insertDeckImg = (df, row_results, displayIsValid=true) => {
    const div_deck_imageSet_old=$("div#deck_image");
    if (div_deck_imageSet_old.length>0) $(div_deck_imageSet_old).empty();
    const dislapy_style= displayIsValid ? "block":"none";
    const div_deck_imageSet= (div_deck_imageSet_old.length>0) ? div_deck_imageSet_old : $("<div>", {
        id:"deck_image",
        style:`display:${dislapy_style}; max-width:980px;min-height: 576px;`,
        oncontextmenu:"return false;",
        wheelClick:"return false;"
    })
    //const _judgeString = inputText => typeof inputText === "string" || inputText instanceof String;
    const row_imgs_dic_tmp=["monster", "spell", "trap", "extra", "side"].map(row_name=>{
        const row_result=row_results[row_name];
        let count=0;
        const card_imgs=row_result.names.map((name_now, ind_card)=>{
            const cid_now=row_result.cids[ind_card];
            const num_ind=row_result.nums[ind_card];
            const span_imgs=[...Array(num_ind).keys()].map(ind_local=>{
                //const a_img=$("<a>", {href:"#"});
                return _generateDeckImgSpan(df, row_name, {cid:cid_now, name:name_now}, `${ind_local}_1`);
            });
            count+=num_ind;
            return span_imgs;
        }).filter(d=>d!==null).flat();
        return {[row_name]:card_imgs};
    });
    const row_imgs_dic=Object.assign(...row_imgs_dic_tmp)
    const deck_key_dic={main:["monster", "spell", "trap"], extra:["extra"], side:["side"]}
    const deck_imgs_dic_tmp=Object.entries(deck_key_dic).map(([deck_key, card_type_arr]) => {
        const deck_imgs_tmp=card_type_arr.map(card_type=>row_imgs_dic[card_type]);
        return {[deck_key]:deck_imgs_tmp.flat()};
    });
    const deck_imgs_dic=Object.assign(...deck_imgs_dic_tmp);

    const div_deck_text=$("#deck_text");
    for (const [row_name, row_imgs] of Object.entries(deck_imgs_dic)){
        const div_imageSet=$("<div>", { //(div_imageSet_old.length>0) ? div_imageSet_old : 
            id:`${row_name}`,
            class:`image_set image_set_${row_name} image_set_MouseUI image_set_deck MouseUI`,
            set_type:row_name,
            style:`display: flex; flex-wrap: wrap; border: 2px solid #000; padding: 1px;min-height: 95px;`,
            oncontextmenu:"return false;",
            wheelClick:"return false;"
        });
        for (const img_card of row_imgs) {
            div_imageSet.append(img_card)
        };
        div_deck_imageSet.append(div_imageSet)
    }
    div_deck_text.after(div_deck_imageSet)
}

const modifyDeckImg=(img_target, change=+1, set_type=null)=>{
    //const num_new=Math.max(0, Math.min(3, num_old+change));
    //if ( (num_old===0 && change<=0) || (num_old===3 && change>=0)) return;
    if (change===-1) {
        const span_tmp=$(img_target).parents("span")[0];
        $(span_tmp).addClass("del_card");
        $(span_tmp).css({display:"none"});
        //span_tmp.remove();
    } else if (change===+1 && set_type === null) {
        const span_tmp=$(img_target).parents("span")[0];
        const span_clone=$(span_tmp).clone()[0];
        $(span_clone).addClass("add_card").removeClass("del_card").css({display:"block"})
        $(span_tmp).after(span_clone);
    } else if (change===+1 && set_type !==null) {
        const span_tmp=$(img_target).parents("span")[0];
        const span_clone=$(span_tmp).clone()[0];
        $(span_clone).addClass("add_card").removeClass("del_card").css({display:"block"});
        const image_set_now=$(`.image_set[set_type='${set_type}']`);
        if (image_set_now.length===0) return;
        $(image_set_now).append(span_clone);
    }
    //else if (num_old === 0 && card_type!==null){
        // new kind
    //    console.log("comnig soon")
    //}
}

const judgeCardType = (df, info_input, output="row") =>{
    const row_idents_dic={monster:["Monster"], spell:["Spell"], trap:["Trap"], extra:["Fusion", "Synchro", "XYZ", "Link"]};
    const type_now=df_filter(df, "type" ,info_input)[0];
    if (type_now == null) console.log(info_input);
    const type_judged_arr=Object.entries(row_idents_dic).map(([row_name, row_idents])=>{
        if (row_idents.some(d=>type_now.indexOf(d)!==-1)) return row_name;
        else return null;
    }).filter(d=>d!=null).concat([null]);
    const type_judged= type_judged_arr.indexOf("extra")!==-1 ? "extra" : type_judged_arr[0];
    if (output==="row") return type_judged;
    else if (output === "set") return ["monster", "spell", "trap"].indexOf(type_judged)!==-1 ? "main": type_judged;
    else return type_judged;
}

const sideChange_deck=(df, img_target, onEdit=true) =>{
    const row_results= onEdit===true ? obtainRowResults_Input(df): obtainRowResults();
    const cid_now=parseInt($(img_target).attr("card_cid"));
    const from_set_type=$(img_target).parents("div.image_set").attr("set_type");
    if (from_set_type == null) return row_results;
    const raw_type=judgeCardType(df, ["cid", cid_now], "row");
    const to_type = (from_set_type === "side") ? raw_type : "side";
    const from_type= (from_set_type === "main") ? raw_type : from_set_type;
    const row_results_tmp1=operateRowResults(row_results, cid_now, -1, from_type, df);
    const row_results_tmp2=operateRowResults(row_results_tmp1, cid_now, +1, to_type, df);
    if (onEdit === true) importDeck(row_results_tmp2);
    modifyDeckImg(img_target, -1);
    const to_set_type= ["monster", "spell", "trap"].indexOf(to_type)!==-1 ? "main": to_type;
    modifyDeckImg(img_target, +1, to_set_type);
    return row_results_tmp2;
}

const operate_deckEditVisible = (key_show="image") => {
    const div_deck_dic={text:$("#deck_text"), image:$("#deck_image")};
    if (Object.keys(div_deck_dic).indexOf(key_show) === -1 ) return;
    Object.entries(div_deck_dic).map(([key_div, div_deck])=>{
        const display_style= (key_show === key_div) ? "block" : "none";
        div_deck.css({display:display_style});
    });
}

// # sideChange on deck view

const operateSideChangeMode = (mode="toggle", df=null) =>{
    const button_sideChange=$("#button_sideChange");
    const status_pre=$(button_sideChange).hasClass("on");
    if (mode=== "toggle") {
        $(button_sideChange).toggleClass("on");
        $(button_sideChange).toggleClass("red");
        const status_new=!status_pre;
        const on_off_text= status_new ? "ON->off" : "OFF->on" ;
        const span_text=`SideChange|L:Reset/R:${on_off_text}`;
        $("span", button_sideChange).html(span_text);
        _operateSideChange(status_new);
    } else if (mode === "reset") {
        //const row_results=obtainRowResults();
        $("#deck_image div.image_set span.add_card:has(img)").remove();
        const cards_all_exist=Array.from($("#deck_image div.image_set span:has(img):not(.add_card)"));
        $("#deck_image div.image_set span.del_card:has(img)").css({display:"block"}).removeClass("del_card");
        /*Object.entries(row_results).map(([row_name, row_result])=>{
            row_result.names.map(([card_name, card_ind])=>{
                const card_num=row_result.nums[card_ind];
                const card_cid=row_result.cids[card_ind];
                const class_name=`card_image_${row_name}_${card_ind}_1`;
                const card_exist=cards_all_exist.filter(d=>$(d).is(`.${class_name}`));
                const num_exist=card_exist.length;
                if (num_exist < card_num && num_exist>0) {
                    return Array(card_num-num_exist).map(_=>$(card_exist[0]).clone());
                } else if (num_exist < card_num && num_exist===0) {
                    const span_new=_generateDeckImgSpan(df, row_name, {name:card_name, cid:card_cid}, `${card_ind}_1`);

                }
            })
        })*/
        resetSortDeckImgs(cards_all_exist).map(span=>{
            const img=$("img", span);
            const classInfo_tmp=$(img).attr("class").match(/card_image_([^_]+)_(\d+)_(\d+).*/);
            const classInfo={
                type:classInfo_tmp[1],
                ind1:classInfo_tmp[2],
                ind2:classInfo_tmp[3]
            };
            const set_type=["monster", "spell", "trap"].indexOf(classInfo.type)!== -1 ?"main" : classInfo.type;
            //if (classInfo.type==="side") console.log(img, classInfo, set_type)
            const image_set=$(`#deck_image div.image_set[set_type='${set_type}']`);
            $(image_set).append(span);
        });
    }
}

const _operateSideChange = (sideChangeIsValid=true)=>{
    const deck_image=$("#deck_image");
    const par_dic={
        true:{attr:{oncontextmenu: "return false;", wheelClick: "return false;"},css:{"min-height":"780px"}},
        false:{attr:{oncontextmenu: "", wheelClick: ""},css:{"min-height":"0"}}
    }
    $(deck_image).attr(par_dic[sideChangeIsValid].attr);
    $(deck_image).css(par_dic[sideChangeIsValid].css);
    $("#deck_image div.card_set div.image_set span:has(img):not(.add_card)").attr(par_dic[sideChangeIsValid].attr);
    Array.from($("#deck_image .image_set span:has(img):not(.add_card)")).map(span=>{
        const image_set=$(span).parents(".image_set")[0];
        const a_span_ident=$(span).attr("a_span")
        const card_a=$(`#deck_image div.image_set a[a_span='${a_span_ident}']`);
        if (sideChangeIsValid===true) {
            //$(image_set).append(span);
            $(card_a).before(span);
            $(card_a).css({display:"none"});
            $(span).css({"max-width": "6.5%", padding:"1px", "box-sizing":"border-box"});
        } else {
            $(span).css({"max-width": "", padding:"0px", "box-sizing":""});
            $(card_a).after(span);
            $(card_a).append(span);
            //$(card_a).css({display:"block"});
        }
    })
    if (sideChangeIsValid!==true) $("#deck_image div.image_set a:has(span:has(img))").css({display:"block"});
}

const updateDeckCountView=()=>{
    Array.from($("#deck_image .card_set")).map(card_set=>{
        const div_top=$("div.subcatergory>div.top", card_set);
        const span_count=$("span:last", div_top);
        span_count.html($("div.image_set span:has(img):not(.del_card)", card_set).length);
    })
}

//------------------------------------
//         #  on loading

$(async function () {
    const url_now = location.href;
    const html_parse_dic = parse_YGODB_URL(url_now, true);
    const my_cgid = obtainMyCgid();

    const settings = await operateStorage({ settings: JSON.stringify({}) }, "sync")
        .then(items => Object.assign(defaultSettings, JSON.parse(items.settings)));
    //console.log(settings)

    const script_initial_count=$("script[type='text/javascript']").length;

    if (html_parse_dic.ope == "2") {
        // ## deck edit
        // import button
        //const area = $("#header_box .save"); // before// 2022/4/18
        const area_bottom = $("#bottom_btn_set"); // after 2022/4/18
        if (settings.valid_feature_importExport === true) {
            const label = $("<label>", { for: "button_importFromYdk_input" });
            const button_import = $("<a>", {
                class: "btn hex red button_import", type: "button", id: "button_importFromYdk",
                style: "position: relative;user-select: none;"
            })
                .append("<span>Import</span>")
            const input_button = $("<input>", { type: "file", accpet: "text/*.ydk", style: "display: none;", id: "button_importFromYdk_input" });
            button_import.append(input_button);
            label.append(button_import);
            area_bottom.append(label);
        }

        // other buttons for bottom
        const button_bottom_dic = {
            header_visible: $("<a>", {
                class: "btn hex red button_visible_header hide", type: "button", id: "button_visible_header",
                style: "position: relative;user-select: none;"
            }).append("<span>Header HIDE</span>"),
            sort: $("<a>", { class: "btn hex red button_sort", id: "button_sort" })
            .append("<span>Sort</span>")
        };
        for (const [button_type, button_tmp] of Object.entries(button_bottom_dic)) {
            if (settings.valid_feature_deckHeader === false && ["header_visible"].indexOf(button_type) != -1) continue;
            $(area_bottom).append(button_tmp);
        }

        if (settings.valid_feature_deckHeader === true){
            toggleVisible_deckHeader(settings.default_visible_header);

            // deck header
            const header_ids_dic = { category: "dckCategoryMst", tag: "dckTagMst", comment: "biko" };
            ["category", "tag", "comment"].map(ctc_name => {
                const ctc_now = $(`#${header_ids_dic[ctc_name]}`);
                const isCT = ["category", "tag"].indexOf(ctc_name) != -1;
                const ctc_span = $("dt>span", (isCT) ? ctc_now.parent().parent().parent() : ctc_now.parent().parent());
                const button = $("<a>", {
                    class: `btn hex button_size_header ${ctc_name} ` + (isCT ? " isCT" : " isComment"),
                    type: "button", id: `button_size_header_${ctc_name}`,
                    style: "position: relative;user-select: none;"
                })
                    .append("<span>Size</span>");
                $(ctc_span).append(button);
                const ctc_ind_size = 0;
                changeSize_deckHeader(ctc_name, ctc_ind_size - 1)
            })
        }
        if (settings.valid_feature_deckEditImage === true){
            $("article").attr({oncontextmenu:"return false;"})
            const div_tablink=$("<div>", {class:"tablink tablink_deckSupport tablink_deckEdit", id:"mode_deckEdit"});
            const liInfo_dic={text:{class:"deck_edit_text", text:"Text"}, image:{class:"deck_edit_image", text:"Image"}};
            const ul_now=$("<ul>")
            const select_now=$("<select>", {class:"deck_display MouseUI", id:"deck_dispaly"})
            Object.entries(liInfo_dic).map(([key_text, liInfo]) => {
                const liIsSelected = (settings.default_deck_edit_image===true && key_text === "image") ||
                    (settings.default_deck_edit_image===true && key_text === "image");
                const li_tmp=$("<li>", {class:liInfo.class+ (liIsSelected ? " now" : ""), value:key_text });
                    const span_tmp=$("<span>").append(liInfo.text)
                li_tmp.append(span_tmp);
                ul_now.append(li_tmp);
                const option_tmp=$("<option>", {value:liInfo.text}).append(liInfo.text);
                select_now.append(option_tmp);
            })
            div_tablink.append(ul_now);
            div_tablink.append(select_now);

            const div_num_total=$("#num_total");
            div_num_total.append(div_tablink);

            const df=await obtainDF(obtainLang());
            const row_results=obtainRowResults_Input(df);
            //console.log(row_results)
            insertDeckImg(df, row_results, false);
            const key_show=settings.default_deck_edit_image ? "image": "text";
            operate_deckEditVisible(key_show);
        }
    }
    else if (["1", null].indexOf(html_parse_dic.ope) != -1) {
        // ## deck view
        //const settings=await getSyncStorage({settings: defaultString}).then(items=>JSON.parse(items.settings));
        //const edit_area = $("#header_box #button_place_edit"); // before 2022/4/18
        const edit_area = $("#bottom_btn_set"); // after 2022/4/18
        const area = (edit_area.length > 0) ? edit_area : $("<span>", { id: "bottom_btn_set" }).appendTo($("#deck_header"));
        //console.log(area)
        const button_dic = {
            export: $("<a>", { class: "btn hex red button_export", oncontextmenu:"return false;"  })
                .append("<span>Export (L:id/R:Name)</span>"),
            sort: $("<a>", { class: "btn hex red button_sort", id: "button_sort" })
                .append("<span>Sort & Save</span>"),
        };
        for (const [button_type, button_tmp] of Object.entries(button_dic)) {
            if (button_type === "sort" &&
                (my_cgid == null || html_parse_dic.cgid !== my_cgid) || settings.valid_feature_sortShuffle === false) continue;
            if (settings.valid_feature_importExport === false && ["import", "export"].indexOf(button_type) !== -1) continue;
            //if (settings.valid_feature_sideChange === false && ["sideChange"].indexOf(button_type) !== -1) continue;
            $(area).append(button_tmp);
        }
        if (settings.valid_feature_sortShuffle === true) {
            $("#deck_image div.card_set div.image_set a").css({"max-width":"6.5%"});
            $("#deck_image div.card_set").css({"margin":"0 0 20px"});
            const shuffle_span=$("<span>", {style: "border:none; line-height: 30px; min-width: fit-content;"})
                .append("L:Shuffle/R:Sort");
            const flex_dic={"main":2.7, "extra":4, "side":4}
            for (const set_type of ["main", "extra", "side"]){
                const span_tmp=$("<span>", {
                    style:`flex:${flex_dic[set_type]};border:none;`,
                    oncontextmenu:"return false;"
                })
                const shuffle_button= $("<a>", { class: "btn hex red button_shuffle",
                        set_type:set_type,
                        id: `button_shuffle_${set_type}`,
                        oncontextmenu:"return false;" })
                    .append($(shuffle_span).clone());
                const h3_tmp=$(`#${set_type}>div.subcatergory>div.top>h3`);
                $(h3_tmp).css({"min-width":"0"});
                $(h3_tmp).after(shuffle_button);
                $(shuffle_button).after(span_tmp);
            }
        }
        if (settings.valid_feature_sideChange===true) {
            const span_tmp=$("<span>", {style: "border:none; line-height: 30px; min-width: 180px;"})
            .append(`SideChange|L:Reset/R:OFF->on`);
            const button_sideChange=$("<a>", {
                class: `btn hex button_sideChange sideChange`,
                id: "button_sideChange",
                oncontextmenu:"return false;" })
                .append(span_tmp.clone());
            const h3_tmp=$("#deck_image #main div.subcatergory div.top>h3");
            const a_tmp=$("#deck_image #main div.subcatergory div.top>a");
            if (a_tmp.length>0){
                a_tmp.after(button_sideChange);
            } else {
                h3_tmp.after(button_sideChange);
            }

            const row_results=obtainRowResults();
            const df=await obtainDF(obtainLang());
            let count=0;
            for (const card_a of Array.from($("#deck_image div.card_set div.image_set a"))){
                const span=$("span:eq(0)", card_a);
                const img=$("img", span);
                const classInfo_tmp=$(img).attr("class").match(/card_image_([^_]+)_(\d+)_(\d+).*/);
                const classInfo={
                    type:classInfo_tmp[1],
                    ind1:classInfo_tmp[2],
                    ind2:classInfo_tmp[3]
                };
                const row_result=row_results[classInfo.type];
                const cid_now=row_result.cids[classInfo.ind1];
                const id_now= df_filter(df, "id", ["cid", cid_now])[0];
                const attr_dic={
                    card_name:row_result.names[classInfo.ind1],
                    card_cid:cid_now,
                    card_id:id_now,
                    card_type:classInfo.type
                }
                $(img).attr(attr_dic);
                $(img).css({position: "relative", width: "100%"});
                $(card_a).css({padding: "1px"});
                //$(span).css({"max-width": "6.5%", padding:"1px", "box-sizing":"border-box", display: "block"});
                //$(card_a).css({"max-width": "6.5%", padding:"1px", "box-sizing":"border-box", display: "block"});
                $(span).attr({a_span:count});
                $(card_a).attr({a_span:count});
                count +=1;
            }
            Array.from($("#deck_image div.card_set")).map(card_set =>{
                const image_set=$("div.image_set", card_set);
                $(image_set).attr({"set_type":$(card_set).attr("id")});
            })
            if (settings.default_sideChange_view===true) operateSideChangeMode("toggle");
            //const card_class_arr=
            //    .map(d=>$("img", d).attr("class").match(/card_image_([^_]+)_(\d+)_(\d+).*/)).map(d=>Object({type:d[1], ind1:d[2], ind2:d[3]}));
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

    // # button clicked
    document.addEventListener("click", async function (e) {
        if ($(e.target).is("a.button_size_header, a.button_size_header *")) {
            const button = $([$(e.target).children(), e.target]
                .filter(d => $(d).length > 0)
            [0]).parents("a.button_size_header");
            const ctc_name = $(button).prop("id").match("button_size_header_(.*)")[1];
            changeSize_deckHeader(ctc_name);
        } else if ($(e.target).is(".tablink_deckSupport ul *")) {
            const tablink_now=$(e.target).parents(".tablink_deckSupport")[0];
            const ul_now=$("ul", tablink_now);
            const li_now=$(e.target).is("li") ? e.target : $(e.target).parents("li")[0];
            Array.from($("li", ul_now)).map(li_tmp=>{
                if (li_tmp==li_now) $(li_tmp).addClass("now");
                else $(li_tmp).removeClass("now");
            });
            const key_show=$(li_now).attr("value");
            operate_deckEditVisible(key_show);
        }
    });
    // ## mousedown
    const df=await obtainDF(obtainLang());
    document.addEventListener("mousedown", async function (e){
        const sideChangeOnViewIsValid=["1", null].indexOf(html_parse_dic.ope) != -1 &&
            settings.valid_feature_sideChange === true &&
            $("#button_sideChange").length>0 &&
            $("#button_sideChange").hasClass("on");
        if ($(e.target).is("a.button_export, a.button_export *")) {
            const form = (e.button===0) ? "id" : "name";
            console.log(`export deck as ${form}`)
            await exportAs(form);
        } else if ($(e.target).is("a.button_shuffle, a.button_shuffle *")){
            const mode_shuffle = (e.button===0) ? "shuffle" : "sort";
            const button_target=$(e.target).is("a.button_shuffle") ? $(e.target) : $(e.target).parents("a.button_shuffle")[0];
            const set_type=$(button_target).attr("set_type");
            shuffleCards(mode_shuffle, set_type);
        }  else if ($(e.target).is("a.button_sideChange, a.button_sideChange *")){
            const mode_sideChange = (e.button===2) ? "toggle" : "reset";
            operateSideChangeMode(mode_sideChange, df);

        } else if ($(e.target).is("div.image_set span:has(img) *")) {
            e.preventDefault();
            if (!$(e.target).is("div.image_set_MouseUI *") && !sideChangeOnViewIsValid) return;
            const row_results=obtainRowResults_Input(df);
            const span_tmp = $(e.target).is("div.image_set span:has(img)") ? e.target : $(e.target).parents("div.image_set span:has(img)")[0];
            const img_target = $("img", span_tmp);
            const cid_now=parseInt($(img_target).attr("card_cid"));
            const set_type=$(img_target).parents("div.image_set").attr("set_type");
            const row_type=judgeCardType(df, ["cid", cid_now], "row");
            const num_now= sideChangeOnViewIsValid ?
             $(`#deck_image .image_set span:has(img[card_cid='${cid_now}']):not(.del_card)`).length :
                Object.values(row_results).map((d, ind)=>{
                const ind_fromCid=d.cids.indexOf(cid_now);
                if (ind_fromCid!==-1) return d.nums[ind_fromCid];
                else return null;
            }).filter(d=>d!==null).map(d=>parseInt(d)).concat([0]).reduce((acc,cur)=>acc+cur);
            /*const cardInfo={
                name:$(img_target).attr("card_name"),
                cid:cid_now,
                id:$(img_target).attr("card_id"),
                num:num_now
            }*/
            const change_dic={2:-1, 1:+1}
            if ([1,2].indexOf(e.button)!==-1) {
                const change_now=change_dic[e.button];
                const row_type_modified = (set_type === "main") ? row_type : set_type;
                const row_results_new=operateRowResults(row_results, cid_now, change_now, row_type_modified, df);
                importDeck(row_results_new);
                if (num_now+change_now<=3) modifyDeckImg(img_target, change_now);
                //insertDeckImg(df, row_results_new);
            } else if (e.button===0 && $(e.target).is("#deck_image .image_set *")) {
                const onEdit = !sideChangeOnViewIsValid;
                const row_results_new = sideChange_deck(df, img_target, onEdit);
            }
        }

        if (sideChangeOnViewIsValid===true) updateDeckCountView();
        // remove additional script
        $(`script[type='text/javascript']:gt(${script_initial_count - 1})`).remove();
    })
    // ## button id
    $("#button_importFromYdk").on("change", async function () {
        await importFromYdk();
    });
    $("#button_sort").on("click", async function () {
        await sortClicked();
    });

    $("#button_visible_header").on("click", function () {
        toggleVisible_deckHeader();
    });
    $("#button_sort").on("click", async function (){
        const row_results=obtainRowResults_Input(df);
        //console.log(row_results)
        const MouseUIIsVisible=$(".tablink_deckEdit ul li.deck_edit_image").hasClass("now");
        insertDeckImg(df, row_results, MouseUIIsVisible);
    })
    // ## trigger
    window.addEventListener("message", async function (e) {
        const content = e.data;
        if (!/^trigger_/.test(content)) return;
        //console.log(content);
        if (/_sortCard/.test(content)) {
            const json_dumped = content.replace("trigger_sortCard_", "");
            const row_results_new = JSON.parse(json_dumped);
            //const row_results_new=await sortCards(row_results);
            //console.log(row_results_new);
            const row_names = ["monster", "spell", "trap", "extra", "side"];
            const row_str_new = JSON.stringify(row_names
                .map(row_name => ({ [row_name]: { names: row_results_new[row_name].names, nums: row_results_new[row_name].nums.map(d => parseInt(d)) } })))
            while (true) {
                importDeck(row_results_new);
                const row_results = obtainRowResults_Input();
                const row_str = JSON.stringify(row_names
                    .map(row_name => ({ [row_name]: { names: row_results[row_name].names, nums: row_results[row_name].nums } })))
                if (row_str == row_str_new) {
                    const regist_btn = $("#btn_regist>span");
                    const save_text = regist_btn.text();
                    //document.querySelector("#btn_regist").classList.remove("orn");
                    //$("#btn_regist").toggleClass("orn");
                    //$("#btn_regist").toggleClass("pnk");
                    //regist_btn.text(save_text + " (CLICK HERE)");
                    await _Regist_fromYGODB().then(async _ => {
                        await sleep(500);
                        window.opener.postMessage("trigger_closeWindow", "*");
                    });
                    //console.log("Sorted. Please save and close.");
                    //console.log(window.opener);
                    //window.opener.postMessage("trigger_closeWindow", "*");
                    //Regist() // function on YGO
                    // message on HTML
                    /*document.addEventListener("click", async function (e) {
                        if ($(e.target).is("#btn_regist *")) {
                            window.opener.postMessage("trigger_closeWindow", "*");
                        }
                    })*/
                    break;

                } else await sleep(500);
            };
        }
        if (/_closeWindow/.test(content)) {
            setTimeout(() => { e.source.close() }, 200);
            setTimeout(() => { location.reload() }, 1000);
        }
    })
});
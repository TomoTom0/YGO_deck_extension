"use strict";

// -----------------------------
//           # initial
const repoInfoEmpty = { user: "", repo: "", path: "" }
const defaultEmptyRepoInfo = Object.assign(...["CDB", "ConstantLua", "StringsConf", "CardScripts"]
    .map(d => { return { [d]: repoInfoEmpty } }));
const defaultRepoStrings = JSON.stringify(defaultEmptyRepoInfo);

const defaultRepoInfo = {
    CDB: { user: "ProjectIgnis", repo: "BabelCDB", path: "" },
    ConstantLua: { user: "NaimSantos", repo: "DataEditorX", path: "DataEditorX/data/constant.lua" },
    StringsConf: { user: "NaimSantos", repo: "DataEditorX", path: "DataEditorX/data/strings.conf" }
}

const getSyncStorage = (key = null) => new Promise(resolve => {
    chrome.storage.sync.get(key, resolve);
});

const setSyncStorage = (key = null) => new Promise(resolve => {
    chrome.storage.sync.set(key, resolve);
});

const operateStorage=(key = null, storageKey="sync", operate="get") => new Promise(resolve => {
    chrome.storage[storageKey][operate](key, resolve);
});

const obtainDF=async ()=>{
    return await operateStorage({df:JSON.stringify({})}, "local").then(items=>JSON.parse(items.df));
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function gitFetch(url, opts={}){
    if (!url || typeof opts!=="object") return {status:false};
    const res=await fetch(url,opts).then(d=>d.json());
    if (/^API rate limit/.test(res.message)){
        await sleep(60*1000);
        return await fetch(url, opts);
    } else {
        return {json:()=>res};
    }
}
// -----------------------------
//           # parse text
function split_data(data) {
    const split_sep = "__SPLIT__";
    return data.replace(/\r\n|\r|\n/g, split_sep).split(split_sep);
}

function df_filter(df, col_out, array_in, condition = "=") {
    const key = array_in[0];
    const val = Array.isArray(array_in[1]) ? array_in[1] : [array_in[1]];
    if (df == {} && Array.isArray(col_out)) return col_out.reduce((acc, key) => Object.assign(acc, { [key]: [] }), {});
    else if (df == {}) return [];

    const indexes_in = df[key].reduce((acc, cur, ind) => {
        if (condition == "=" && val.indexOf(cur) != -1) return acc.concat([ind]);
        else if (condition == "in" && val.some(d => cur.indexOf(d) != -1)) return acc.concat([ind]);
        else return acc;
    }, []);
    if (Array.isArray(col_out)) {
        const dics = col_out.map(key => { return { [key]: Array.from(new Set(indexes_in)).map(d => df[key][d]) }; });
        return Object.assign(...dics);
    }
    else return Array.from(new Set(indexes_in)).map(d => df[col_out][d]);
}

function remake_df(df) {
    const ids_all = df.id;
    const ids = Array.from(new Set(df.id));
    const id_inds = ids.map(id => ids_all.indexOf(id));
    return Object.assign(...Object.entries(df).map(kv => {
        return { [kv[0]]: id_inds.map(ind => kv[1][ind]) }
    }))
}

// -----------------------------
//           # DB update
async function updateDB(args = { display: "", settings: defaultSettings, repoInfos: defaultEmptyRepoInfo }) {
    //const display=args.display;
    const df_new = await combineDf(args);
    console.log("Database has been updated.");
    await operateStorage({ df: JSON.stringify(df_new), lastModifiedDate: Date.now() }, "local", "set");
    console.log(df_new);
    return df_new;
}
//           ## combine DF
async function combineDf(args = { display: "", settings: defaultSettings, repoInfos: defaultEmptyRepoInfo }) {
    const display = args.display;
    const defaultDisplay = (!display) ? "" : $(display).text();

    const db_pulled = await pullCDB(args);
    const datas_tmp = db_pulled.datas;
    const texts_tmp = db_pulled.texts;
    const datas = remake_df(datas_tmp);
    const texts = remake_df(texts_tmp);

    const constantLua = await readConstantLua(args);
    if (display) $(display).text(defaultDisplay + `\t2/3`);
    const stringsConf = await readStringsConf(args);
    if (display) $(display).text(defaultDisplay + `\t3/3`);
    //console.log(stringsConf, constantLua)

    const ot_array=["OCG", "TCG", "OCG/TCCG", "ANIME"]
    const card_ids = datas.id.map(id=>id-0);
    const card_ots = datas.ot.map(ot=>ot_array[ot-1]);
    const card_names = texts.name
    /*const card_ids_onlyOCG=card_ots.map((ot, ind)=>[ot, card_ids[ind]]).filter(d=>d[0]=="OCG").map(d=>d[1]);
    const card_names_onlyOCG=await obtainCardNameFromScript(card_ids_onlyOCG);
    const card_names = texts.name.map((nameTmp, ind)=>{
        if (card_ots[ind]=="OCG") return card_names_onlyOCG[card_ids[ind]];
        else return nameTmp;
    });*/
    const card_keys = { complex: ["attribute", "race","type"], others: ["atk", "def"] };
    const card_values = {
        complex: Object.assign(...card_keys.complex.map(key => convertCDBData(key, datas, constantLua))),
        others: Object.assign(...card_keys.others.map(key => Object({ [key]: datas[key] })))
    }
    if (display) $(display).text(defaultDisplay + `\t4`);

    const card_sets = convertSetcode("setcode", datas, stringsConf, "setname")["setname"];
    const PSLevel = datas.level.map(level => (level - 0).toString("16").split("").reverse());
    const card_levels = PSLevel.map(d => {
        if (parseInt(d[0],16) > 0) return parseInt(d[0],16) - 0;
        else return "NaN";
    })
    const card_PS = PSLevel.map(d => {
        if (d.length > 2 ) return parseInt(d[4], 16) - 0;
        else return "NaN";
    })
    const ids_Link = df_filter({ id: card_ids, type: card_values.complex.type }, "id", ["type", "LINK"], "in");
    const ind_isLink = card_ids.map(id => ids_Link.indexOf(id) != -1);
    const card_def = card_values.others.def.map((def, ind) => {
        if (ind_isLink[ind]) return "NaN";
        else return def;
    });

    const LMarker_info = ["LD", "D", "RD", "R", "", "L", "LU", "U", "RU"]
    const card_LMarker = card_values.others.def.map((def, ind) => {
        if (ind_isLink[ind]) return def.toString("2").split("").reverse().reduce((acc, cur, i) => {
            if (cur == 1) return acc.concat([LMarker_info[i]]);
            else return acc;
        }, []).join(",");
        else return "NaN";
    });;

    const df_tmp = [{ level: card_levels, name: card_names}, card_values.complex,
         {atk: card_values.others.atk, def: card_def, set: card_sets, PS: card_PS, LMarker: card_LMarker, ot: card_ots ,id: card_ids }];
    const df_new = Object.assign(...df_tmp);

    return df_new;
}

// ## DB sub functions
function convertCDBData(key, datas, cardinfo, keyInfo = "") {
    if (!keyInfo) keyInfo = key;
    const card_values = datas[key].map(num => {
        const val = (num - 0).toString("2")
            .split("").reverse()
            .reduce((acc, cur, ind, src) => {
                const key_tmp = (2 ** ind).toString("2");
                if (cur == 1) {
                    return acc.concat([cardinfo[keyInfo][key_tmp]]);
                }
                else return acc;
            }, []).join(",");
        return (val == "") ? "NaN" : val;
    });
    return { [keyInfo]: card_values };
}

function convertSetcode(key, datas, cardinfo, keyInfo = "") {
    if (!keyInfo) keyInfo = key;
    const card_values = datas[key].map(num => {
        const val_tmp = (num - 0).toString("16")
            .split("").reverse();
        const val = [...Array(Math.floor((val_tmp.length - 1) / 3) + 1).keys()]
            .reduce((acc, ind) => {
                const key_tmp = val_tmp.slice(0, Math.min(3 * (ind + 1), val_tmp.length))
                    .reverse().join("");
                const key_converted = parseInt(key_tmp, 16).toString("2");
                if (Object.keys(cardinfo[keyInfo]).indexOf(key_converted) != -1) {
                    return acc.concat([cardinfo[keyInfo][key_converted]]);
                }
                else return acc;
            }, []).join(",");
        return (val == "") ? "NaN" : val;
    });
    return { [keyInfo]: card_values };
}

// -------------------------------------------
//           # download from GitHub
//           ## pull CDB
async function pullCDB(args = { display: "", settings: defaultSettings, repoInfos: defaultEmptyRepoInfo }) {
    const repoInfo = (!args.settings.changeCDBRepo) ? defaultRepoInfo.CDB : args.repoInfos.CDB;
    const display = args.display;
    const defaultDisplay = (!display) ? "" : $(display).text();
    // init SQL
    const SQL = await initSqlJs({ locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.4.0/dist/${file}` });

    //search cdb list
    const q = "filename:*.cdb -filename:*-rush*.cdb -filename:*-skills*.cdb -filename:*unofficial*.cdb -filename:*goat*.cdb";
    const git_search_url = `https://api.github.com/search/code`;
    const header_auth = { "Accept": "application/vnd.github.v3+json" };
    const search_query = `q=${q}+repo:${repoInfo.user}/${repoInfo.repo}` + (repoInfo.path == "" ? "" : `${repoInfo.path} in:path`);
    const res_search = await gitFetch(git_search_url + "?" + search_query, { method: "GET", headers: header_auth })
        .then(d => d.json()).then(async res => {
            if (res.status && res.total_count > 0) return res;
            const repoInfo2 = defaultRepoInfo.CDB;
            const search_query = `q=${q}+repo:${repoInfo2.user}/${repoInfo2.repo}` + (repoInfo2.path == "" ? "" : `${repoInfo2.path} in:path`);
            return await gitFetch(git_search_url + "?" + search_query, { method: "GET", headers: header_auth }).then(d => d.json())
        });
    // pull CDB and merge
    let values = { datas: [], texts: [] };
    let datas_tmp = {};
    let texts_tmp = {};
    for (const item_tmp of Object.entries(res_search.items)) {
        const ind_item = item_tmp[0];
        if (display) $(display).text(defaultDisplay + `\t1/3 - ${ind_item} / ${res_search.items.length}`);

        const item = item_tmp[1];
        const cdb_data = await gitFetch(item.git_url).then(d => d.json());
        console.log(cdb_data)
        const db_tmp = new SQL.Database(atob(cdb_data.content));

        datas_tmp = await db_tmp.exec("select * from datas")[0];
        texts_tmp = await db_tmp.exec("select * from texts")[0];
        if (!datas_tmp && !texts_tmp) continue;
        values.datas.push(datas_tmp.values);
        values.texts.push(texts_tmp.values);
    }
    // remake into dict
    const values_merged = ["datas", "texts"].map(tab => [].concat(...values[tab]));
    const datas_merged = datas_tmp.columns.reduce((acc, cur, ind) => Object.assign(acc, { [cur]: values_merged[0].map(d => d[ind]) }), {});
    const texts_merged = texts_tmp.columns.reduce((acc, cur, ind) => Object.assign(acc, { [cur]: values_merged[1].map(d => d[ind]) }), {});
    if (display) $(display).text(defaultDisplay + `\t1/3 - ${res_search.items.length} / ${res_search.items.length}`);
    return { datas: datas_merged, texts: texts_merged };
}

async function readConstantLua(args = { display: "", settings: defaultSettings, repoInfos: defaultEmptyRepoInfo }) {
    const repoInfo = (!args.settings.changeConstantLuaRepo) ? defaultRepoInfo.ConstantLua : args.repoInfos.ConstantLua;
    const header_auth = { "Accept": "application/vnd.github.v3+json" };

    const git_content_url = `https://api.github.com/repos/${repoInfo.user}/${repoInfo.repo}/contents/${repoInfo.path}`;
    const git_url = await gitFetch(git_content_url, { method: "GET", headers: header_auth })
        .then(d => d.json()).then(async d => {
            if (d.git_url) return d.git_url;
            const repoInfo2 = defaultRepoInfo.ConstantLua;
            const git_content_url2 = `https://api.github.com/repos/${repoInfo2.user}/${repoInfo2.repo}/contents/${repoInfo2.path}`;
            return await gitFetch(git_content_url2, { method: "GET", headers: header_auth }).then(d => d.json()).then(d => d.git_url);
        });
    //if (!res_content.git_url) return "";
    const contents = await gitFetch(git_url, { method: "GET", headers: header_auth }).then(d => d.json())
        .then(d => atob(d.content))
        .then(d => split_data(d));
    const obtainKeys = ["type", "race", "attribute"];
    const cardinfo = contents.reduce((acc, cur) => {
        const key_tmp = (/^--/.test(cur)) ? "" : cur.split("_")[0].toLowerCase();
        if (/^--/.test(cur) || obtainKeys.indexOf(key_tmp) == -1) return acc;
        //if (Object.keys(acc).indexOf(key_tmp) == -1) acc = Object.assign(acc, { [key_tmp]: {} });
        const key = cur.split("=")[0].slice(key_tmp.length + 1).replace(/\s*$/, "");
        const val = cur.split("=")[1];

        acc[key_tmp][parseInt(val, 16).toString(2)] = key;
        return acc;
    }, Object.assign(...obtainKeys.map(d => Object({ [d]: {} }))));
    return cardinfo;
}

async function readStringsConf(args = { display: "", settings: defaultSettings, repoInfos: defaultEmptyRepoInfo }) {
    const repoInfo = (!args.settings.changeStringsConfRepo) ? defaultRepoInfo.StringsConf : args.repoInfos.StringsConf;
    const header_auth = { "Accept": "application/vnd.github.v3+json" };

    const git_content_url = `https://api.github.com/repos/${repoInfo.user}/${repoInfo.repo}/contents/${repoInfo.path}`;
    const git_url = await gitFetch(git_content_url, { method: "GET", headers: header_auth })
        .then(d => d.json()).then(async d => {
            if (d.git_url) return d.git_url;
            const repoInfo2 = defaultRepoInfo.StringsConf;
            const git_content_url2 = `https://api.github.com/repos/${repoInfo2.user}/${repoInfo2.repo}/contents/${repoInfo2.path}`;
            return await gitFetch(git_content_url2, { method: "GET", headers: header_auth }).then(d => d.json()).then(d => d.git_url);

        });
    //if (!res_content.git_url) return "";
    const contents = await gitFetch(git_url, { method: "GET", headers: header_auth }).then(d => d.json())
        .then(d => atob(d.content))
        .then(d => split_data(d));
    const obtainKeys = ["setname"];
    const cardinfo = contents.reduce((acc, cur) => {
        const key_tmp = (/^[^!]/.test(cur)) ? "" : cur.split(" ")[0].slice(1);
        if (/^[^!]/.test(cur) || obtainKeys.indexOf(key_tmp) == -1) return acc;

        //if (Object.keys(acc).indexOf(key_tmp) == -1) acc = Object.assign(acc, { [key_tmp]: {} });
        const key = cur.split(" ")[1];
        const val = cur.split(" ").slice(2).join(" ");
        acc[key_tmp][parseInt(key, 16).toString(2)] = val;
        return acc;
    }, Object.assign(...obtainKeys.map(d => Object({ [d]: {} }))));
    return cardinfo;
}

// ## obtain card info from ocg-card.com
async function obtainFromOCGcard (args={form:"id", input:{}}){
    const formDic={id:"pass", name:"name"};
    const form=formDic[args.form||"id"];
    if (typeof args.input!=="object") return {};
    const query=Object.values(args.input).map((val, ind)=>`${form}_${ind}=${val}&${form}-op_${ind}=3`).join("&");
    const url=`https://ocg-card.com/list/result/?${query}`;
    const reader = await fetch(url).then(d => d.body)
        .then(d => d.getReader());
    const contents = await readStream(reader, []).then(d=>d.join(""))
    const results = $("tr.status-height, tr.spell-height", $(contents)).map((ind,obj)=>{
        const cardName = $("td:eq(1)", $(obj)).html().replace(/<div.*\/div>/, "");
        const cardId = $("td:eq(3)", $(obj) ).html().match(/\d+/);
        const cid_db = ($("td.card-info", $(obj)).html()||`<a href="cid=0">公式`).match(/(?<=<a href="[^"]*cid=)\d+(?=[^"]*">公式)/)[0];
        return {id: (cardId||[""])[0], name:cardName, cid:cid_db};
    }).toArray();

    return Object.assign(...results
        .filter(d=>form==="pass" || Object.keys(args.input).indexOf(form==="pass" ? d.id : d.cid)!=-1)
        .map(d=>({[form==="pass" ? d.id : d.cid]:d})).concat({}) );
}


// ## obtain card Name from script
async function obtainCardNameFromScript(cardIds=[], args = { display: "", settings: defaultSettings, repoInfos: defaultEmptyRepoInfo }) {
    if (cardIds.length==0) return [];
    //const repoInfo = (!args.settings.changeStringsConfRepo) ? defaultRepoInfo.StringsConf : args.repoInfos.StringsConf;
    const repoInfo = defaultRepoInfo.CardScripts;

    const fileNames = cardIds.map(id=>`c${id}.lua`);
    const res_gitUrls=await Promise.all(fileNames.map(async filename=>{
        const header_auth = { "Accept": "application/vnd.github.v3+json" };
        const git_content_url = `https://api.github.com/repos/${repoInfo.user}/${repoInfo.repo}/contents/official/${filename}`;
        return await gitFetch(git_content_url, { method: "GET", headers: header_auth }).then(d => d.json());
    }));

    const cardNameDics = await Promise.all(res_gitUrls
        .map(async (resIn, ind)=>{
            const data = await gitFetch(resIn.git_url).then(d => d.json()).then(res=>atob(res.content));
            if (!data || !restIn.name) return "";
            else {
                const cardId=(resIn.name||fileNames[ind]).match(/(?<=c)\d+(?=\.lua)/);
                const cardNameTmp=split_data(data)[0].replace(/^[-\s]*/, "");
                return {[cardId - 0] :decodeURI(escape(cardNameTmp))};
            };
        }));
    console.log(cardNameDics);
    return Object.assign(...cardNameDics.concat({}));
}


$(async function(){
    await operateStorage({df:JSON.stringify({})}, "sync", "set");
})
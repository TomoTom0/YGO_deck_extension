
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

// DB update
async function updateDB() {
    const db_pulled = await pullCDB();
    const datas = db_pulled.datas;
    const texts = db_pulled.texts;
    const cardinfo = await obtainCardInfo();

    const card_ids = Array.from(new Set(datas.id));
    const card_names_Eng = card_ids.map(id => df_filter(texts, "name", ["id", id])[0]);
    const card_keys = { complex: ["type", "attribute", "race"], others: ["atk", "def"] };
    const card_values = {
        complex: card_keys.complex.reduce((acc, key) => Object.assign(acc, convertCDBData(card_ids, key, datas, cardinfo)), {}),
        others: card_keys.others.reduce((acc, key) => Object.assign(acc, { [key]: card_ids.map(id => df_filter(datas, key, ["id", id])[0]) }), {})
    }
    const card_sets = convertSetcode(card_ids, "setcode", datas, cardinfo, "setname")["setname"];
    const PSLevel = card_ids.map(id => df_filter(datas, "level", ["id", id])[0])
        .map(level => (level - 0).toString("16").split(""));
    const card_levels = PSLevel.map(d => {
        if (d[0] > 0) return d[0] - 0;
        else return "NaN";
    })
    const card_PS = PSLevel.map(d => {
        if (d.length == 2 && d[1] > 0) return parseInt(d[1], 16) - 0;
        else return "NaN";
    })
    const ids_Link = df_filter({id: card_ids, type: card_values.complex.type}, "id", ["type", "Link"], "in");
    const ind_isLink = card_ids.map(id => ids_Link.indexOf(id) != -1);
    const card_def = card_values.others.def.map((def, ind) => {
        if (ind_isLink[ind]) return "NaN";
        else return def;
    });
    const LMarker_info = ["LD", "D", "RD", "R", "" ,"L", "LU", "U", "RU"]
    const card_LMarker = card_values.others.def.map((def, ind) => {
        if (ind_isLink[ind]) return def.toString("2").split("").reverse().reduce((acc, cur, i) => {
            if (cur == 1) return acc.concat([LMarker_info[i]]);
            else return acc;
        }, []).join(",");
        else return "NaN";
    });;

    const df_tmp = [{ level: card_levels, Eng: card_names_Eng, atk: card_values.others.atk, def: card_values.others.def, set: card_sets, PS: card_PS, LMarker: card_LMarker }, card_values.complex, { id: card_ids }];
    const df_new = Object.assign(...df_tmp);
    console.log("Database has been updated.");
    chrome.storage.local.set({ df: JSON.stringify(df_new), lastModifiedDate: Date.now() });
    console.log(df_new)
    return df_new;
}

function convertCDBData(card_ids, key, datas, cardinfo, keyInfo = "") {
    if (!keyInfo) keyInfo = key;
    const card_values = card_ids.map(id => df_filter(datas, key, ["id", id])[0])
        .map(num => {
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

function convertSetcode(card_ids, key, datas, cardinfo, keyInfo = "") {
    if (!keyInfo) keyInfo = key;
    const card_values = card_ids.map(id => df_filter(datas, key, ["id", id])[0])
        .map(num => {
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


// download from GitHub
async function pullCDB() {
    // init SQL
    const SQL = await initSqlJs({ locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.4.0/dist/${file}` });

    //search cdb list
    const GitHubName = "ProjectIgnis";
    const GitHubRepo = "BabelCDB";
    const q = "filename:*.cdb -filename:*-rush*.cdb -filename:*-skills*.cdb -filename:*unofficial*.cdb -filename:*goat*.cdb";
    const git_search_url = `https://api.github.com/search/code`;
    const search_query = `q=${q}+repo:${GitHubName}/${GitHubRepo}`;
    const header_auth = { "Accept": "application/vnd.github.v3+json" };
    const res_search = await fetch(git_search_url + "?" + search_query, { method: "GET", headers: header_auth }).then(d => d.json());
    // pull CDB and merge
    let values = { datas: [], texts: [] };
    let datas_tmp = {};
    let texts_tmp = {};
    for (const item of res_search.items) {
        const cdb_data = await fetch(item.git_url).then(d => d.json());
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

    return { datas: datas_merged, texts: texts_merged };
}

async function obtainCardInfo() {
    const GitHubName = "NaimSantos";
    const GitHubRepo = "DataEditorX";
    const GitHubFilePath = "DataEditorX/data/cardinfo_english.txt";
    const header_auth = { "Accept": "application/vnd.github.v3+json" };

    const git_content_url = `https://api.github.com/repos/${GitHubName}/${GitHubRepo}/contents/${GitHubFilePath}`;
    const res_content = await fetch(git_content_url, { method: "GET", headers: header_auth }).then(d => d.json());
    //if (!res_content.git_url) return "";
    const contents = await fetch(res_content.git_url, { method: "GET", headers: header_auth }).then(d => d.json())
        .then(d => atob(d.content))
        .then(d => split_data(d));
    let last_key = "";
    const cardinfo = contents.reduce((acc, cur) => {
        if (/^##[^#]/.test(cur)) {
            last_key = cur.replace(/^##/, "");
            return Object.assign(acc, { [last_key]: [] });
        }
        else if (/^[^#]/.test(cur)) {
            const splited = /\t/.test(cur) ? cur.split(/\t/) : cur.split(" "); // tsvなのにspace区切りされてる……
            acc[last_key][parseInt(splited[0], 16).toString(2)] = splited[1].replace(/\s*$/, "");
            return acc;
        }
        else return acc;
    }, {});
    return cardinfo;
}



defaultRepoInfo = {
    CDB: { user: "ProjectIgnis", repo: "BabelCDB", path: "" },
    antLua: { user: "NaimSantos", repo: "DataEditorX", path: "DataEditorX/data/ant.lua" },
    StringsConf: { user: "NaimSantos", repo: "DataEditorX", path: "DataEditorX/data/strings.conf" },
    CardScripts: { user: "ProjectIgnis", repo: "CardScripts", path: "" }
}

repoInfo = defaultRepoInfo.CardScripts;

//q = [10000].map(id=>`filename:c${id}.lua`).join(" ");
q = `filename:*.lua`;
git_search_url = `https://api.github.com/search/code`;
header_auth = { "Accept": "application/vnd.github.v3+json" };
search_query = `q=${q}+repo:${repoInfo.user}/${repoInfo.repo}`;
res_search = await fetch(git_search_url + "?" + search_query, { method: "GET", headers: header_auth })
    .then(d => d.json()).then(async res => {
        if (res.status && res.total_count > 0) return res;
        repoInfo2 = defaultRepoInfo.CardScripts;
        search_query = `q=${q}+repo:${repoInfo2.user}/${repoInfo2.repo}` + (repoInfo2.path == "" ? "" : `${repoInfo2.path} in:path`);
        return await fetch(git_search_url + "?" + search_query, { method: "GET", headers: header_auth }).then(d => d.json())
    });

const obtainSearchResult = async (ids) => {
    const q = cardIds.map(id => `filename:c${id}.lua`).join(" ");
    const git_search_url = `https://api.github.com/search/code`;
    const header_auth = { "Accept": "application/vnd.github.v3+json" };
    const search_query = `q=${q}+repo:${repoInfo.user}/${repoInfo.repo}` + (repoInfo.path == "" ? "" : `${repoInfo.path} in:path`);
    const res_search = await fetch(git_search_url + "?" + search_query, { method: "GET", headers: header_auth })
        .then(d => d.json()).then(async res => {
            if (res.status && res.total_count > 0) return res;
            const repoInfo2 = defaultRepoInfo.CardScripts;
            const search_query = `q=${q}+repo:${repoInfo2.user}/${repoInfo2.repo}` + (repoInfo2.path == "" ? "" : `${repoInfo2.path} in:path`);
            return await fetch(git_search_url + "?" + search_query, { method: "GET", headers: header_auth }).then(d => d.json());
        });
}
const cycleNum = Math.floor(cardIds.length / 5) + 1;
cardIdsSplited = [...Array(cycleNum).keys()].map(cycle => cardIds.slice(cycle * 5, (cycle + 1) * 5));
res_search = await Promise.all(cardIdsSplited.map(cardIdsTmp => await obtainSearchResult(cardIdsTmp))).then(dics => Object.assign(...dics.concat({})));

values = await Promise.all(Object.entries(res_search.items)
    .map(async item_tmp => {
        const ind_item = item_tmp[0];
        const item = item_tmp[1];
        const data = await fetch(item.git_url).then(d => d.json()).then(res => atob(res.content));
        if (!data) return "";
        else {
            const cardNameTmp = data.split("\n")[0].replace(/^[-\s]*/, "");
            return decodeURI(escape(cardNameTmp));
        };
    }))


/*
1=Ocg
2=Tcg
3=Ocg/Tcg
4=Anime
*/


url = `https://ocg-card.com/list/result/?name_0=${name_tmp}&name-op_0=1`

id_tmp = 10024317

url = `https://ocg-card.com/list/result/?pass_0=${id_tmp}&pass-op_0=1`

url = "https://ocg-card.com/list/dbag/"
obtainContent = res => new TextDecoder("utf-8").decode(res.value);

a = await reader.read();
b = reader.read();
content = obtainContent(a)

async function readStream(reader, contents = []) {
    return await reader.read().then(({ done, value }) => {
        if (done) {
            return contents;
        }
        const content = new TextDecoder("utf-8").decode(value);
        contents.push(content)
        return readStream(reader, contents);
    }).then(d=>d.join(""));
}

a=[[{1:1}, {3:3}], [{2:2}]]
b=a.

id_tmp = 10024317
url = `https://ocg-card.com/list/result/?pass_0=${id_tmp}&pass-op_0=3&pass_1=58549532&pass-op_1=3`
reader = await fetch(url, {mode:"cors", headers:{}}).then(d => d.json())
    .then(d => d.getReader())
contents = await readStream(reader, []).then(d => d.join(""))

url = "https://ocg-card.com/list/dbag/"
content = await fetch(url).then(d => d.body)
    .then(d => d.getReader())
    .then(async reader => await reader.read())
    .then(res => new TextDecoder("utf-8").decode(res.value));

tr_first = $("tr.status-height, tr.spell-height", content).eq(0)

cardname = $("tr.status-height:first td:eq(1)").text();
cardname = $("td:eq(1)", tr_first).html().replace(/<div.*\/div>/, "")
cardId = $("td:eq(3)", tr_first).html()

cid_db = $("td.card-info", tr_first).html().match(/(?<=<a href="[^"]*cid=)\d+(?=[^"]*">公式)/, "")[0]
// https://ocg-card.com/list/result/?name_0=XXX&name-op_0=3&name_1=XXX&name-op_1=3
async function readStream(reader, contents = []) {
    return await reader.read().then(async ({ done, value }) => {
        if (done) {
            return contents;
        }
        const content = new TextDecoder("utf-8").decode(value);
        contents.push(content)
        return await readStream(reader, contents);
    });
}
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
        return {id:(cardId||[""])[0], name:cardName, cid:cid_db};
    }).toArray();

    return Object.assign(...results.filter(dic=>Object.keys(args.input).indexOf(dic.cid)!=-1).map(d=>({[d.cid]:d})).concat({}) );
}

res=await obtainFromOCGcard({form:"id", input:{15100:47897376}})

a=[4,4,4,4]
for(const k of reader.headers.entries()){
    console.log(k)
}

"https://db.ygoprodeck.com/api/v7/cardsets.php"
url = `https://ocg-card.com/?p=1328`
res = await fetch(url, {mode:"cors", headers:{}}).then(d => d.json())

url = `https://db.ygoprodeck.com/api/v7/cardinfo.php?format=OCG`
res = await fetch(url, {mode:"cors", headers:{}}).then(d => d.json())

id_tmp = 56058749
url = `https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${id_tmp}&misc=yes`
res = await fetch(url, {mode:"cors", headers:{}}).then(d => d.json())

git_search_url = `https://api.github.com/rate_limit`;
header_auth = { "Accept": "application/vnd.github.v3+json" };
res_search = await fetch(git_search_url, { method: "GET", headers: header_auth }).then(d => d.json())

defaultRepoInfo = {
    CDB: { user: "ProjectIgnis", repo: "BabelCDB", path: "" },
    antLua: { user: "NaimSantos", repo: "DataEditorX", path: "DataEditorX/data/ant.lua" },
    StringsConf: { user: "NaimSantos", repo: "DataEditorX", path: "DataEditorX/data/strings.conf" },
    CardScripts: { user: "ProjectIgnis", repo: "CardScripts", path: "" }
}

filename = "c10000.lua"
repoInfo = defaultRepoInfo.CardScripts;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function gitFetch(url, opts = {}) {
    if (!url || typeof opts !== "object") return { status: false };
    const res = await fetch(url, opts);
    if (/^API rate limit/.test(res.message)) {
        await sleep(60 * 1000);
        return await fetch(url, opts);
    } else {
        return res;
    }
}

const header_auth = { "Accept": "application/vnd.github.v3+json" };
const git_content_url = `https://api.github.com/repos/${repoInfo.user}/${repoInfo.repo}/contents/official/${filename}`;
res = await fetch(git_content_url, { method: "GET", headers: header_auth }).then(d => d.json());

a = { json: () => res }

//res= await gitFetch(git_content_url, { method: "GET", headers: header_auth }).then(d => d.json());


function split_data(data) {
    const split_sep = "__SPLIT__";
    return data.replace(/\r\n|\r|\n/g, split_sep).split(split_sep);
}

cardIds = [952523, 1174075]

repoInfo = defaultRepoInfo.CardScripts;

fileNames = cardIds.map(id => `c${id}.lua`);
res_gitUrls = await Promise.all(fileNames.map(async filename => {
    const header_auth = { "Accept": "application/vnd.github.v3+json" };
    const git_content_url = `https://api.github.com/repos/${repoInfo.user}/${repoInfo.repo}/contents/official/${filename}`;
    const res = await fetch(git_content_url, { method: "GET", headers: header_auth })
        .then(d => d.json());
    if (/^API rate limit/.test(res.message)) {
        await sleep(60 * 1000);
        return await fetch(git_content_url, { method: "GET", headers: header_auth })
            .then(d => d.json());
    } else {
        return res;
    }
}));

cardNameDics = await Promise.all(res_gitUrls
    .map(async resIn => {
        const cardId = resIn.name.match(/(?<=c)\d+(?=\.lua)/);
        const data = await fetch(resIn.git_url).then(d => d.json()).then(res => atob(res.content));
        if (!data || !cardId) return "";
        else {
            const cardNameTmp = split_data(data)[0].replace(/^[-\s]*/, "");
            return { [cardId - 0]: decodeURI(escape(cardNameTmp)) };
        };
    }))
console.log(cardNameDics);

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

console.log(3)
await sleep(1000)
console.log(2)

async function gitFetch(url, opts) {
    if (!url || typeof opts !== "object") return { status: false };
    const res = await fetch(url, opts).then(d => d.json());
    if (/^API rate limit/.test(res.message)) {
        await sleep(60 * 1000);
        return await fetch(url, opts).then(d => d.json());
    } else {
        return res;
    }
}

const obtainValidCids = async () => {
    const url_Eng = location.href.replace(/&request_locale=\S\S/g, "") + "&request_locale=en";
    const res_Eng = await fetch(url_Eng).then(d => d.body)
        .then(d => d.getReader()).then(reader => reader.read());
    const content = new TextDecoder("utf-8").decode(res_Eng.value);
    return $(`#deck_text [id$='_list']`, content).map((_, row) => {
        return $(`input.link_value`, $(row)).map((ind, obj) => {
            const cid = $(obj).val().match(/(?<=cid=)\d+/);
            return cid ? cid[0] : "";
        });
    })
}

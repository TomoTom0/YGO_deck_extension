
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

    const obtainSearchResult=async (ids)=>{
        const q = cardIds.map(id=>`filename:c${id}.lua`).join(" ");
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
    const cycleNum=Math.floor(cardIds.length/5)+1;
    cardIdsSplited=[...Array(cycleNum).keys()].map(cycle=>cardIds.slice(cycle*5, (cycle+1)*5));
    res_search=await Promise.all(cardIdsSplited.map(cardIdsTmp=>await obtainSearchResult(cardIdsTmp))).then(dics=>Object.assign(...dics.concat({})));

values = await Promise.all(Object.entries(res_search.items)
    .map(async item_tmp=>{
        const ind_item = item_tmp[0];
        const item = item_tmp[1];
        const data = await fetch(item.git_url).then(d => d.json()).then(res=>atob(res.content));
        if (!data) return "";
        else {
            const cardNameTmp=data.split("\n")[0].replace(/^[-\s]*/, "");
            return decodeURI(escape(cardNameTmp));
        };
    }))


/*
1=Ocg
2=Tcg
3=Ocg/Tcg
4=Anime
*/

git_search_url = `https://api.github.com/rate_limit`;
header_auth = { "Accept": "application/vnd.github.v3+json" };
res_search = await fetch(git_search_url, { method: "GET", headers: header_auth }).then(d=>d.json())


defaultRepoInfo = {
    CDB: { user: "ProjectIgnis", repo: "BabelCDB", path: "" },
    antLua: { user: "NaimSantos", repo: "DataEditorX", path: "DataEditorX/data/ant.lua" },
    StringsConf: { user: "NaimSantos", repo: "DataEditorX", path: "DataEditorX/data/strings.conf" },
    CardScripts: { user: "ProjectIgnis", repo: "CardScripts", path: "" }
}

repoInfo = defaultRepoInfo.CardScripts;
header_auth = { "Accept": "application/vnd.github.v3+json" };

git_content_url = `https://api.github.com/repos/${repoInfo.user}/${repoInfo.repo}/contents/official/`;
res = await fetch(git_content_url, { method: "GET", headers: header_auth })
    .then(d => d.json())

const git_content_url = `https://api.github.com/repos/${repoInfo.user}/${repoInfo.repo}/contents/${repoInfo.path}`;
const git_url = await fetch(git_content_url, { method: "GET", headers: header_auth })
    .then(d => d.json()).then(async d => {
        if (d.git_url) return d.git_url;
        const repoInfo2 = defaultRepoInfo.StringsConf;
        const git_content_url2 = `https://api.github.com/repos/${repoInfo2.user}/${repoInfo2.repo}/contents/${repoInfo2.path}`;
        return await fetch(git_content_url2, { method: "GET", headers: header_auth }).then(d => d.json()).then(d => d.git_url);

    });
//if (!res_content.git_url) return "";
const contents = await fetch(git_url, { method: "GET", headers: header_auth }).then(d => d.json())
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

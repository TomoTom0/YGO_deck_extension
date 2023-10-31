# -*- coding: utf-8 -*-
# ---
# jupyter:
#   jupytext:
#     text_representation:
#       extension: .py
#       format_name: light
#       format_version: '1.5'
#       jupytext_version: 1.6.0
#   kernelspec:
#     display_name: Python 3
#     language: python
#     name: python3
# ---

# ## set up

import os
import re
import json
import requests
import base64
from bs4 import BeautifulSoup
from time import sleep
import datetime
import html

GitHubToken = os.getenv("GitHubToken")

# +
repoInfos = {
    "CDB": {"user": "ProjectIgnis", "repo": "BabelCDB", "path": ""},
    "ConstantLua": {"user": "NaimSantos", "repo": "DataEditorX", "path": "DataEditorX/data/constant.lua"},
    "StringsConf": {"user": "NaimSantos", "repo": "DataEditorX", "path": "DataEditorX/data/strings.conf"},
    "MyRepo": {"user": "TomoTom0", "repo": "ygo_db", "path": "data/ygo_db.json"}
}

except_cards = {10000030: {"id": "10000030", "cid": "10113", "name": "マジマジ☆マジシャンギャル"},
                10000040: {"id": "10000040", "cid": "10112", "name": "光の創造神 ホルアクティ"}}

cardName_translations = {"D－HERO": "D-HERO"}
ocg_modify = {
    "40939228": {"name": "シューティング・セイヴァー・スター・ドラゴン", "id": "40939228", "cid": 16228},
    "93708824": {"name": "ロクスローズ・ドラゴン", "id": "93708824", "cid": 15970},
    "58844135": {"name": "人攻智能ME－PSY－YA", "id": "58844135", "cid": 16213},
    "41002238": {"name": "カイザー・グライダー－ゴールデン・バースト", "id": "41002238", "cid": 16620},
    "9822220": {"name": "天獄の王", "id": "9822220", "cid": 16516},
    "65681983": {"name": "抹殺の指名者", "id": "65681983", "cid": 14627},
    "00572850": {"name": "ティアラメンツ・シェイレーン", "id": "00572850", "cid": 17415},
    "37961969": {"name": "ティアラメンツ・ハゥフニス", "id": "37961969", "cid": 17416},
    "33533678": {"name": "スプライト・ジェット", "id": "33533678", "cid": 17406},
    "80170678": {"name": "EN－エンゲージ・ネオスペース", "id": "80170678", "cid": 17453},
    "52553471": {"name": "ENウェーブ", "id": "52553471", "cid": 17456},
    "16169772": {"name": "インスタント・コンタクト", "id": "16169772", "cid": 17454},
    "52553471": {"name": "融合超渦", "id": "52553471", "cid": 17455}
}


# -

# ## makeDB

def make_db(dataIn=[], except_cards=except_cards):
    nowTime = datetime.datetime.now()
    if dataIn == []:
        url = "https://db.ygoprodeck.com/api/v7/cardinfo.php?misc=yes"
        res_cards = requests.get(url).json()
        data = res_cards["data"]
    else:
        data = dataIn
    info_dicts = {}

    for infoIn in data:
        typeIn = infoIn["type"]
        IsMonster = "Monster" in typeIn
        raceIn = infoIn["race"]
        hasEffect = "Effect" if IsMonster and "has_effect" in infoIn["misc_info"][0].keys(
        ) else ""
        levelIn = infoIn["level"] if "level" in infoIn.keys() else "NaN"
        otIn = [s for s in infoIn["misc_info"][0]
                ["formats"][::-1] if s in ["OCG", "TCG"]]
        LMarkerDic = {"Bottom": "D", "Left": "L", "Right": "R", "Top": "U"}
        card_ids = [s["id"] for s in infoIn["card_images"]]
        for card_id in card_ids:
            publishedDate = infoIn["misc_info"][0].get(
                "ocg_date", "2000-01-01").strip()
            if not re.match(r"\d{4}-\d{2}-\d{2}", publishedDate):
                publishedDate = "2000-01-01"
            #print(card_id, publishedDate)
            publishedTime = datetime.datetime.strptime(
                publishedDate, "%Y-%m-%d")
            if (nowTime-publishedTime).days < 0:
                continue
            # Token will be skipped
            if "Token" in typeIn:
                continue
            infoTmps = [{
                k: infoIn[k] for k in ["name"]
            }, {
                "type": typeIn.replace(" ", ","),
                "race": raceIn
            } if IsMonster else {
                "type": re.sub(r"\sCard", "", f"{raceIn} {typeIn} {hasEffect}").replace(" ", ","),
                "race": "NaN"
            }, {
                k: infoIn.get(k, "NaN")
                for k in ["atk", "def", "attribute", "scale"]
            }, {
                "level": levelIn,  # infoIn.get("linkval", "NaN"),
                "LMarker": " ".join(["".join([LMarkerDic[t] for t in s.split("-")[::-1]]) for s in infoIn["linkmarkers"]])
                if "linkmarkers" in infoIn.keys() else "NaN",
                "ot":"/".join(otIn),
                "cid":infoIn["misc_info"][0].get("konami_id", "NaN")
            }, {
                "id": card_id
            }]

            for infoTmp in infoTmps:
                for k, v in infoTmp.items():
                    if card_id in except_cards.keys() and k in except_cards[card_id].keys():
                        v = except_cards[card_id][k]
                    if not k in info_dicts.keys():
                        info_dicts[k] = [v]
                    else:
                        info_dicts[k].append(v)
    return info_dicts


# ## pullCDB

# + active=""
# def pullCDB():
#     repoInfo=repoInfos["CDB"]
#     q = "filename:*.cdb -filename:*-rush*.cdb -filename:*-skills*.cdb -filename:*unofficial*.cdb -filename:*goat*.cdb"
#     git_search_url = "https://api.github.com/search/code"
#     header_auth = { "Accept": "application/vnd.github.v3+json" }
#     search_query = f'q={q}+repo:{repoInfo["user"]}/{repoInfo["repo"]}' + ("" if repoInfo["path"] == "" else f'{repoInfo["path"]} in:path')
#     res_search = requests.get(git_search_url + "?" + search_query, headers= header_auth).json()
#
#     # pull CDB and merge
#     tmpFileName="tmp.cdb"
#
#     df_datas=""
#     df_texts=""
#
#     for ind, item in enumerate(res_search["items"]):
#         cdb_data = requests.get(item["git_url"]).json()
#         decoded=base64.b64decode(cdb_data["content"])
#         print(item["name"], len(decoded))
#         with open(tmpFileName, "wb") as f:
#             f.write(decoded)
#         connection = sqlite3.connect(tmpFileName)
#         df_datas_tmp = pd.read_sql_query(sql=u"select * from datas", con=connection)
#         df_texts_tmp = pd.read_sql_query(sql=u"select * from texts", con=connection)
#         if ind==0:
#             df_datas = df_datas_tmp
#             df_texts = df_texts_tmp
#         else:
#             df_datas = pd.merge(df_datas, df_datas_tmp, how="outer")
#             df_texts = pd.merge(df_texts, df_texts_tmp, how="outer")
#
#     return df_datas, df_texts
# -

# ## obtain Jap info

# +
def _obtainJapInfos(formIn="id", valsIn={}, cardName_translations=cardName_translations):
    vals = valsIn if isinstance(valsIn, dict) else {s: s for s in valsIn}
    if (len(vals.keys()) == 0):
        return {}
    form = {"id": "pass", "name": "name"}[formIn]
    query = "&".join(
        [f"{form}_{ind}={s}&{form}-op_{ind}=3" for ind, s in enumerate(vals.values())])
    url = f"https://ocg-card.com/list/result/?{query}&dup=2&max=10"
    count = 0
    while count < 3:
        res = requests.get(url)
        if res.ok:
            count += 3
        else:
            sleep(0.1)
            count += 1
    # HTML parse
    soup = BeautifulSoup(res.text, "html.parser")
    cardInfos = {}
    elems = soup.select(
        "tr.status-height,tr.status-height2, tr.status-height3, tr.spell-height")
    for elem in elems:
        tds = elem.select("td")
        cardNameTmp = tds[1].decode_contents(formatter="html")
        cardName = re.sub(r"<div.*/div>", "", cardNameTmp)
        for k, v in cardName_translations.items():
            cardName = cardName.replace(k, v)
        if not tds[0].has_attr("class") or not "card-number" in tds[0]["class"]:
            continue
        elif len(tds) < 6:
            print(tds)
        cardIdTmp = tds[3].decode_contents(formatter="html")
        cardId = (re.search(r"\d+", cardIdTmp) or [""])[0]
        cid_dbTmp = tds[5].decode_contents(formatter="html")
        cid_db = (re.search(r'(?<=cid=)\d+(?=">公式)', cid_dbTmp) or [""])[0]
        keyId = str(int(cardId)) if form == "pass" else cid_db
        if cardId != "" and (form == "pass" or cid_db in vals.keys()):
            try:
                cardInfos[keyId] = {"name": html.unescape(
                    cardName), "id": str(int(cardId)), "cid": int(cid_db)}
            except Exception as e:
                print(cardName, cardId, cid_db)

    return cardInfos


def obtainJapInfos(formIn="id", valsIn={}):
    valsIn2 = valsIn if (type(valsIn) == "dict") else {s: s for s in valsIn}
    length_vals = len(valsIn2.keys())
    cardInfos = {}
    kvs = list(valsIn2.items())
    delta = 3
    showCount = 0
    showDelta = (length_vals-1)//10 + 1
    print(f"  {length_vals} OCG cards")
    for cycle in range(length_vals//delta+1):
        if cycle*delta > (showCount+1)*showDelta:
            showCount += 1
            print("■", end="")
        valsTmp = {kvs[ind][0]: kvs[ind][1] for ind in range(
            cycle*delta, min((cycle+1)*delta, length_vals))}
        newInfo = _obtainJapInfos(formIn, valsTmp)
        cardInfos.update(newInfo)
    print("\n")
    return cardInfos


# -

# ## operate GitHub

def operateGitHub(method="upload", dataIn={}, repoInfo = repoInfos["MyRepo"]):
    header_auth = {"Accept": "application/vnd.github.v3+json",
                   "Authorization": f"token {GitHubToken}"}
    if method == "download":
        git_content_url = f'https://api.github.com/repos/{repoInfo["user"]}/{repoInfo["repo"]}/contents/data'
        res_content = requests.get(git_content_url, headers=header_auth).json()
        sha = [s["sha"] for s in res_content if s["path"] == repoInfo["path"]]
        if len(sha) == 0:
            return {}
        git_data_url = f'https://api.github.com/repos/{repoInfo["user"]}/{repoInfo["repo"]}/git/blobs/{sha[0]}'
        res_data = requests.get(git_data_url, headers=header_auth).json()
        content = base64.b64decode(res_data["content"]).decode()
        return json.loads(content)
    elif method == "upload":
        git_content_url = f'https://api.github.com/repos/{repoInfo["user"]}/{repoInfo["repo"]}/contents/data'
        res_content = requests.get(git_content_url, headers=header_auth).json()
        sha = [s["sha"] for s in res_content if s["path"] == repoInfo["path"]]
        git_put_url = f'https://api.github.com/repos/{repoInfo["user"]}/{repoInfo["repo"]}/contents/{repoInfo["path"]}'
        header_put = {
            "Accept": "application/vnd.github.v3+json",
            "Authorization": f"token {GitHubToken}",
        }
        message = f"regular update@{datetime.date.today()}"
        content = json.dumps(dataIn)
        bodyTmp = {"sha": sha[0]} if len(sha) > 0 else {}
        body = {"message": message, "content": base64.b64encode(
            content.encode()).decode(), **bodyTmp}
        res_put = requests.put(
            git_put_url, headers=header_put, data=json.dumps(body)).json()
        return res_put


# ## make_good_db

def make_good_db(on_regular=True, mode="reuse", addInfo={"ocg": {}}):
    db_old = operateGitHub("download") if mode == "reuse" else {
        "ocg": {}, "date": "2000-01-01"}
    if not isinstance(db_old, dict) or not "ocg" in db_old.keys():
        db_old = {"ocg": {}, "date": "2000-01-01"}
    lastUpdated = db_old["date"] if "date" in db_old.keys() else "2000-01-01"
    if on_regular and (lastUpdated == f"{datetime.date.today()}" or datetime.date.today().weekday() % 3 != 2):
        print("update is skipped")
        return
    all_info = make_db()
    print("make YGO db with Jap info")
    ocg_ids = list(map(str,
                       [all_info["id"][ind] for ind, s in enumerate(all_info["ot"])
                        if "OCG" in s and "Token" not in all_info["type"][ind] and
                        ("TCG" not in s or len(str(all_info["cid"][ind])) >= 9 or all_info["cid"][ind] == "NaN")]))
    print("1 / 3")
    ocg_ids_new = [s for s in ocg_ids
                   if not s in db_old["ocg"].keys() and len(str(s)) < 9]  # s.zfill(8)
    ocg_infoTmp = obtainJapInfos("id", ocg_ids_new)
    ocg_notFound = [s for s in ocg_ids_new if s not in ocg_infoTmp.keys()]
    modify_ocg = addInfo.get("ocg", {})
    print("2 / 3")
    ocg_info = {**db_old["ocg"], **ocg_infoTmp, **modify_ocg}
    ids = list(map(str, all_info["id"]))
    inds_ocg = [ind for ind, idTmp in enumerate(ids)
                if f"{idTmp}" in ocg_info.keys()]  # f"{idTmp}".zfill(8)
    for key in ["name", "cid"]:
        all_info[key] = [ocg_info[str(ids[ind])][key]  # str(ids[ind]).zfill(8)
                         if ind in inds_ocg else s for ind, s in enumerate(all_info[key])]

    print("missing cards: {}".format(
        " ".join([s for s in ocg_notFound if s not in modify_ocg.keys()])))
    print("missing but modified cards: ".format(
        " ".join([s for s in ocg_notFound if s in modify_ocg.keys()])))

    db_new = {
        "date": f"{datetime.date.today()}",
        "all": all_info,
        "ocg": ocg_info,
        "ocgNotFound": ocg_notFound
    }
    operateGitHub("upload", db_new)
    print("3 / 3")
    return db_new


if __name__ == "__main__":
    db = make_good_db(True, "reuse", {"ocg": ocg_modify})
    sleep(30*60)

# import ygo_heroku
#
# db=ygo_heroku.make_good_db(False)

# ocg_modify={
#     "40939228":{"name":"シューティング・セイヴァー・スター・ドラゴン", "id": "40939228", "cid":16228},
#     "93708824":{"name":"ロクスローズ・ドラゴン", "id":"93708824", "cid":15970},
#     "58844135":{"name":"人攻智能ME－PSY－YA", "id":"58844135", "cid":16213},
#     "41002238":{"name":"カイザー・グライダー－ゴールデン・バースト", "id":"41002238", "cid":16620},
#     "9822220":{"name":"天獄の王", "id":"9822220", "cid":16516},
#     "65681983":{"name":"抹殺の指名者", "id":"65681983", "cid":14627}
# }

# db = make_good_db(False, "NOTreuse", {"ocg":ocg_modify})

# db_old = operateGitHub("download")

# db["all"]["id"].index(9822220)

# db["all"]["name"][5509]

# db = make_good_db(False, "reuse")

# [s for s in a if "OCG" in s["ot"] and not "Token" in s["name"]]

# a=[{key: db["all"][key][ind] for key in db["all"].keys()} for ind, s in enumerate(db["all"]["cid"]) if s=="NaN" and not "Toekn" in db["all"]["name"][ind]]
# [s for s in a if not "Token" in s["name"]]

# + [markdown] jupyter={"outputs_hidden": true}
# db_old["ocg"]
# -

# [s for s in [t["name"] for t in db_old["ocg"].values()] if s.startswith("想い")]

# db_new["all"]["id"].index(58844135)

# db_new["all"]["name"][407]

# db_new["all"]["cid"][8847]

# [s for s in db_new["all"]["name"] if s.startswith("シュ")]

# [s for s in db_new["all"]["cid"] if str(s)!=""]

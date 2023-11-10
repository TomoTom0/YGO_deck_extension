# -*- coding: utf-8 -*-
# ---unittest
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

# # set up

import os
import re
import sys
import json
from unittest import result
import requests
import base64
from bs4 import BeautifulSoup
from time import sleep
import datetime
import html
from concurrent import futures
import multiprocessing

# import time
import glob2
from dotenv import load_dotenv
# read .env

env_files=sorted(glob2.glob("../../**/.env"))
if len(env_files) > 0:
    load_dotenv(env_files[0])

GitHubToken = os.getenv("GitHubToken")

# +
repoInfos = {
    "CDB": {"user": "ProjectIgnis", "repo": "BabelCDB", "path": ""},
    "ConstantLua": {"user": "NaimSantos", "repo": "DataEditorX", "path": "DataEditorX/data/constant.lua"},
    "StringsConf": {"user": "NaimSantos", "repo": "DataEditorX", "path": "DataEditorX/data/strings.conf"},
    "MyRepo_DB": {"user": "TomoTom0", "repo": "ygo_db", "path": "data/ygo_db.json"},
    "MyRepo_cardListLang": {"user": "TomoTom0", "repo": "ygo_db", "path": "data/ygo_cardList.json"},
}

except_cards = {10000030: {"id": "10000030", "cid": "10113", "name": "マジマジ☆マジシャンギャル"},
                10000040: {"id": "10000040", "cid": "10112", "name": "光の創造神 ホルアクティ"}}

cardName_translations = {"D－HERO": "D-HERO"}
"""ocg_modify = {
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
}"""


# -

# ## makeDB

def make_db(dataIn=[], except_cards={}):
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
        levelIn = infoIn.get("level", False)
        linkvalIn = infoIn.get("linkval", "NaN")
        otIn = [s for s in infoIn["misc_info"][0]
                ["formats"][::-1] if s in ["OCG", "TCG"]]
        LMarkerDic = {"Bottom": "D", "Left": "L", "Right": "R", "Top": "U"}
        LMarkerDic2={"LD":"1" ,"D":"2","RD":"3", "L":"4", "R":"6", "LU":"7", "U":"8", "RU":"9"}
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
            if "Token" in typeIn or "Skill" in typeIn:
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
                "level": levelIn or linkvalIn,  # infoIn.get("linkval", "NaN"),
                "LMarker": "".join([LMarkerDic2["".join(LMarkerDic[t] for t in s.split("-")[::-1])] for s in infoIn["linkmarkers"]])
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

def operateGitHub(method="upload", dataIn={}, repoInfo=repoInfos["MyRepo_DB"], commit_name=None):
    header_auth = {"Accept": "application/vnd.github.v3+json",
                   "Authorization": f"token {GitHubToken}"}
    if method == "download":
        git_content_url = "https://api.github.com/repos/{}/{}/contents/data".format(
            repoInfo["user"], repoInfo["repo"])
        res_content = requests.get(git_content_url, headers=header_auth).json()
        sha = [s["sha"] for s in res_content if s["path"] == repoInfo["path"]]
        if len(sha) == 0:
            return {}
        git_data_url = "https://api.github.com/repos/{}/{}/git/blobs/{}".format(
            repoInfo["user"], repoInfo["repo"], sha[0])
        res_data = requests.get(git_data_url, headers=header_auth).json()
        content = base64.b64decode(res_data["content"]).decode()
        return json.loads(content)
    elif method == "upload":
        git_content_url = "https://api.github.com/repos/{}/{}/contents/data".format(
            repoInfo["user"], repoInfo["repo"])
        res_content = requests.get(git_content_url, headers=header_auth).json()
        sha = [s["sha"] for s in res_content if s["path"] == repoInfo["path"]]
        git_put_url = "https://api.github.com/repos/{}/{}/contents/{}".format(
            repoInfo["user"], repoInfo["repo"], repoInfo["path"])
        header_put = {
            "Accept": "application/vnd.github.v3+json",
            "Authorization": f"token {GitHubToken}",
        }
        message = commit_name or f"regular update@{datetime.date.today()}"
        content = json.dumps(dataIn)
        bodyTmp = {"sha": sha[0]} if len(sha) > 0 else {}
        body = {"message": message, "content": base64.b64encode(
            content.encode()).decode(), **bodyTmp}
        res_put = requests.put(
            git_put_url, headers=header_put, data=json.dumps(body)).json()
        return res_put

# # cardList Lang

def obtainCardsNum(lang="ja"):
    sort = "21"
    rp = 10
    page=1
    url = f"https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=1&sess=1&rp={rp}"\
            +f"&sort={sort}&page={page}&keyword=&stype=1&ctype=&othercon=2&starfr=&starto=&pscalefr="\
            +f"&pscaleto=&linkmarkerfr=&linkmarkerto=&link_m=2&atkfr=&atkto=&deffr=&defto=&request_locale={lang}"
    res = requests.get(url)
    soup = BeautifulSoup(res.text, "html.parser")
    max_page = re.findall(r"ChangePage\((\d+)\)",
                          soup.select("a.yaji.max")[0]["href"])[0]
    return rp*int(max_page)


def obtainCardInfo_fromYGODB(page, lang="ja", rp=2000):
    sort = "21"
    url = f"https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=1&sess=1&rp={rp}"\
            +f"&sort={sort}&page={page}&keyword=&stype=1&ctype=&othercon=2&starfr=&starto=&pscalefr="\
            +f"&pscaleto=&linkmarkerfr=&linkmarkerto=&link_m=2&atkfr=&atkto=&deffr=&defto=&request_locale={lang}"
    res = requests.get(url)
    soup = BeautifulSoup(res.text, "html.parser")
    js_script=soup.select("script[type=\"text/javascript\"]")[5]
    enc_cid_dic={k:v for k,v in re.findall(r"/yugiohdb/get_image\.action\?type=1&osplang=1&cid=(\d*)&ciid=1&enc=([^&']*)'", js_script.text)}
    return {s["value"]: {"name": t.text, "cid": s["value"], "encImg":enc_cid_dic.get(s["value"], "NaN")}
            for s, t in zip(soup.select("input.cid"), soup.select("span.card_name"))}


def _updateCardList_Lang(lang, cardList_Lang_old, rp=2000):
    cards_num = obtainCardsNum(lang=lang)
    cardList_Lang = cardList_Lang_old
    for page in range(1, cards_num//rp + 2):
        print("■", end="")
        cardList_tmp = obtainCardInfo_fromYGODB(page=page, lang=lang, rp=rp)
        if set(cardList_tmp.keys()) <= set(cardList_Lang.keys()):
            break
        cardList_Lang.update(cardList_tmp)
    print("")
    return {lang: cardList_Lang}


def updateCardList_Langs(cardList_Langs_old={}, langs=["ja", "en", "de", "fr", "it", "es", "pt", "ko"]):
    future_list = []
    try:
        with futures.ThreadPoolExecutor(max_workers=4) as executor:
            for lang in langs:
                cardList_Lang_old = cardList_Langs_old.get(
                    lang, {}) if isinstance(cardList_Langs_old, dict) else {}
                future = executor.submit(
                    _updateCardList_Lang, lang=lang, cardList_Lang_old=cardList_Lang_old)
                future_list.append(future)
            _ = futures.as_completed(fs=future_list)
    except Exception as e:
        print(e)

    return {k: v for future_tmp in future_list for k, v in future_tmp._result.items()}

# # make_good_db

"""def make_good_db(on_regular=True, addInfo={"ocg": {}}, githubReuseIsValid=True, modifyOldIsValid=True, cardListLangUpdateIsValid=True):

    data_db_empty = {"ocg": {}, "date": "2000-01-01"}
    data_db_old_tmp = operateGitHub(
        "download", repoInfo=repoInfos["MyRepo_DB"]) if githubReuseIsValid else data_db_empty

    data_cardList_Langs = operateGitHub(
        "download", repoInfo=repoInfos["MyRepo_cardListLang"])
    cardList_Langs_old = data_cardList_Langs.get("cardList_Langs", {}) if isinstance(data_cardList_Langs, dict) and githubReuseIsValid else {}
    data_db_old = data_db_old_tmp if isinstance(
        data_db_old_tmp, dict) else data_db_empty
    commit_name= None if on_regular is True else "Manual"

    lastUpdated = data_db_old.get("date", "2000-01-01")
    if on_regular and (lastUpdated == f"{datetime.date.today()}" or datetime.date.today().weekday() % 3 != 2):
        print(f"{datetime.date.today()}: update is skipped")
        return
    elif cardListLangUpdateIsValid is True:
        cardList_Langs = updateCardList_Langs(
            cardList_Langs_old=cardList_Langs_old)
        operateGitHub("upload", dataIn={
                      "cardList_Langs": cardList_Langs,
                      "date": f"{datetime.date.today()}"}, repoInfo=repoInfos["MyRepo_cardListLang"], commit_name=commit_name)
    else:
        cardList_Langs=cardList_Langs_old

    dic_forModify_old = data_db_old.get(
        "forModify", {}) if modifyOldIsValid else {}
    print("1 / 3: obtain base info of database")
    db_base = make_db()

    #id2cid = {s: t for s, t in zip(db_base["id"], db_base["cid"])}
    #id2ind = {str(id_tmp): ind for ind, id_tmp in enumerate(db_base["id"])}

    # merge 1st
    db_base["cid"] = [dic_forModify_old.get(str(ind), {"cid": cid})[
        "cid"] for ind, cid in enumerate(db_base["cid"])]

    # exceptions
    nineOrderId_cards = {"10000030": {"id": "10000030", "cid": "10113", "name": "Magi Magi ☆ Magician Gal"},
                         "10000040": {"id": "10000040", "cid": "10112", "name": "Holactie the Creator of Light"}}
    for cardInfo in nineOrderId_cards.values():
        ind_tmp = db_base["id"].index(int(cardInfo["id"]))
        if cardInfo["name"] == db_base["name"][ind_tmp]:
            db_base["cid"][ind_tmp] = cardInfo["cid"]

    # check cards without cid
    inds_withoutCid = [ind for ind, cid in enumerate(
        db_base["cid"]) if cid == "NaN"]

    # search cards with English name
    inds_forSearch = []
    fromNameEng_dic = {}
    nameEng2cid = {s["name"]: s["cid"] for s in cardList_Langs["en"].values()}
    for ind in inds_withoutCid:
        id_tmp = str(db_base["id"][ind])
        name_tmp = db_base["name"][ind]
        cid_tmp = nameEng2cid.get(name_tmp, None)
        if cid_tmp is None:
            inds_forSearch.append(ind)
        else:
            fromNameEng_dic[id_tmp] = {"cid": cid_tmp, "id": id_tmp}

    print("2 / 3: obtain info from ocg-card.com")
    print("\t"+"\n\t".join([db_base["name"][ind]+"\t\t" +
                            str(db_base["id"][ind]) for ind in inds_forSearch]))
    cardInfos_searched = obtainJapInfos(
        "id", [db_base["id"][ind] for ind in inds_forSearch])
    fromOCGCARD_dic = {str(s["id"]): {"cid": s["cid"], "id": s["id"]}
                       for s in cardInfos_searched.values()}

    # merge now
    db_new = db_base#.copy()
    dic_forModify = {**fromOCGCARD_dic, **fromNameEng_dic}
    #dic_forModify_tmp = {id2ind[str(k)]: v for k, v in dic_forModify.items()}
    #db_new["cid"] = [dic_forModify.get(ind, {"cid": cid})["cid"] for ind, cid in enumerate(db_new["cid"])]
    db_new["cid"] = [dic_forModify.get(db_new["id"][ind], {"cid": cid})["cid"] for ind, cid in enumerate(db_new["cid"])]

    # add lang info
    print("3 / 3: add lang info")
    db_new["lang"] = []
    db_new["encImg"]=[]
    for lang in cardList_Langs.keys():
        db_new[f"name_{lang}"] = []
    for cid in db_new["cid"]:
        encImg_now="NaN"
        lang_list = []
        for lang, cardList in cardList_Langs.items():
            cardInfo_tmp = cardList.get(str(cid), None)
            if cardInfo_tmp is None:
                db_new[f"name_{lang}"].append("NaN")
                continue
            lang_list.append(lang)
            encImg_now=cardInfo_tmp.get("encImg", "NaN")
            db_new[f"name_{lang}"].append(cardInfo_tmp["name"])
        db_new["lang"].append(",".join(lang_list))
        db_new["encImg"].append(encImg_now)
    db_new["name_orig"]=db_new["name"]
    db_new["name"]=db_new["name_ja"]

    data_db_new = {
        "date": f"{datetime.date.today()}",
        "all": db_new,
        "forModify": dic_forModify, # fromOCGCARD_dic
        "forModifyAll": {**dic_forModify_old, **dic_forModify},
        "forSearch": cardInfos_searched
    }
    operateGitHub("upload", data_db_new, commit_name=commit_name)
    return data_db_new"""

def _obtainTermDic(lang="ja"):
    url = f"https://www.db.yugioh-card.com/yugiohdb/card_search.action?request_locale={lang}"
    res = requests.get(url)
    soup = BeautifulSoup(res.text, "html.parser")

    # spell, trap
    selectors={mt:f"div#filter_effect_set>ul.filter_effect_{mt}.fliter_btns>li>span>span" for mt in ["magic", "trap"]}
    mt_dic={"magic":"spell", "trap":"trap"}
    term_st_dic={mt_dic[mt]:{"type":[span.text.strip() for span in soup.select(sel)]} for mt, sel in selectors.items()}

    # monster
    selectors={
        "attribute":"div#filter_attribute>ul.fliter_btns>li>span>span",
        "race":"div#filter_specis>ul.fliter_btns>li>span",
        "type":"div#filter_other:has(div.title>div.bottom)>ul.fliter_btns>li>span"
    }
    term_mon_dic={"monster":{
        key:[span.text.strip() for span in soup.select(sel)] for key, sel in selectors.items()
    }}

    return {**term_mon_dic, **term_st_dic}

def obtainTermDic_Langs(langs=["ja", "en", "de", "fr", "it", "es", "pt", "ko"]):
    term_dics_tmp={lang: _obtainTermDic(lang=lang) for lang in langs}
    term_dics_Langs={}
    for lang, term_dic_mst in term_dics_tmp.items():
        term_dics_Langs[lang]={}
        for mst, term_dic in term_dic_mst.items():
            term_dics_Langs[lang][mst]={}
            for key, term_list in term_dic.items():
                def _judgeExcept(lang, mst, key, val):
                    infoIn={"lang":lang, "mst":mst, "key":key, "val":val}
                    excepts=[{
                        "cond":{"lang":"ja", "mst":"monster", "key":"race","val":"創造神族"},
                        "alt":"Creator-God"
                    },{
                        "cond":{"lang":"ja", "mst":"monster", "key":"type","val":"特殊召喚"},
                        "alt":"SpecialSummon"
                    },{
                        "cond":{"lang":"ja", "mst":"monster", "key":"race","val":"幻想魔族"},
                        "alt":"Illusionist"
                    },{
                        "cond":{"lang":"ko", "mst":"monster", "key":"type","val":"특수 소환"},
                        "alt":"SpecialSummon"
                      }]
                    for info_except in excepts:
                        if all(info_except["cond"][v]==infoIn[v] for v in info_except["cond"].keys()):
                            return info_except["alt"]
                    return None
                #valid_term_list=[s for s in term_dics_tmp[lang][mst][key] if _judgeExcept(lang, mst, key, s)]
                ind_term=0
                term_dic={}
                for term in term_dics_tmp[lang][mst][key]:
                    judged=_judgeExcept(lang, mst, key, term)
                    if judged is None:
                        term_dic[term]=term_dics_tmp["en"][mst][key][ind_term]
                        ind_term+=1
                    else:
                        term_dic[term]=judged
                term_dics_Langs[lang][mst][key]=term_dic
    return term_dics_Langs


def _updateCardInfosAll_Lang(lang, cardInfos_old, rp=2000, term_dic={}):
    cards_num = obtainCardsNum(lang=lang)
    cardInfos = cardInfos_old
    for page in range(1, cards_num//rp + 2):
        print("■", end="")
        cardInfos_tmp = obtainCardInfosAll_fromYGODB(page=page, lang=lang, rp=rp, term_dic=term_dic)
        if set(cardInfos_tmp.keys()) <= set(cardInfos.keys()):
            break
        cardInfos.update(cardInfos_tmp)
    print("")
    return {lang: cardInfos}

def updateCardInfosAll_Langs(cardInfos_Langs_old={},term_dics_Langs={}, 
                             langs=["ja", "en", "de", "fr", "it", "es", "pt", "ko"], paraIsValid=True):
    if paraIsValid is False:
        results_dic={}
        for lang in langs:
            cardInfos_Lang_old = cardInfos_Langs_old.get(
                lang, {}) if isinstance(cardInfos_Langs_old, dict) else {}
            result_tmp = _updateCardInfosAll_Lang(lang=lang, cardInfos_old=cardInfos_Lang_old, term_dic=term_dics_Langs[lang])
            results_dic.update(result_tmp)
        return results_dic
    future_list = []
    try:
        with futures.ThreadPoolExecutor(max_workers=multiprocessing.cpu_count()) as executor:
            for lang in langs:
                cardInfos_Lang_old = cardInfos_Langs_old.get(
                    lang, {}) if isinstance(cardInfos_Langs_old, dict) else {}
                future = executor.submit(
                    _updateCardInfosAll_Lang, lang=lang, cardInfos_old=cardInfos_Lang_old, term_dic=term_dics_Langs[lang])
                future_list.append(future)
            _ = futures.as_completed(fs=future_list)
    except Exception as e:
        print(e)
    return {k: v for future_tmp in future_list for k, v in future_tmp._result.items()}

def combineCardInfosAll_Langs(cardInfos_Langs={}):
    db_combined={k:[] for k in list(cardInfos_Langs["ja"].values())[0].keys()}
    for lang, cardInfos_Lang in cardInfos_Langs.items():
        for cid_now, cardInfo in cardInfos_Lang.items():
            if cid_now not in db_combined["cid"]:
                for k,v in cardInfo.items():
                    db_combined[k].append(v)
            ind_fromCid=db_combined["cid"].index(cid_now)
            if not isinstance(db_combined[f"name_{lang}"][ind_fromCid], str):
                db_combined[f"name_{lang}"][ind_fromCid]=cardInfo[f"name_{lang}"]
            if not isinstance(db_combined[f"lang"][ind_fromCid], str):
                db_combined[f"lang"][ind_fromCid]=lang
            elif not lang in db_combined[f"lang"][ind_fromCid].split(","):
                list_tmp=db_combined[f"lang"][ind_fromCid].split(",")
                list_tmp.append(lang)
                db_combined[f"lang"][ind_fromCid]=",".join(list_tmp)
            elif not isinstance(db_combined[f"encImg"][ind_fromCid], str):
                encImgs=[cardInfos_Lang[cid_now]["encImg"] 
                         for cardInfos_Lang in cardInfos_Langs.values() if cardInfos_Lang[cid_now]["encImg"] is not None]
                if len(encImgs)>0:
                    db_combined[f"encImg"][ind_fromCid]=encImgs[0]
    return db_combined

def obtainCardInfosAll_fromYGODB(page, lang="ja", rp=2000, term_dic={}):
    print(page, lang)
    def _obtainSoup():
        sort = "21"
        url = f"https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=1&sess=1&rp={rp}"\
                +f"&sort={sort}&page={page}&keyword=&stype=1&ctype=&othercon=2&starfr=&starto=&pscalefr="\
                +f"&pscaleto=&linkmarkerfr=&linkmarkerto=&link_m=2&atkfr=&atkto=&deffr=&defto=&request_locale={lang}"
        res = requests.get(url)
        soup = BeautifulSoup(res.text, "html.parser")
        js_script=soup.select("script[type=\"text/javascript\"]")[5]
        enc_cid_dic={k:v for k,v in re.findall(r"/yugiohdb/get_image\.action\?type=1&osplang=1&cid=(\d*)&ciid=1&enc=([^&']*)'", js_script.text)}
        return soup, enc_cid_dic

    cardInfos={}
    soup, enc_cid_dic=_obtainSoup()
    for _count_tmp in range(2):
        sort=21
        url = f"https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=1&sess=1&rp={rp}"\
            +f"&sort={sort}&page={page}&keyword=&stype=1&ctype=&othercon=2&starfr=&starto=&pscalefr="\
            +f"&pscaleto=&linkmarkerfr=&linkmarkerto=&link_m=2&atkfr=&atkto=&deffr=&defto=&request_locale={lang}"
        if len(enc_cid_dic.values())==rp:
            break
        else:
            print(_count_tmp, url)
            _, enc_cid_dic=_obtainSoup()
    for elm_card in soup.select("#card_list>div.t_row"):
        cid_now=elm_card.select("input.cid")[0]["value"]
        #name_now=elm_card.select("span.card_name")[0].text,
        name_now=elm_card.select("input.cnm")[0]["value"],
        #if cid_now not in cardInfos.get("cid", []):
        cardInfo_basic={
            "cid":elm_card.select("input.cid")[0]["value"],
            "encImg":enc_cid_dic.get(cid_now, None)
        }

        try:
            cardInfo_complex=_obtainCardInfoComplex(elm_card, term_dic)
        except Exception as e:
            print(name_now, e)
            cardInfo_keys=["name","type","race","atk","def","attribute", "scale", "level", "LMarker", "cid", "id","lang", "encImg"]#"ot",
            cardInfo_complex={k:None for k in cardInfo_keys}
        cardInfo={**cardInfo_complex,
                  **cardInfo_basic,
                  **{f"name_{lang}":None for lang in ["ja", "en", "de", "fr", "it", "es", "pt", "ko"]}}
        cardInfo[f"name_{lang}"]=name_now if not isinstance(name_now, tuple) else name_now[0]
        if cardInfo["encImg"] is None:
            print(name_now, cardInfo_basic, cardInfo_complex)
        cardInfos[cid_now]=cardInfo
    return cardInfos


def _obtainCardInfoComplex(elm_card, term_dic):
    elm_card_spec=elm_card.select("dl.flex_1>dd.box_card_spec")[0]
    attr_src_tmp=elm_card_spec.select("span.box_card_attribute>img")[0]["src"]
    card_attr=re.findall(r"icon_(\S+)\.png", attr_src_tmp)[0]
    try:
        if card_attr in ["spell", "trap"]:
            card_basic_type=card_attr
        else:
            card_basic_type="monster"

        cardInfo_keys=["name","type","race","atk","def","attribute", "scale", "level", "LMarker", "cid", "id","lang", "encImg"]#"ot",
        cardInfo={k:None for k in cardInfo_keys}
        card_type_list=[card_basic_type.capitalize()]
        if card_basic_type in ["spell", "trap"]:
            box_eff=elm_card_spec.select("span.box_card_effect>span")
            if len(box_eff)>0:
                type_add_lang=box_eff[0].text
                card_type_list.append(term_dic[card_basic_type]["type"][type_add_lang])
            else:
                card_type_list.append("Normal")
            cardInfo["type"]=",".join(card_type_list)
        else:
            cardInfo["atk"]=re.findall(r"[\d\?]+", elm_card_spec.select(f"span.atk_power>span")[0].text)[0]
            cardInfo["attribute"]=card_attr.capitalize()

            box_link_img=elm_card_spec.select("span.box_card_linkmarker>img")
            if len(box_link_img)>0:
                #for link
                card_def=None
                LMarker_src_tmp=box_link_img[0]["src"]
                LMarker=re.findall(r"link(\d+)\.png", LMarker_src_tmp)[0]
                cardInfo["LMarker"]=LMarker
                cardInfo["level"]=len(LMarker)
            else:
                cardInfo["level"]=re.findall(r"\d+", elm_card_spec.select("span.box_card_level_rank>span")[0].text)[0]
                cardInfo["def"]=re.findall(r"[\d\?]+", elm_card_spec.select("span.def_power>span")[0].text)[0]
            box_pen_scale=elm_card.select("dl.flex_1>dd.box_card_pen_info>span.box_card_pen_scale")
            if len(box_pen_scale)>0:
                # for pendlumn
                cardInfo["scale"]=re.findall(r"\d+", box_pen_scale[0].text)[0]

            type_other_text=elm_card_spec.select("span.card_info_species_and_other_item>span")[0].text
            type_other_list=[s.strip() for s in re.findall(r"[【】／/\[\]]\s*([^【】／/\[\]]*)\s*[^【】／/\[\]]", type_other_text) if len(s)>0]

            card_race_lang=[s for s in type_other_list if s in term_dic["monster"]["race"]][0]
            card_other_type=[term_dic["monster"]["type"][s].capitalize() for s in type_other_list if s!=card_race_lang]
            card_type_list.extend(card_other_type)
            cardInfo["type"]=",".join(["XYZ" if s=="Xyz" else s for s in card_type_list])
            cardInfo["race"]=term_dic["monster"]["race"][card_race_lang].capitalize()
    except Exception as e:
        print(elm_card.select("input.cnm")[0]["value"], e, cardInfo)
    return cardInfo



def make_good_db2(on_regular=True, addInfo={"ocg": {}, "uploadIsValid":True}, githubReuse={"db":True, "Lang":True}, modifyOldIsValid=True, 
        cardInfosLangUpdateIsValid=True, paraIsValid=True):
    uploadIsValid=addInfo.get("uploadIsValid", True)
    data_db_empty = {"ocg": {}, "date": "2000-01-01"}
    data_db_old_tmp = operateGitHub(
        "download", repoInfo=repoInfos["MyRepo_DB"]) if githubReuse.get("db", True) else data_db_empty

    data_cardInfos_Langs = operateGitHub(
        "download", repoInfo=repoInfos["MyRepo_cardListLang"])
    data_db_old = data_db_old_tmp if isinstance(
        data_db_old_tmp, dict) else data_db_empty

    cardInfos_Langs_old = data_cardInfos_Langs.get("cardInfos_Langs", {}) \
        if githubReuse.get("Lang", True) is True and isinstance(data_cardInfos_Langs, dict) else {}
    term_dics_Langs_tmp = data_cardInfos_Langs.get("term_dics_Langs", {}) \
        if githubReuse.get("Lang", True) is True and isinstance(data_cardInfos_Langs, dict) else {}
    term_dics_Langs= obtainTermDic_Langs() if term_dics_Langs_tmp == {} else term_dics_Langs_tmp

    lastUpdated = data_db_old.get("date", "2000-01-01")
    if on_regular and (lastUpdated == f"{datetime.date.today()}" or datetime.date.today().weekday() % 3 != 2):
        print(f"{datetime.date.today()}: update is skipped")
        return
    elif cardInfosLangUpdateIsValid is True:
        cardInfos_Langs = updateCardInfosAll_Langs(
            cardInfos_Langs_old=cardInfos_Langs_old, term_dics_Langs=term_dics_Langs, paraIsValid=paraIsValid)
        #print(cardInfos_Langs)
        encImgs=[k for k,v in cardInfos_Langs["ja"].items() if v["encImg"] is None]
        if len(encImgs)>0:
            print(f"some encImgs are invalid.: "+"\n".join(encImgs))
            for cid in encImgs:
                print(format(cardInfos_Langs["ja"][cid]))
            return None
        if uploadIsValid is True:
            operateGitHub("upload", dataIn={
                "cardInfos_Langs": cardInfos_Langs,
                "term_dics_Lang":term_dics_Langs,
                "date": f"{datetime.date.today()}"}, repoInfo=repoInfos["MyRepo_cardListLang"])
    else:
        cardInfos_Langs=cardInfos_Langs_old

    dic_forModify_old = data_db_old.get(
        "forModify", {}) if modifyOldIsValid else {}
    print("1 / 3: obtain base info of database")
    db_base = make_db()

    #id2cid = {s: t for s, t in zip(db_base["id"], db_base["cid"])}
    #id2ind = {str(id_tmp): ind for ind, id_tmp in enumerate(db_base["id"])}

    # merge 1st
    db_base["cid"] = [dic_forModify_old.get(str(ind), {"cid": cid})[
        "cid"] for ind, cid in enumerate(db_base["cid"])]

    # exceptions
    nineOrderId_cards = {"10000030": {"id": "10000030", "cid": "10113", "name": "Magi Magi ☆ Magician Gal"},
                         "10000040": {"id": "10000040", "cid": "10112", "name": "Holactie the Creator of Light"}}
    for cardInfo in nineOrderId_cards.values():
        ind_tmp = db_base["id"].index(int(cardInfo["id"]))
        if cardInfo["name"] == db_base["name"][ind_tmp]:
            db_base["cid"][ind_tmp] = cardInfo["cid"]

    # check cards without cid
    inds_withoutCid = [ind for ind, cid in enumerate(
        db_base["cid"]) if cid == "NaN"]

    # search cards with English name
    inds_forSearch = inds_withoutCid
    #fromNameEng_dic = {}
    #nameEng2cid = {s["name"]: s["cid"] for s in cardList_Langs["en"].values()}
    """for ind in inds_withoutCid:
        id_tmp = str(db_base["id"][ind])
        name_tmp = db_base["name"][ind]
        #cid_tmp = nameEng2cid.get(name_tmp, None)
        #if cid_tmp is None:
        inds_forSearch.append(ind)
        #else:
        #    fromNameEng_dic[id_tmp] = {"cid": cid_tmp, "id": id_tmp}"""

    print("2 / 3: obtain info from ocg-card.com")
    print("\t"+"\n\t".join([db_base["name"][ind]+"\t\t" +
                            str(db_base["id"][ind]) for ind in inds_forSearch]))
    cardInfos_searched = obtainJapInfos(
        "id", [db_base["id"][ind] for ind in inds_forSearch])
    fromOCGCARD_dic = {str(s["id"]): {"cid": s["cid"], "id": s["id"]}
                       for s in cardInfos_searched.values()}

    # merge now
    db_new = db_base#.copy()
    dic_forModify = fromOCGCARD_dic#, **fromNameEng_dic}
    #dic_forModify_tmp = {id2ind[str(k)]: v for k, v in dic_forModify.items()}
    #db_new["cid"] = [dic_forModify.get(ind, {"cid": cid})["cid"] for ind, cid in enumerate(db_new["cid"])]
    db_new["cid"] = [dic_forModify.get(db_new["id"][ind], {"cid": cid})["cid"] for ind, cid in enumerate(db_new["cid"])]

    # add lang info
    print("3 / 3: add lang info")
    db_combined=combineCardInfosAll_Langs(cardInfos_Langs)
    cid2ind={str(cid):ind for ind, cid in enumerate(db_new["cid"])}
    ids=[db_new["id"][cid2ind[cid]] if cid in cid2ind.keys() else None for cid in db_combined["cid"]]
    db_combined["id"]=ids
    db_combined["name"]=db_combined["name_ja"]

    data_db_new = {
        "date": f"{datetime.date.today()}",
        "all": db_combined,
        "forModify": dic_forModify, # fromOCGCARD_dic
        "forModifyAll": {**dic_forModify_old, **dic_forModify},
        "forSearch": cardInfos_searched
    }
    if uploadIsValid is True:
        operateGitHub("upload", data_db_new)
    return data_db_new

if __name__ == "__main__":
    args=sys.argv
    on_regular="--regular" in args # False
    reuse=not "--no-reuse" in args # True
    para=not "--no-para" in args # True
    data_new = make_good_db2(
        on_regular=on_regular,
        githubReuse={"db":reuse, "Lang":reuse},
        modifyOldIsValid=True,
        paraIsValid=para)
    #data_new = make_good_db(True, githubReuseIsValid=True, modifyOldIsValid=True)
    #sleep(30*60)

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

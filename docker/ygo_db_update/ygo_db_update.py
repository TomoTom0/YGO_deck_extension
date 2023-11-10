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

# from unittest import result
import requests
import base64
from bs4 import BeautifulSoup
from time import sleep
import datetime
import html
from concurrent import futures
import multiprocessing

import pandas as pd

from typing import Union, Optional
import argparse

# import time
# import glob2
import dotenv
from pathlib import Path

# #  ------ argparse ------

description = "update database on GitHub for Chrome Extension"
parser = argparse.ArgumentParser(description=description)


args_dic = {
    "regular": {
        "help": "execute if the date meets the condition",
        "action": "store_true",
    },
    "not-reuse": {
        "help": "not reuse info from GitHub",
        "action": "store_true",
    },
    "no-para": {
        "help": "execute not in parallel but in series",
        "action": "store_true",
    },
    "not-upload": {
        "help": "not upload to GitHub",
        "action": "store_true",
    },
    "not-post-log": {
        "help": "not post log to url",
        "action": "store_true",
    },
    "langs": {
        "help": "execute script to specified languages, you should specified them joining comma like ja,en,ko"
    },
    "test": {
        "help": "upload to test dir on GitHub",
        "action": "store_true",
    },
}

for key_arg, val_dic in args_dic.items():
    arr_info = [f"--{key_arg}"]
    short = val_dic.get("short")
    if short is not None:
        arr_info.append(f"-{short}")
        val_dic.pop("short")
    parser.add_argument(*arr_info, **val_dic)


# +
REPO_INFOS = {
    "DB": {"user": "TomoTom0", "repo": "ygo_db", "path": "data/ygo_db.json"},
    "cardListLang": {
        "user": "TomoTom0",
        "repo": "ygo_db",
        "path": "data/ygo_cardList.json",
    },
}

EXCEPTS_FOR_TERM_ARR = [
    {
        "cond": {"lang": "ja", "mst": "monster", "key": "race", "val": "創造神族"},
        "alt": "Creator-God",
    },
    {
        "cond": {"lang": "ja", "mst": "monster", "key": "type", "val": "特殊召喚"},
        "alt": "SpecialSummon",
    },
    {
        "cond": {"lang": "ja", "mst": "monster", "key": "race", "val": "幻想魔族"},
        "alt": "Illusionist",
    },
    {
        "cond": {"lang": "ko", "mst": "monster", "key": "type", "val": "특수 소환"},
        "alt": "SpecialSummon",
    },
]

INFO_FOR_OCG_CARD_COM = {
    "except_cards": {
        10000030: {"id": "10000030", "cid": "10113", "name": "マジマジ☆マジシャンギャル"},
        10000040: {"id": "10000040", "cid": "10112", "name": "光の創造神 ホルアクティ"},
    },
    "cardName_translations": {"D－HERO": "D-HERO"},
}

CARDS_NINE_ORDER = {
    "10000030": {"id": "10000030", "cid": "10113", "name": "Magi Magi ☆ Magician Gal"},
    "10000040": {
        "id": "10000040",
        "cid": "10112",
        "name": "Holactie the Creator of Light",
    },
    "100000101": {"id": "100000101", "cid": "<NA>", "name": "Ojamandala"},
    "111000561": {"id": "111000561", "cid": "<NA>", "name": "Get Your Game On!"},
}


CARD_INFO_TYPE_MODIFY = {"Xyz": "XYZ"}

LANGS_ALL = ["ja", "en", "de", "fr", "it", "es", "pt", "ko"]  # , "ae"
ZERO_DATE = "1990-01-01"

CARD_INFO_KEYS = [
    "name",
    "type",
    "race",
    "atk",
    "def",
    "attribute",
    "scale",
    "level",
    "LMarker",
    "cid",
    "id",
    "lang",
    "encImg",
]

# -

# ## ----- class YGO_DB_Updater -----


class YGO_DB_Updater:
    def __init__(
        self,
        env_path: Optional[str] = None,
        localLogPath: Optional[str] = None,
        updateIsValid: bool = True,
        uploadIsValid: bool = True,
        paraIsValid: bool = True,
        postOnline: bool = True,
        repoInfos: Optional[dict] = None,
        IsTest: bool = False,
        langs: Optional[list] = None,
    ):
        self.updateIsValid = updateIsValid
        self.uploadIsValid = uploadIsValid
        self.paraIsValid = paraIsValid
        self.postOnline = postOnline
        self.IsTest = IsTest
        self.env_path = env_path
        self.langsAll = langs or LANGS_ALL

        self.load_env()
        self.log_path = localLogPath or "./output.log"
        self.github_token = os.getenv("GITHUB_TOKEN")
        self.post_url = os.getenv("POST_LOG_URL")
        self.post_auth = os.getenv("POST_LOG_AUTH")
        self.repoInfos = repoInfos or REPO_INFOS

        pass

    def load_env(self, env_path: Optional[str] = None) -> None:
        if env_path is None:
            env_files_tmp = [
                Path(__file__).parent / ("../" * ind + ".env") for ind in range(3)
            ]
        elif env_path.startswith("./"):
            env_files_tmp = [Path(__file__).parent / (env_path.replace("./", "", 1))]
        elif isinstance(env_path, str):
            env_files_tmp = [Path(env_path)]
        else:
            env_files_tmp = []
        env_files = [s for s in env_files_tmp if s.is_file()]

        if len(env_files) > 0:
            dotenv.load_dotenv(env_files[0], override=True)
        else:
            message = "There is no valid env file:\n\t" + "\n\t".join(
                map(str, env_files_tmp)
            )
            print(message)

    # # operate GitHub

    def operateGitHub(
        self,
        method: str = "upload",
        data: Optional[dict] = {},
        repoInfo: Optional[dict] = None,
        commit_name: Optional[str] = None,
        github_token: Optional[str] = None,
    ) -> dict:
        github_token = github_token or self.github_token
        repoInfo = repoInfo or self.repoInfos["DB"]
        header_auth = {
            "Accept": "application/vnd.github.v3+json",
            "Authorization": f"Bearer {github_token}",
        }

        if method == "download":
            git_content_url = "https://api.github.com/repos/{}/{}/contents/data".format(
                repoInfo["user"], repoInfo["repo"]
            )
            res = requests.get(git_content_url, headers=header_auth)
            if res.status_code != 200:
                title = "Error when using GitHub API"
                content = json.dumps(repoInfo) + "\n" + json.dumps(res.json())
                self.postLog(title=title, content=content)
                return {}
            res_content = res.json()
            sha = [
                s["sha"]
                for s in res_content
                if isinstance(s, dict) and s["path"] == repoInfo["path"]
            ]
            if len(sha) == 0:
                title = "Cannot access the file in GitHub API"
                content = json.dumps(repoInfo)
                self.postLog(title=title, content=content)
                return {}
            git_data_url = "https://api.github.com/repos/{}/{}/git/blobs/{}".format(
                repoInfo["user"], repoInfo["repo"], sha[0]
            )
            res = requests.get(git_data_url, headers=header_auth)
            if res.status_code != 200:
                title = "Failed to get with GitHub API"
                content = json.dumps(repoInfo) + "\n" + json.dumps(res.json())
                self.postLog(title=title, content=content)
                return {}
            res_data = res.json()
            content = base64.b64decode(res_data["content"]).decode()
            return json.loads(content)
        elif method == "upload":
            if self.IsTest is True:
                repoInfo = {
                    **repoInfo,
                    "path": "test/" + repoInfo["path"],
                }
            git_content_url = "https://api.github.com/repos/{}/{}/contents/data".format(
                repoInfo["user"], repoInfo["repo"]
            )

            res = requests.get(git_content_url, headers=header_auth)
            if res.status_code != 200:
                title = "Error when using GitHub API"
                content = json.dumps(repoInfo) + "\n" + json.dumps(res.json())
                self.postLog(title=title, content=content)
                return {}
            res_content = res.json()
            sha = [s["sha"] for s in res_content if s["path"] == repoInfo["path"]]
            git_put_url = "https://api.github.com/repos/{}/{}/contents/{}".format(
                repoInfo["user"], repoInfo["repo"], repoInfo["path"]
            )
            header_put = {
                "Accept": "application/vnd.github.v3+json",
                "Authorization": f"Bearer {github_token}",
            }
            message = f"regular update@{datetime.date.today()}"
            content = json.dumps(data)
            bodyTmp = {"sha": sha[0]} if len(sha) > 0 else {}
            body = {
                "message": message,
                "content": base64.b64encode(content.encode()).decode(),
                **bodyTmp,
            }
            res = requests.put(
                git_put_url, headers=header_put, data=json.dumps(body, allow_nan=False)
            )
            if res.status_code != 200:
                title = "Failed to post with GitHub API"
                content = json.dumps(repoInfo) + "\n" + json.dumps(res.json())
                self.postLog(title=title, content=content)
                return {}
            res_json = res.json()
            return res_json

    # # ---- make db_base with db.ygoprodeck.com/api/v7 ---------
    def make_db_base(self, params: dict = {}, dataIn: list = []) -> pd.DataFrame:
        dt_td = datetime.date.today()
        if dataIn == []:
            params_default = {"misc": "yes"}
            params = {**params_default, **params}
            url = "https://db.ygoprodeck.com/api/v7/cardinfo.php"
            res_cards = requests.get(url, params=params).json()
            data = res_cards["data"]
        else:
            data = dataIn
        # info_dicts = {}

        dicts_forDf = []
        for infoIn in data:
            typeIn = infoIn["type"]
            IsMonster = "Monster" in typeIn
            raceIn = infoIn["race"]
            hasEffect = (
                "Effect"
                if IsMonster and "has_effect" in infoIn["misc_info"][0].keys()
                else ""
            )
            levelIn = infoIn.get("level", False)
            linkvalIn = infoIn.get("linkval", None)
            otIn = [
                s
                for s in infoIn["misc_info"][0]["formats"][::-1]
                if s in ["OCG", "TCG"]
            ]
            LMarkerDic = {"Bottom": "D", "Left": "L", "Right": "R", "Top": "U"}
            LMarkerDic2 = {
                "LD": "1",
                "D": "2",
                "RD": "3",
                "L": "4",
                "R": "6",
                "LU": "7",
                "U": "8",
                "RU": "9",
            }
            card_ids = [s["id"] for s in infoIn["card_images"]]
            for card_id in card_ids:
                # ignore future cards
                dates = [
                    info.get(k)
                    for info in infoIn["misc_info"]
                    for k in ["ocg_date", "tcg_date"]
                ]
                IsOnSale = any(
                    s is not None
                    and (datetime.datetime.strptime(s, "%Y-%m-%d").date() - dt_td).days
                    <= 0
                    for s in dates
                )
                if IsOnSale is False:
                    continue
                # Token will be skipped
                if "Token" in typeIn or "Skill" in typeIn:
                    continue
                # OCG or TCG is reqi\uired in ot
                if not ("TCG" in otIn or "OCG" in otIn):
                    continue
                infoTmps = [
                    {k: infoIn[k] for k in ["name"]},
                    {"type": typeIn.replace(" ", ","), "race": raceIn}
                    if IsMonster
                    else {
                        "type": re.sub(
                            r"\sCard", "", f"{raceIn} {typeIn} {hasEffect}"
                        ).replace(" ", ","),
                        "race": None,
                    },
                    {
                        k: infoIn.get(k, None)
                        for k in ["atk", "def", "attribute", "scale"]
                    },
                    {
                        "level": levelIn or linkvalIn,  # infoIn.get("linkval", None),
                        "LMarker": "".join(
                            [
                                LMarkerDic2[
                                    "".join(LMarkerDic[t] for t in s.split("-")[::-1])
                                ]
                                for s in infoIn["linkmarkers"]
                            ]
                        )
                        if "linkmarkers" in infoIn.keys()
                        else None,
                        "ot": "/".join(otIn),
                        "cid": infoIn["misc_info"][0].get("konami_id", None),
                    },
                    {"id": str(card_id)},
                ]
                dict_forDf = {}
                for infoTmp in infoTmps:
                    dict_forDf.update(infoTmp)
                dicts_forDf.append(dict_forDf)

        return pd.DataFrame(dicts_forDf)

    # ## obtain Jap info from ocg-card.com

    # +
    def _obtainJapInfos(
        self,
        formIn: str = "id",
        valsIn: dict = {},
        cardName_translations: dict = INFO_FOR_OCG_CARD_COM["cardName_translations"],
    ) -> dict:
        vals = valsIn if isinstance(valsIn, dict) else {s: s for s in valsIn}
        if len(vals.keys()) == 0:
            return {}
        form = {"id": "pass", "name": "name"}[formIn]
        query = "&".join(
            [
                f"{form}_{ind}={s}&{form}-op_{ind}=3"
                for ind, s in enumerate(vals.values())
            ]
        )
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
            "tr.status-height,tr.status-height2, tr.status-height3, tr.spell-height"
        )
        for elem in elems:
            tds = elem.select("td")
            cardNameTmp = tds[1].decode_contents(formatter="html")
            cardName = re.sub(r"<div.*/div>", "", cardNameTmp)
            for k, v in cardName_translations.items():
                cardName = cardName.replace(k, v)
            if not tds[0].has_attr("class") or not "card-number" in tds[0]["class"]:
                continue
            elif len(tds) < 6:
                title = "Bad structure of td at ocg-card.com"
                content = str(tds)
                self.postLog(title, content)
            cardIdTmp = tds[3].decode_contents(formatter="html")
            cardId = (re.search(r"\d+", cardIdTmp) or [""])[0]
            cid_dbTmp = tds[5].decode_contents(formatter="html")
            cid_db = (re.search(r'(?<=cid=)\d+(?=">公式)', cid_dbTmp) or [""])[0]
            keyId = str(int(cardId)) if form == "pass" else cid_db
            if cardId != "" and (form == "pass" or cid_db in vals.keys()):
                try:
                    cardInfos[keyId] = {
                        "name": html.unescape(cardName),
                        "id": str(int(cardId)),
                        "cid": int(cid_db),
                    }
                except Exception as e:
                    title = "Error with retrieving at ocg-card.com"
                    content = f"name: {cardName}, id: {cardId}, cid: {cid_db}"
                    self.postLog(title, content)

        return cardInfos

    def obtainJapInfos(self, formIn: str = "id", valsIn: dict = {}) -> dict:
        valsIn2 = valsIn if (type(valsIn) == "dict") else {s: s for s in valsIn}
        length_vals = len(valsIn2.keys())
        cardInfos = {}
        kvs = list(valsIn2.items())
        delta = 3
        showCount = 0
        showDelta = (length_vals - 1) // 10 + 1
        print(f"  Retrieving {length_vals} OCG cards from ocg-card.com")
        for cycle in range(length_vals // delta + 1):
            if cycle * delta > (showCount + 1) * showDelta:
                showCount += 1
                print("■", end="")
            valsTmp = {
                kvs[ind][0]: kvs[ind][1]
                for ind in range(cycle * delta, min((cycle + 1) * delta, length_vals))
            }
            newInfo = self._obtainJapInfos(formIn, valsTmp)
            cardInfos.update(newInfo)
        print("\n")
        return cardInfos

    # -

    # #  ------- terms Langs ------

    def _obtainTermDic(self, lang: str = "ja") -> dict:
        url = f"https://www.db.yugioh-card.com/yugiohdb/card_search.action?request_locale={lang}"
        res = requests.get(url)
        soup = BeautifulSoup(res.text, "html.parser")

        # ## spell, trap
        selectors = {
            mt: f"div#filter_effect_set>ul.filter_effect_{mt}.fliter_btns>li>span>span"
            for mt in ["magic", "trap"]
        }
        mt_dic = {"magic": "spell", "trap": "trap"}
        term_st_dic = {
            mt_dic[mt]: {"type": [span.text.strip() for span in soup.select(sel)]}
            for mt, sel in selectors.items()
        }

        # ## monster
        selectors = {
            "attribute": "div#filter_attribute>ul.fliter_btns>li>span>span",
            "race": "div#filter_specis>ul.fliter_btns>li>span",
            "type": "div#filter_other:has(div.title>div.bottom)>ul.fliter_btns>li>span",
        }
        term_mon_dic = {
            "monster": {
                key: [span.text.strip() for span in soup.select(sel)]
                for key, sel in selectors.items()
            }
        }

        return {**term_mon_dic, **term_st_dic}

    def _judgeExcept(self, lang, mst, key, val):
        infoIn = {"lang": lang, "mst": mst, "key": key, "val": val}
        excepts = EXCEPTS_FOR_TERM_ARR
        for info_except in excepts:
            if all(
                info_except["cond"][v] == infoIn[v] for v in info_except["cond"].keys()
            ):
                return info_except["alt"]
        return None

    def obtainTermDic_Langs(self, langs: Optional[list] = None) -> dict:
        if langs is None:
            langs = self.langsAll
        term_dics_tmp = {lang: self._obtainTermDic(lang=lang) for lang in langs}
        term_dics_Langs = {}
        for lang, term_dic_mst in term_dics_tmp.items():
            term_dics_Langs[lang] = {}
            for mst, term_dic in term_dic_mst.items():
                term_dics_Langs[lang][mst] = {}
                for key, _term_list in term_dic.items():
                    ind_term = 0
                    term_dic = {}
                    for term in term_dics_tmp[lang][mst][key]:
                        judged = self._judgeExcept(lang, mst, key, term)
                        if judged is None:
                            term_dic[term] = term_dics_tmp["en"][mst][key][ind_term]
                            ind_term += 1
                        else:
                            term_dic[term] = judged
                    term_dics_Langs[lang][mst][key] = term_dic
        return term_dics_Langs

    # # ------ cardList Langs ------

    def obtainCardsNum(self, lang: str = "ja") -> int:
        sort = "21"
        rp = 10
        page = 1
        url = (
            f"https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=1&sess=1&rp={rp}"
            + f"&sort={sort}&page={page}&keyword=&stype=1&ctype=&othercon=2&starfr=&starto=&pscalefr="
            + f"&pscaleto=&linkmarkerfr=&linkmarkerto=&link_m=2&atkfr=&atkto=&deffr=&defto=&request_locale={lang}"
        )
        res = requests.get(url)
        soup = BeautifulSoup(res.text, "html.parser")
        max_page = re.findall(
            r"ChangePage\((\d+)\)", soup.select("a.yaji.max")[0]["href"]
        )[0]
        return rp * int(max_page)

    def _obtainSoup(self, url):
        res = requests.get(url)
        soup = BeautifulSoup(res.text, "html.parser")
        js_script = soup.select('script[type="text/javascript"]')[5]
        enc_cid_dic = {
            k: v
            for k, v in re.findall(
                r"/yugiohdb/get_image\.action\?type=1&osplang=1&cid=(\d*)&ciid=1&enc=([^&']*)'",
                js_script.text,
            )
        }
        return soup, enc_cid_dic

    # def obtainCardInfo_fromYGODB(self, page: int, lang: str = "ja", rp: int = 99999) -> dict:
    #     sort = "21"
    #     url = (
    #         f"https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=1&sess=1&rp={rp}"
    #         + f"&sort={sort}&page={page}&keyword=&stype=1&ctype=&othercon=2&starfr=&starto=&pscalefr="
    #         + f"&pscaleto=&linkmarkerfr=&linkmarkerto=&link_m=2&atkfr=&atkto=&deffr=&defto=&request_locale={lang}"
    #     )
    #     res = requests.get(url)
    #     soup = BeautifulSoup(res.text, "html.parser")
    #     js_script = soup.select('script[type="text/javascript"]')[5]
    #     enc_cid_dic = {
    #         k: v
    #         for k, v in re.findall(
    #             r"/yugiohdb/get_image\.action\?type=1&osplang=1&cid=(\d*)&ciid=1&enc=([^&']*)'",
    #             js_script.text,
    #         )
    #     }
    #     return {
    #         s["value"]: {
    #             "name": t.text,
    #             "cid": s["value"],
    #             "encImg": enc_cid_dic.get(s["value"], None),
    #         }
    #         for s, t in zip(soup.select("input.cid"), soup.select("span.card_name"))
    #     }

    def obtainCardInfosAll_fromYGODB(
        self,
        page: int,
        lang: str = "ja",
        rp: int = 99999,
        flag_allowLack: bool = True,
        term_dic: dict = {},
    ):
        sort = 21
        url = (
            f"https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=1&sess=1&rp={rp}"
            + f"&sort={sort}&page={page}&keyword=&stype=1&ctype=&othercon=2&starfr=&starto=&pscalefr="
            + f"&pscaleto=&linkmarkerfr=&linkmarkerto=&link_m=2&atkfr=&atkto=&deffr=&defto=&request_locale={lang}"
        )

        for _count_tmp in range(2):
            soup, enc_cid_dic = self._obtainSoup(url)
            if flag_allowLack is True or len(enc_cid_dic.values()) == rp:
                break
        else:
            title = "lack of cids and encImgs at yugioh db"
            content = "There are lack of {} - {} = {} cids and encImgs at yugioh db:\n\t{}".format(
                rp, len(enc_cid_dic.keys()), rp - len(enc_cid_dic.keys()), url
            )
            self.postLog(title, content)

        cardInfos = {}
        for elm_card in soup.select("#card_list>div.t_row"):
            cid_now = elm_card.select("input.cid")[0]["value"]
            name_now = elm_card.select("input.cnm")[0]["value"]
            cardInfo_basic = {
                "cid": elm_card.select("input.cid")[0]["value"],
                "encImg": enc_cid_dic.get(cid_now, None),
                "lang": f"{lang} ",
            }

            try:
                cardInfo_complex = self._obtainCardInfoComplex(elm_card, term_dic)
            except Exception as e:
                title = f"Error when obtaining complex card info"
                content = "cardName: {}\n{}".format(name_now, str(e))
                self.postLog(title, content)
                cardInfo_keys = CARD_INFO_KEYS
                cardInfo_complex = {k: None for k in cardInfo_keys}
            cardInfo = {
                **cardInfo_complex,
                **cardInfo_basic,
                **{f"name_{lang_tmp}": None for lang_tmp in self.langsAll},
            }
            cardInfo[f"name_{lang}"] = (
                name_now if not isinstance(name_now, tuple) else name_now[0]
            )
            cardInfos[cid_now] = cardInfo
        return cardInfos

    def _obtainCardInfoComplex(self, elm_card: object, term_dic: dict) -> dict:
        elm_card_spec = elm_card.select("dl.flex_1>dd.box_card_spec")[0]
        attr_src_tmp = elm_card_spec.select("span.box_card_attribute>img")[0]["src"]
        card_attr = re.findall(r"icon_(\S+)\.png", attr_src_tmp)[0]
        try:
            if card_attr in ["spell", "trap"]:
                card_basic_type = card_attr
            else:
                card_basic_type = "monster"

            cardInfo_keys = CARD_INFO_KEYS
            cardInfo = {k: None for k in cardInfo_keys}
            card_type_list = [card_basic_type.capitalize()]
            if card_basic_type in ["spell", "trap"]:
                box_eff = elm_card_spec.select("span.box_card_effect>span")
                if len(box_eff) > 0:
                    type_add_lang = box_eff[0].text
                    card_type_list.append(
                        term_dic[card_basic_type]["type"][type_add_lang]
                    )
                else:
                    card_type_list.append("Normal")
                cardInfo["type"] = ",".join(card_type_list)
            else:
                cardInfo["atk"] = re.findall(
                    r"[\d\?]+", elm_card_spec.select(f"span.atk_power>span")[0].text
                )[0]
                cardInfo["attribute"] = card_attr.capitalize()

                box_link_img = elm_card_spec.select("span.box_card_linkmarker>img")
                if len(box_link_img) > 0:
                    # for link
                    LMarker_src_tmp = box_link_img[0]["src"]
                    LMarker = re.findall(r"link(\d+)\.png", LMarker_src_tmp)[0]
                    cardInfo["LMarker"] = LMarker
                    cardInfo["level"] = len(LMarker)
                else:
                    cardInfo["level"] = re.findall(
                        r"\d+",
                        elm_card_spec.select("span.box_card_level_rank>span")[0].text,
                    )[0]
                    cardInfo["def"] = re.findall(
                        r"[\d\?]+", elm_card_spec.select("span.def_power>span")[0].text
                    )[0]
                box_pen_scale = elm_card.select(
                    "dl.flex_1>dd.box_card_pen_info>span.box_card_pen_scale"
                )
                if len(box_pen_scale) > 0:
                    # for pendlumn
                    cardInfo["scale"] = re.findall(r"\d+", box_pen_scale[0].text)[0]

                type_other_text = elm_card_spec.select(
                    "span.card_info_species_and_other_item>span"
                )[0].text
                type_other_list = [
                    s.strip()
                    for s in re.findall(
                        r"[【】／/\[\]]\s*([^【】／/\[\]]*)\s*[^【】／/\[\]]", type_other_text
                    )
                    if len(s) > 0
                ]

                card_race_lang = [
                    s for s in type_other_list if s in term_dic["monster"]["race"]
                ][0]
                card_other_type = [
                    term_dic["monster"]["type"][s].capitalize()
                    for s in type_other_list
                    if s != card_race_lang
                ]
                card_type_list.extend(card_other_type)
                cardInfo["type"] = ",".join(
                    [CARD_INFO_TYPE_MODIFY.get(s, s) for s in card_type_list]
                )
                cardInfo["race"] = term_dic["monster"]["race"][
                    card_race_lang
                ].capitalize()
        except Exception as e:
            title = "Error when parsing yugioh db to obtain complex card info"
            content = "\t{}\n{}\n{}".format(
                elm_card.select("input.cnm")[0]["value"], cardInfo, str(e)
            )
            self.postLog(title, content)
        return cardInfo

    def _updateCardInfosAll_Lang(
        self, lang: str, cardInfos_old: dict, rp: int = 99999, term_dic: dict = {}
    ) -> dict:
        cards_num = self.obtainCardsNum(lang=lang)
        print(lang, cards_num)
        cardInfos = cardInfos_old
        page_max = (cards_num + rp - 1) // rp
        for page in range(1, page_max + 1):
            print("■", end="")
            cardInfos_tmp = self.obtainCardInfosAll_fromYGODB(
                page=page,
                lang=lang,
                rp=rp,
                flag_allowLack=(page == page_max and page > 1),
                term_dic=term_dic,
            )
            if set(cardInfos_tmp.keys()) <= set(cardInfos.keys()):
                break
            cardInfos.update(cardInfos_tmp)
        print("")
        return {lang: cardInfos}

    def updateCardInfosAll_Langs(
        self,
        cardInfos_Langs_old: dict = {},
        term_dics_Langs: dict = {},
        langs: Optional[list] = None,
        paraIsValid: Optional[bool] = None,
    ) -> dict:
        if langs is None:
            langs = self.langsAll
        if paraIsValid is None:
            paraIsValid = self.paraIsValid
        if not isinstance(cardInfos_Langs_old, dict):
            cardInfos_Langs_old = {}

        if paraIsValid is False:
            results_dic = {}
            for lang in langs:
                cardInfos_Lang_old = cardInfos_Langs_old.get(lang, {})
                result_tmp = self._updateCardInfosAll_Lang(
                    lang=lang,
                    cardInfos_old=cardInfos_Lang_old,
                    term_dic=term_dics_Langs[lang],
                )
                results_dic.update(result_tmp)
            return results_dic
        future_list = []
        try:
            with futures.ThreadPoolExecutor(
                max_workers=multiprocessing.cpu_count()
            ) as executor:
                for lang in langs:
                    cardInfos_Lang_old = cardInfos_Langs_old.get(lang, {})
                    future = executor.submit(
                        self._updateCardInfosAll_Lang,
                        lang=lang,
                        cardInfos_old=cardInfos_Lang_old,
                        term_dic=term_dics_Langs[lang],
                    )
                    future_list.append(future)
                _ = futures.as_completed(fs=future_list)
        except Exception as e:
            title = "Error when updating CardInfos for multi langs"
            content = str(e)
            self.postLog(title, content)
        return {
            k: v for future_tmp in future_list for k, v in future_tmp.result().items()
        }

    def combineCardInfosAll_Langs(self, cardInfos_Langs: dict = {}) -> pd.DataFrame:
        df_comb = None
        for lang in self.langsAll:
            cardInfos_Lang = cardInfos_Langs[lang]
            df_tmp = pd.DataFrame(cardInfos_Lang.values()).set_index("cid")
            df_tmp["lang"] = df_tmp["lang"].where(df_tmp["lang"].isna(), None)
            df_tmp["lang"] = ""
            if df_comb is None:
                df_comb = df_tmp
                df_comb["lang"] = f"{lang} "
                continue
            else:
                df_comb = pd.concat(
                    [df_comb, df_tmp[~df_tmp.index.isin(df_comb.index)]]
                )
            df_comb[f"name_{lang}"] = df_tmp[f"name_{lang}"]
            df_tmp["lang"] = f"{lang} "
            df_comb.loc[df_tmp.index, "lang"] += f"{lang} "
        return df_comb

    # # ----- make good db -------
    def make_good_db(
        self,
        on_regular: bool = False,
        githubReuse_df: bool = True,
        githubReuse_lang: bool = True,
        githubReuse_id2cid: bool = True,
    ) -> dict:
        # uploadIsValid = addInfo.get("uploadIsValid", True)
        info_data_empty = {"ocg": {}, "date": ZERO_DATE}
        repoInfos = self.repoInfos

        # ## obtain old info

        if githubReuse_df is True:
            info_data_old = self.operateGitHub("download", repoInfo=repoInfos["DB"])
            if not isinstance(info_data_old, dict):
                info_data_old = info_data_empty

        else:
            info_data_old = info_data_empty

        lastUpdated = info_data_old.get("date", ZERO_DATE)
        date_today = datetime.date.today()

        data_cardInfos_Langs = self.operateGitHub(
            "download", repoInfo=repoInfos["cardListLang"]
        )

        if githubReuse_lang is True and isinstance(data_cardInfos_Langs, dict):
            cardInfos_Langs_old = data_cardInfos_Langs.get("cardInfos_Langs", {})
            term_dics_Langs = data_cardInfos_Langs.get("term_dics_Langs", {})
        else:
            cardInfos_Langs_old = {}
            term_dics_Langs = {}
        if term_dics_Langs == {}:
            term_dics_Langs = self.obtainTermDic_Langs()

        # ## obtain cardInfos Langs
        updateIsInvalid = (
            lastUpdated == f"{date_today}" or date_today.weekday() % 3 != 2
        )
        if on_regular is True and updateIsInvalid is True:
            title = "update is skipped"
            content = f"{date_today}: update is skipped"
            self.postLog(title, content)
            return False

        if githubReuse_id2cid is True:
            id2cid_old = info_data_old.get("id2cid", {})
        else:
            id2cid_old = {}
        print("1 / 3: obtain base info of database")
        df_base = self.make_db_base()

        dic_dtype = {"Int64": ["atk", "def", "level", "scale", "cid"]}
        df_base = df_base.astype(
            {s: k for k, v in dic_dtype.items() for s in v}
        ).astype({s: "<U32" for k, v in dic_dtype.items() for s in v})
        df_base = df_base.mask((df_base == "<NA>") | (df_base.isnull()))

        # merge 1st
        df_base["cid"] = df_base["cid"].mask(
            (df_base["cid"].isna()) & (df_base["id"].isin(id2cid_old.keys())),
            df_base["id"].map(id2cid_old),
        )

        # exceptions
        except_cards = CARDS_NINE_ORDER
        for cardInfo in except_cards.values():
            df_base["cid"] = df_base["cid"].mask(
                (df_base["id"] == int(cardInfo["id"]))
                & (df_base["name"] == cardInfo["name"]),
                str(cardInfo["cid"]),
            )

        # check cards without cid
        df_withoudCid = df_base[df_base["cid"].isna()]

        message = "2 / 3: obtain info of {} cards from ocg-card.com\n\t{}".format(
            len(df_withoudCid), "\n\t".join(df_withoudCid["name"])
        )
        print(message)
        if len(df_withoudCid) > 0:
            cardInfos_searched = self.obtainJapInfos("id", df_withoudCid["id"])
            id2cid_fromOCGCARD = {
                int(s["id"]): str(s["cid"]) for s in cardInfos_searched.values()
            }
            df_base["cid"] = df_base["cid"].mask(
                df_base["id"].isin(id2cid_fromOCGCARD.keys()),
                df_base["id"].map(id2cid_fromOCGCARD),
            )
            id2cid = id2cid_fromOCGCARD
        else:
            id2cid = {}
            cardInfos_searched = {}

        # ### db_new: index -> cid
        df_new = df_base[~df_base["cid"].isna()].set_index("cid")
        df_new = df_new[df_new.index != "<NA>"]

        # ### add to lang info
        print("3 / 3: add lang info")
        if self.updateIsValid is True:
            cardInfos_Langs = self.updateCardInfosAll_Langs(
                cardInfos_Langs_old=cardInfos_Langs_old,
                term_dics_Langs=term_dics_Langs,
                paraIsValid=self.paraIsValid,
            )
            if self.uploadIsValid is True:
                self.operateGitHub(
                    "upload",
                    data={
                        "cardInfos_Langs": cardInfos_Langs,
                        "term_dics_Langs": term_dics_Langs,
                        "date": f"{date_today}",
                    },
                    repoInfo=repoInfos["cardListLang"],
                )
        else:
            cardInfos_Langs = cardInfos_Langs_old
        df_comb = self.combineCardInfosAll_Langs(cardInfos_Langs)
        df_comb.loc[df_new.index, "id"] = df_new["id"]
        df_comb["name"] = df_comb["name_ja"]
        df_encImgInvalid = df_comb[df_comb["encImg"].isnull()]
        if len(df_encImgInvalid) > 0:
            title = "Invalid encImgs"
            content = "\nThere are {} invalid encImgs:\n{}\n".format(
                len(df_encImgInvalid),
                "\n".join(
                    "\t{}\t{}\t{}".format(row["name_ja"], row["cid"], row["id"])
                    for _, row in df_encImgInvalid.iterrows()
                ),
            )
            self.postLog(title, content)

        df_comb = df_comb.mask(df_comb.isna(), "NaN")
        df_upload = df_comb.reset_index()
        info_data_new = {
            "date": f"{date_today}",
            "all": {k: v.tolist() for k, v in df_upload.items()},
            "id2cid": {**id2cid_old, **id2cid},
            "id2cid_before": id2cid,
            "from_ocgCardCom": cardInfos_searched,
        }
        if self.uploadIsValid is True:
            self.operateGitHub("upload", info_data_new, repoInfo=repoInfos["DB"])
        title = "Update is Finished"
        content = "{}\t{} cards in df".format(date_today, len(df_comb))
        self.postLog(title, content)
        return info_data_new

    def postLog(
        self, title: str = "", content: str = "", flag_local: Optional[bool] = None
    ) -> None:
        if flag_local is None:
            flag_local = not self.postOnline
        log_path = Path(self.log_path or "")
        dt_now = datetime.datetime.now().isoformat()
        url = self.post_url
        message = "\n----\n" + "\t".join([dt_now, title, content]) + "\n----\n"
        if flag_local is False and isinstance(url, str) and len(url) > 0:
            auth = self.post_auth
            headers = {"Authorization": auth, "Accept": "application/json"}
            obj = {
                "kind": "log",
                "title": title,
                "content": content,
                "app": "python_ygo_db_updater",
            }
            res = requests.post(url, headers=headers, json=obj, verify=False)
        elif log_path.is_file():
            with open(log_path, "a") as f:
                f.write(message)

        print(message)


# # ------- main ----------


def main() -> None:
    sysargs = parser.parse_args()
    # args = sys.argv
    on_regular = sysargs.regular
    reuse = not sysargs.not_reuse
    para = not sysargs.no_para
    uploadIsValid = not sysargs.not_upload
    postOnline = not sysargs.not_post_log
    IsTest = sysargs.test
    if isinstance(sysargs.langs, str):
        langs = [s for s in sysargs.langs.split(",") if len(s) == 2]
    else:
        langs = None

    ydur = YGO_DB_Updater(
        paraIsValid=para,
        uploadIsValid=uploadIsValid,
        postOnline=postOnline,
        IsTest=IsTest,
        langs=langs,
    )
    ydur.make_good_db(
        on_regular=on_regular,
        githubReuse_df=reuse,
        githubReuse_lang=reuse,
        githubReuse_id2cid=reuse,
    )


if __name__ == "__main__":
    main()

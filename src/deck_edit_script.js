<script type="text/javascript">
<!--

	$(function(){
		

		$('#dno').val('45');
		$('#dno').change(function() {
			var value = $(this).val();
			
			location.href='/yugiohdb/member_deck.action?cgid=87999bd183514004b8aa8afa1ff1bdb9&dno=' + value + '&request_locale=ja';
		});
		$('#sort').val('1');
		$('#sort').change(function() {
			var value = $(this).val();
		        var str = $(this).val();
		        $(this).parents('form').submit();
		});
		$('.tablink li.'+'2').addClass("now");
		$('#deck_display').val('2');

		$('#deck_display').change(function() {
			var value = $(this).val();
			
			$('#deck_image,#deck_detailtext,#deck_text').hide();

			$('.tablink li').removeClass("now");
			$('.tablink li.'+value).addClass("now");
			switch (value) {
			case '1':
				$('#deck_text').show();
				$("#num_total_m").attr("href", "#monster_list");
				$("#num_total_e").attr("href", "#extra_list");
				$("#num_total_s").attr("href", "#side_list");
				break;
			case '2':
				$('#deck_image').show();
				$("#num_total_m").attr("href", "#main");
				$("#num_total_e").attr("href", "#extra");
				$("#num_total_s").attr("href", "#side");
				break;
			case '3':
				$('#deck_detailtext').show();
				$("#num_total_m").attr("href", "#detailtext_main");
				$("#num_total_e").attr("href", "#detailtext_ext");
				$("#num_total_s").attr("href", "#detailtext_side");

				break;
			}

		});
		$('.tablink li').click(function(){
			$('.tablink li').removeClass("now");
			clm = $(this).attr("class");

			$('#deck_display').val(clm);
			$('#deck_display').trigger('change');
		});

		
		
				$('.card_image_monster_0_1').attr('src', '/yugiohdb/get_image.action?type=1&lang=ja&cid=14741&ciid=1&enc=sQvHuRh3DhcHxLUtUIJ-mw&osplang=1').show();
		
				$('.card_image_monster_1_1').attr('src', '/yugiohdb/get_image.action?type=1&lang=ja&cid=11236&ciid=1&enc=MOTyyL87MntwWiHWss0I9g&osplang=1').show();
		
				$('.card_image_monster_2_1').attr('src', '/yugiohdb/get_image.action?type=1&lang=ja&cid=17415&ciid=1&enc=T-Nnix9s3iyj-C-fKVKkwg&osplang=1').show();
		
				$('.card_image_monster_3_1').attr('src', '/yugiohdb/get_image.action?type=1&lang=ja&cid=16195&ciid=1&enc=mX8I79lWCES3fYrc34NaEA&osplang=1').show();
		
				$('.card_image_monster_4_1').attr('src', '/yugiohdb/get_image.action?type=1&lang=ja&cid=15245&ciid=1&enc=L0pcMp3X_JiW2e2xUOeWMQ&osplang=1').show();
		
				$('.card_image_monster_5_1').attr('src', '/yugiohdb/get_image.action?type=1&lang=ja&cid=17417&ciid=1&enc=mUX7-theA7Moef-vq18onQ&osplang=1').show();
		
				$('.card_image_monster_6_1').attr('src', '/yugiohdb/get_image.action?type=1&lang=ja&cid=17416&ciid=1&enc=O4VtDd1gQzRj_d3ob61XNw&osplang=1').show();
		
				$('.card_image_monster_7_1').attr('src', '/yugiohdb/get_image.action?type=1&lang=ja&cid=12950&ciid=1&enc=by_I8OcuAqgJpPjaezbcNg&osplang=1').show();
		
				$('.card_image_monster_8_1').attr('src', '/yugiohdb/get_image.action?type=1&lang=ja&cid=11708&ciid=1&enc=qxKtakBv-Pa3gtfN4NJdqw&osplang=1').show();
		
				$('.card_image_monster_9_1').attr('src', '/yugiohdb/get_image.action?type=1&lang=ja&cid=17414&ciid=1&enc=i7AsWvwje0AuEk_PpKPeBQ&osplang=1').show();
		
				$('.card_image_monster_10_1').attr('src', '/yugiohdb/get_image.action?type=1&lang=ja&cid=9455&ciid=1&enc=8YGYTdvfU__vw_a5SkYBnQ&osplang=1').show();
		
				$('.card_image_monster_11_1').attr('src', '/yugiohdb/get_image.action?type=1&lang=ja&cid=16194&ciid=1&enc=dI6TQiAM1YdWhveZ82gTkw&osplang=1').show();
		
				$('.card_image_monster_12_1').attr('src', '/yugiohdb/get_image.action?type=1&lang=ja&cid=8933&ciid=1&enc=HjkYuLOAZFgPDRW5_tExdw&osplang=1').show();
		
		
			
				$('.card_image_spell_0_1').attr('src', '/yugiohdb/get_image.action?type=1&lang=ja&cid=6901&ciid=1&enc=uqUIkDdHYUmoQxpBmD2YBg&osplang=1').show();
			
		
			
				$('.card_image_spell_1_1').attr('src', '/yugiohdb/get_image.action?type=1&lang=ja&cid=17066&ciid=1&enc=P9Uw3CS07RO9G3XNmthpvg&osplang=1').show();
			
		
			
				$('.card_image_spell_2_1').attr('src', '/yugiohdb/get_image.action?type=1&lang=ja&cid=13619&ciid=1&enc=diw-7xfIox8Qjat1B7yuOQ&osplang=1').show();
			
		
			
				$('.card_image_spell_3_1').attr('src', '/yugiohdb/get_image.action?type=1&lang=ja&cid=16243&ciid=1&enc=Pzmcbca5WnQaxuayXcyiZw&osplang=1').show();
			
		
			
				$('.card_image_spell_4_1').attr('src', '/yugiohdb/get_image.action?type=1&lang=ja&cid=14627&ciid=1&enc=zKQ4xQyAG_Gqp9XOrwth_A&osplang=1').show();
			
		
			
				$('.card_image_spell_5_1').attr('src', '/yugiohdb/get_image.action?type=1&lang=ja&cid=17462&ciid=1&enc=VyMdvRuauyQLjDE4-42kRA&osplang=1').show();
			
		
			
				$('.card_image_spell_6_1').attr('src', '/yugiohdb/get_image.action?type=1&lang=ja&cid=5432&ciid=1&enc=8J5rBPDVOLdjeKEyDdj5HA&osplang=1').show();
			
		
		
			
				$('.card_image_trap_0_1').attr('src', '/yugiohdb/get_image.action?type=1&lang=ja&cid=13631&ciid=1&enc=GNP_kIy6vDlGQ3wGgRb3wg&osplang=1').show();
			
		
			
				$('.card_image_trap_1_1').attr('src', '/yugiohdb/get_image.action?type=1&lang=ja&cid=17473&ciid=1&enc=Lqtguof-Fgactfnv5ZWzaA&osplang=1').show();
			
		
		
			
				$('.card_image_extra_0_1').attr('src', '/yugiohdb/get_image.action?type=1&lang=ja&cid=17445&ciid=1&enc=lPAW3k-NPuYQksVLNxlUyA&osplang=1').show();
			
		
			
				$('.card_image_extra_1_1').attr('src', '/yugiohdb/get_image.action?type=1&lang=ja&cid=17069&ciid=1&enc=hqeHIcHfR27p9aSV_A2e4Q&osplang=1').show();
			
		
			
				$('.card_image_extra_2_1').attr('src', '/yugiohdb/get_image.action?type=1&lang=ja&cid=12870&ciid=1&enc=3EEo4OybtoMNOshHm3SeUw&osplang=1').show();
			
		
			
				$('.card_image_extra_3_1').attr('src', '/yugiohdb/get_image.action?type=1&lang=ja&cid=17070&ciid=1&enc=pFXvRdQDTWnuTSxP6MGR_g&osplang=1').show();
			
		
			
				$('.card_image_extra_4_1').attr('src', '/yugiohdb/get_image.action?type=1&lang=ja&cid=17146&ciid=1&enc=AUThZCiG9tuwCvsrujaaig&osplang=1').show();
			
		
			
				$('.card_image_extra_5_1').attr('src', '/yugiohdb/get_image.action?type=1&lang=ja&cid=15994&ciid=1&enc=6pnbqWkrzvj9C756ZqJJig&osplang=1').show();
			
		
			
				$('.card_image_extra_6_1').attr('src', '/yugiohdb/get_image.action?type=1&lang=ja&cid=17444&ciid=1&enc=LF1pjbnMR5X8ePnmSdwTPw&osplang=1').show();
			
		
			
				$('.card_image_extra_7_1').attr('src', '/yugiohdb/get_image.action?type=1&lang=ja&cid=11257&ciid=1&enc=NLiLcbfMH_79Nbr3jQauwA&osplang=1').show();
			
		
			
				$('.card_image_extra_8_1').attr('src', '/yugiohdb/get_image.action?type=1&lang=ja&cid=13466&ciid=1&enc=BMuVIl1FJDYrVPO2J6xeKA&osplang=1').show();
			
		
			
				$('.card_image_extra_9_1').attr('src', '/yugiohdb/get_image.action?type=1&lang=ja&cid=14356&ciid=1&enc=oLRv5h91iwfsOj9aCt449g&osplang=1').show();
			
		
			
				$('.card_image_extra_10_1').attr('src', '/yugiohdb/get_image.action?type=1&lang=ja&cid=16537&ciid=1&enc=r2op7tP_0FsvOTUPtfNYww&osplang=1').show();
			
		
			
				$('.card_image_extra_11_1').attr('src', '/yugiohdb/get_image.action?type=1&lang=ja&cid=11878&ciid=1&enc=9NnYWg2kCSWJWzlZr5C2Ew&osplang=1').show();
			
		
		
			
				$('.card_image_side_0_1').attr('src', '/yugiohdb/get_image.action?type=1&lang=ja&cid=13896&ciid=1&enc=TFJclB9vLsdTT2l2_S_NRQ&osplang=1').show();
			
		
			
				$('.card_image_side_1_1').attr('src', '/yugiohdb/get_image.action?type=1&lang=ja&cid=11708&ciid=1&enc=qxKtakBv-Pa3gtfN4NJdqw&osplang=1').show();
			
		
			
				$('.card_image_side_2_1').attr('src', '/yugiohdb/get_image.action?type=1&lang=ja&cid=17469&ciid=1&enc=4dTNmhrO2ZLl0kTKBICTyA&osplang=1').show();
			
		
			
				$('.card_image_side_3_1').attr('src', '/yugiohdb/get_image.action?type=1&lang=ja&cid=14876&ciid=1&enc=9PDeUlZ4hNiGpzQ53IfhGA&osplang=1').show();
			
		
			
				$('.card_image_side_4_1').attr('src', '/yugiohdb/get_image.action?type=1&lang=ja&cid=4678&ciid=1&enc=13OIoGcYDmHajAMdkf175Q&osplang=1').show();
			
		
			
				$('.card_image_side_5_1').attr('src', '/yugiohdb/get_image.action?type=1&lang=ja&cid=11631&ciid=1&enc=k-lRTiX9E4mMDpSnUDRNxg&osplang=1').show();
			
		
			
				$('.card_image_side_6_1').attr('src', '/yugiohdb/get_image.action?type=1&lang=ja&cid=4861&ciid=1&enc=75V0vuoW1vf9opjgQ2G_IQ&osplang=1').show();
			
		
			
				$('.card_image_side_7_1').attr('src', '/yugiohdb/get_image.action?type=1&lang=ja&cid=13631&ciid=1&enc=GNP_kIy6vDlGQ3wGgRb3wg&osplang=1').show();
			
		
			
				$('.card_image_side_8_1').attr('src', '/yugiohdb/get_image.action?type=1&lang=ja&cid=13622&ciid=1&enc=rSvKsgKnFmfmikB5UOyaag&osplang=1').show();
			
		
			
				$('.card_image_side_9_1').attr('src', '/yugiohdb/get_image.action?type=1&lang=ja&cid=15628&ciid=1&enc=q24Du-40ZYHQZGP-NfBp2w&osplang=1').show();
			
		

		
		$('.deck_list tr.row').click(function() {
			window.open($('.link_value', this).val());
		});

		$('textarea').autosize();


	});

	
	$(document).ready(function(){
		
		var value = '2';

		$('#deck_image,#deck_detailtext,#deck_text').hide();

		switch (value) {
		case '1':
			$('#deck_text').show();
			$("#num_total_m").attr("href", "#monster_list");
			$("#num_total_e").attr("href", "#extra_list");
			$("#num_total_s").attr("href", "#side_list");
			break;
		case '2':
			$('#deck_image').show();
				$("#num_total_m").attr("href", "#main");
				$("#num_total_e").attr("href", "#extra");
				$("#num_total_s").attr("href", "#side");
			break;
		case '3':
			$('#deck_detailtext').show();
				$("#num_total_m").attr("href", "#detailtext_main");
				$("#num_total_e").attr("href", "#detailtext_ext");
				$("#num_total_s").attr("href", "#detailtext_side");
			break;
		default:
			break;
		}
		
	});

	function DeckDelete(){
		if(window.confirm('このデッキを削除しますか？')){
			location.href = "/yugiohdb/member_deck.action?ope=7&cgid=87999bd183514004b8aa8afa1ff1bdb9&dno=45&request_locale=ja";
		}
	}

	function updateDeckFavorite(){
		var chngeFavoriteCnt = document.getElementById("favoriteCnt");
		var mycount = 1;
		if (deckFavorite.checked) {
			$.ajax({
				type: 'get',
				url: '/yugiohdb/member_deck.action?ope=9&cgid=87999bd183514004b8aa8afa1ff1bdb9&dno=45&request_locale=ja',
				success: function() {
				},
				error: function(xhr, status, error) {
				}
			});
			if (false) {
				mycount = 0; //自分が登録済み
			}
			chngeFavoriteCnt.innerHTML = 0 + mycount;
		} else{
			$.ajax({
				type: 'get',
				url: '/yugiohdb/member_deck.action?ope=10&cgid=87999bd183514004b8aa8afa1ff1bdb9&dno=45&request_locale=ja',
				success: function() {
				},
				error: function(xhr, status, error) {
				}
			});
			if (true) {
				mycount = 0; //自分が登録済み
			}
			chngeFavoriteCnt.innerHTML = 0 - mycount;

		}
	}
	function updateDeckLikes(){
		var chngelikesCnt = document.getElementById("likesCnt");
		var likesCnt = document.getElementById("deckLikesCnt"); 
		var usrLiksCnt = document.getElementById("usrLikesCnt");
		var chkMaxCnt = document.getElementById("deckLikesUsrCnt");
		if ( Number( chkMaxCnt.value) < 5 ) {
			$.ajax({
				type: 'get',
				url: '/yugiohdb/member_deck.action?ope=11&cgid=87999bd183514004b8aa8afa1ff1bdb9&dno=45&request_locale=ja',
				success: function() {
				},
				error: function(xhr, status, error) {
				}
			});
			likesCnt.value = Number(likesCnt.value) + 1;
			chkMaxCnt.value = Number(chkMaxCnt.value) + 1;
			chngelikesCnt.innerHTML = likesCnt.value;
			usrLiksCnt.innerHTML = chkMaxCnt.value;
		} else {
			crearDeckLikes();

			likesCnt.value = Number(likesCnt.value) - 5;
			chngelikesCnt.innerHTML = likesCnt.value;
			chkMaxCnt.value = 0;         
			usrLiksCnt.innerHTML = 0; 
		}
	}
	function crearDeckLikes(){
			$.ajax({
				type: 'get',
				url: '/yugiohdb/member_deck.action?ope=12&cgid=87999bd183514004b8aa8afa1ff1bdb9&dno=45&request_locale=ja',
				success: function() {
				},
				error: function(xhr, status, error) {
				}
			});
	}

//-->
</script>
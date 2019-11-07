var SITE_MEMBER = function(){
	var member_profile_id = 'member_profile';
	var $member_profile, $join_form, site_lang_code, standard_country, use_shopping, only_one_country;

	var terms_agree = false;

	var policyConfirm = function(){
	};

	var openFindPassword = function(){
		$.cocoaDialog.close();
		$.ajax({
			type: 'POST',
			data: {d: 'd'},
			url: ('/dialog/find_password.cm'),
			dataType: 'html',
			async: true,
			cache: false,
			success: function(html){
				var $html = $(html);
				$.cocoaDialog.open({type: 'site_find_password', custom_popup: $html, hide_event:function(){
					$(window).unbind('keydown');
					}});
			}
		});
	};


	var findToken ='';
	var findSubmit  = function(step,val){
		var that = this;
		if(step=='find'){
			$.ajax({
				type:'POST',
				data:{uid:val,step:1},
				url:('/backpg/find_pass.cm'),
				dataType:'json',
				async:false,
				cache:false,
				success:function(res){
					if(res.msg =='SUCCESS'){
						that.findToken = res.tokn;
						$('#find_step_1').hide();
						$('#find_step_3').hide();
						$('#find_step_2').show();
						$('#find_email, #find_email_2').text(res.email);
					}else if(res.msg == 'not_validate_email' && res.use_email != 'Y'){
						$('#find_step_1').hide();
						$('#find_step_3').hide();
						$('#find_step_2').show();
						$('#find_uid').text(res.uid);
						$('#find_step2_info_1').css({'display':'none'});
						$('#find_step2_info_2').css({'display':'block'});
					}else{
						alert(LOCALIZE.설명_가입되어있지않습니다());
					}
				}
			});
		}else if(step=='send'){
			$.ajax({
				type:'POST',
				data:{tokn:that.findToken,step:2},
				url:('/backpg/find_pass.cm'),
				dataType:'json',
				async:false,
				cache:false,
				success:function(res){
					if(res.msg =='SUCCESS'){
						$('#find_step_1').hide();
						$('#find_step_2').hide();
						$('#find_step_3').show();
						$('#find_email, #find_email_2').text(res.email);
					}else{
						alert(LOCALIZE.설명_이미신청중입니다잠시후다시시도하여주시기바랍니다());
					}
				}
			});
		}

	};

	var openChangePassword = function(c,r,s){
		$.cocoaDialog.close();
		$.ajax({
			type: 'POST',
			data: {c: c, r : r, s : s},
			url: ('/dialog/change_password.cm'),
			dataType: 'html',
			async: true,
			cache: false,
			success: function(html){
				var $html = $(html);
				$.cocoaDialog.open({type: 'site_change_password', custom_popup: $html});
			}
		});

	};

	var changePassword = function(){
		var data = $('#find_password_form').serializeObject();
		$.ajax({
			type:'POST',
			data:data,
			url:('/backpg/change_password.cm'),
			dataType:'json',
			async:false,
			cache:false,
			success:function(res){
				if(res.msg =='SUCCESS'){
					alert(LOCALIZE.설명_비밀번호변경이완료되었습니다());
					location.href="/?mode=login";
				}else{
					if(res.error ==-2){
						alert(LOCALIZE.설명_동일한암호로입력하시기바랍니다());
					}else if(res.error ==-3){
						alert(LOCALIZE.설명_정상적인암호로입력하시기바랍니다());
					}else if(res.error ==-4){
						alert(LOCALIZE.설명_변경가능시간을초과하였습니다());
					}else{
						alert(LOCALIZE.설명_잘못된접근입니다());
					}
				}
			}
		});

	};

	var editProfile = function(back_url){
		$.cocoaDialog.close();
		$.ajax({
			type: 'POST',
			data: {'back_url': back_url},
			url: ('/dialog/join.cm'),
			dataType: 'html',
			async: true,
			cache: false,
			success: function(html){
				var $html = $(html);
				var $join_btn = $html.find('._join_btn');

				$join_btn.off('click').on('click', function(e){
					joinSubmit();
					e.preventDefault();
					return false;
				});

				$.cocoaDialog.open({type: 'site_join', custom_popup: $html});
			}
		});
	};

	var checkRequireOption = function(){
		if($('._requireOption').length > 0 || $('._requireInputOption').length > 0){		// 필수옵션이 존재할 때
			if($('._selected_require_option').length == 0) return false;		// 선택된 필수옵션이 없는 경우
		}

		return true;
	}

	/**
	 *
	 * @param back_url
	 * @param type
	 * @param callback
	 * @param used_login_btn 로그인 버튼을 직접 클릭해서 들어왔을 경우 'Y', 'Y'일 때만 로그인 후 설정된 메뉴로 이동
	 * @param page_type 호출된 페이지, 현재 payment 에서만 사용 중
	 */
	var openLogin = function(back_url,type,callback,used_login_btn, page_type){
		var param = {};
		if ( page_type == 'payment' ) { // 호출된 페이지가 payment 일 경우
			// 필수옵션 선택 유효성 검사 실행
			if ( ! checkRequireOption() ) {
				alert(LOCALIZE.설명_필수옵션이모두선택되어있지않습니다());
				return false;
			}
			
			// 배송국가 param 세팅
			param.country_code = $(".countryList").val();
		}

		var back_url = typeof back_url == 'undefined' ? '':back_url;
		$.cocoaDialog.close();
		$.ajax({
			type: 'POST',
			data: {back_url:back_url,'type':type,'used_login_btn':used_login_btn, 'param' : param},
			url: ('/dialog/login.cm'),
			dataType: 'html',
			async: true,
			cache: false,
			success: function(html){
				var $html = $(html);
				$html.find('._guest_payment').on('click',function(){
					if(typeof callback == 'function')
						callback();
				});
				$.cocoaDialog.open({type: 'site_login', custom_popup: $html});
			}
		});
	};
	var openGuestLogin = function(back_url){
		var back_url = typeof back_url == 'undefined' ? '':back_url;
		$.cocoaDialog.close();
		$.ajax({
			type: 'POST',
			data: {back_url:back_url },
			url: ('/dialog/guest_login.cm'),
			dataType: 'html',
			async: true,
			cache: false,
			success: function(html){
				var $html = $(html);
				$.cocoaDialog.open({type: 'site_login', custom_popup: $html});
			}
		});
	};

	var joinSubmit = function(is_social){
		var data = $join_form.serializeObject();
		$.extend(data, {is_social: is_social ? 'Y' : 'N'});
		$.ajax({
			type:'POST',
			data:data,
			url:('/backpg/join.cm'),
			dataType:'json',
			async:false,
			cache:false,
			success:function(res){
				if(res.msg =='SUCCESS'){
					if ( typeof NP_LOG != 'undefined' ) NP_LOG.CompleteJoin();
					if ( typeof FB_PIXEL != 'undefined' && res.fb_registration_check == 'N'){
						FB_PIXEL.CompleteRegistration();
					}
					if ( typeof DAUM_CTS != 'undefined' ) DAUM_CTS.CompleteJoin();
					if ( typeof ACE_COUNTER != 'undefined' ) ACE_COUNTER.CompleteJoin(res.join_id,res.ace_counter_mobile);
					if ( typeof KAKAO_PIXEL != 'undefined' ) KAKAO_PIXEL.CompleteJoin();
					if ( typeof ACE_COUNTER_PLUS != 'undefined' ) ACE_COUNTER_PLUS.CompleteJoin(res.join_id);
					if ( typeof CHANNEL_TRACE != 'undefined') CHANNEL_TRACE.CompleteJoin();

					terms_agree = true;
					if(res.is_popup){
						if(res.back_url != ''){
							window.location.href = window.location.protocol + '//' + window.location.host + res.back_url;
						}else{
							window.location.reload(true);
						}
					}else{
						if(res.back_url != ''){
							window.location.href = window.location.protocol + '//' + window.location.host + res.back_url;
						}else{
							window.location.href = '/';
						}
					}
					if(res.advanced_trace_data != null){
						if(res.advanced_trace_data.header != ''){
							$('head').append(res.advanced_trace_data.header);
						}
						if(res.advanced_trace_data.body != ''){
							$('body').append(res.advanced_trace_data.body);
						}
						if(res.advanced_trace_data.footer != ''){
							$('footer').append(res.advanced_trace_data.footer);
						}
					}
				}else{
					if(res.code > 0){
						alert(res.msg);
					}else{
						terms_agree = false;
						var $obj = $join_form.find('._' + res.flag);
						$join_form.find('._item').toggleClass('active', false);
						$join_form.find('._item').toggleClass('triangle', false);
						$.each(res.accept, function(e, v){
							var $acc_obj = $join_form.find('._' + v);
							$acc_obj.toggleClass('active', true);

						});
						switch(res.flag){
							case 'name'    :
							case 'uid'    :
							case 'passwd'    :
							case 'gender'    :
							case 'home_page' :
							case 'addr' :
							default :
								$obj.toggleClass('triangle', true);
								$obj.find('input').focus();
								$obj.find('._msg').text(res.msg);
								break;

						}
					}
				}
			}
		});
	};

	var openJoinWithoutTerms = function(){
		terms_agree = true;
		openJoin();
	};

	var openJoin = function(back_url, type){
		$.cocoaDialog.close();
		if(!terms_agree){
			$.ajax({
				type: 'POST',
				data: {d: 'd', type : type},
				url: ('/dialog/join_policy.cm'),
				dataType: 'html',
				async: true,
				cache: false,
				success: function(html){
					var $html = $(html);
					var $policy_check_all = $html.find('._check_all');
					var $agree_list =  $html.find('._join_agree');
					var $join_btn = $html.find('._join_btn');

					$policy_check_all.off('click').on('click', function(){
						$agree_list.prop('checked',$(this).prop('checked'));
					});

					$join_btn.off('click').on('click', function(){
						var missing_agree_cnt = $html.find(".require_agreement:checkbox:not(:checked)").length;
						// 필수항목 동의 누락이 있을 경우
						if(missing_agree_cnt > 0 ){
							alert(LOCALIZE.설명_동의해주세요());
						} else {
							terms_agree = true;
							openJoin();
						}
						event.stopPropagation(); return false;
					});

					$.cocoaDialog.open({type: 'site_join_policy', custom_popup: $html});
				}
			});
		}else{
			terms_agree = false;
			$.ajax({
				type: 'POST',
				data: {d: 'd', 'third_party_agree' : $('#third_party_agree').is(':checked') ? 'Y' : 'N'},
				url: ('/dialog/join.cm'),
				dataType: 'html',
				async: true,
				cache: false,
				success: function(html){
					var $html = $(html);
					var $join_btn = $html.find('._join_btn');

					$join_btn.off('click').on('click', function(e){
						joinSubmit();
						e.preventDefault();
						return false;
					});

					$.cocoaDialog.open({type: 'site_join', custom_popup: $html});
				}
			});
		}

	};

	/**
	 * 소셜 가입 버튼을 숨기고 ID/PW 회원가입 입력폼 노출시킴
	 */
	var showJoinForm = function(){
		if(!$join_form) $join_form = $('#join_form');
		var $sns_login_wrap = $('._sns_login_wrap');
		$sns_login_wrap.hide();
		$join_form.show();

	};
	/**
	 * 앱에서 프로필 호출할때 로그인여부 체크해서 분기처리
	 * [DATE] 2016 11 29
	 * @param isLogin
	 */
	var openAppAction = function (isLogin) {
		if(!isLogin) openLogin();
		else editProfile();

	};

	/***
	 * 현재 로그인상태를 확인해서 로그인 창 또는 정보수정 다이얼로그를 뛰움
	 */
	var openLoginOrModifyDialogByLoginStatus = function(){
		$.ajax({
			type: 'POST',
			url: ('/ajax/check_login.cm'),
			dataType: 'json',
			async: true,
			cache: false,
			success: function(res){
				if(res.is_login == "Y"){
					//쇼핑/예약 사이트인경우 마이페이지로
					if(res.is_shop == "Y"){
						location.href="/shop_mypage";
					}else{
						editProfile();
					}

				}else{
					openLogin();
				}
			}
		});
	};

    /**
     * 다이얼로그가 실행되어있는지 체크해서 분기처리
     * [DATE] 2016 11 29
     */
	var isDialogOpen = function () {
		if($.cocoaDialog.isOpen())
			$.cocoaDialog.close();
		else
			window.dozAndroidBridge.dialogClose();
	};

	var positionMemberProfile = function($obj){
		var $window = $(window);
		var $body = $('body');
		var fixed = $body.hasClass('fixed_menu');
		if(fixed){
			$obj = $('#doz_header_wrap .fixed_header').find('.profile');
		}
		var body_width = $('body').width();
		var body_height = $('body').height();
		var window_height = $window.height();

		var top = $obj.offset().top;
		var left = $obj.offset().left;
		var width = $obj.outerWidth();
		var height = $obj.outerHeight();

		var layer_width = $member_profile.outerWidth();
		var layer_height = $member_profile.outerHeight();

		var result_top = 0;
		var result_left = 0;

		result_left = left+width-layer_width;
//TODO 아래의 경우에만 처리된 이유가 있는것인지..
//아래와 같이 처리뢰면 메뉴바 확장을 사용안할 경우 프로필 레이아웃 위치 계산이 안됨
//			if(body_width < left+layer_width){
//				result_left = left+width-layer_width;
//			}

		//if(window_height < top+layer_height){
		//	result_top = top-height-layer_height;
		//}else{
			result_top = top+height+10;
		//}
		$member_profile.css({
			left : result_left,
			top : result_top
		});

		if(IS_MOBILE){ // 안드로이드에서 window.outerWidth 계산방식이 달라 딜레이후 위치 찾아가도록 수정
			if(left <= layer_width){
				$member_profile.css({
					left : left,
					top : result_top
				});
			}
		}else{
			if(left <= layer_width){
				$member_profile.css({
					left : left,
					top : result_top
				});
			}
		}
	};

	var showMemberProfile = function($obj){
		if(typeof $member_profile == 'undefined') return false;
		positionMemberProfile($obj);
		$member_profile.show();
		var is_click = true;
		$('body').off('click.show_member_profile').on('click.show_member_profile',function(e){
			var $target = $(e.target);
			var is_profile = $target.closest('#'+member_profile_id).length>0;
			if(!is_profile && !is_click) {
				closeMemberProfile();
			}
			is_click = false;
		});
		$(window).off('scroll.show_member_profile').on('scroll.show_member_profile',function(e){
			positionMemberProfile($obj);
		});

	};
	var closeMemberProfile = function($obj){
		$member_profile.hide();
		$('body').off('click.show_member_profile');
		$(window).off('scroll.show_member_profile');
	};


	var openDRMOKWindow = function(req_info,rtn_url,cpid,type){ // 성인/본인 인증 팝업창
		if(IS_APP){

			var url = "https://www.mobile-ok.com/popup/hscert.jsp?req_info="+req_info+"&rtn_url="+rtn_url+"&cpid="+cpid+"";
			var urlInfo = parseUri(url);
			var $form = $("<form />");

			$form.attr("method","post");
			$form.attr("action", urlInfo.protocol+"://"+urlInfo.authority+urlInfo.path);

			for ( var i in urlInfo.queryKey ) {
				var $input = $("<input />");
				$input.attr("type", "hidden");
				$input.attr("name", i);
				$input.attr("value", urlInfo.queryKey[i]);
				$form.append($input);
			}
			var $body = $('body');

			$body.append($form);
			$form.submit();

			event.returnValue = false;
			event.cancelBubble = true


		}else{
			windowOpen('DRMOKWindow','https://www.mobile-ok.com/popup/hscert.jsp?req_info='+req_info+'&rtn_url='+rtn_url+'&cpid='+cpid,425,550,'no','post');
		}




	};



	var openSocialJoin = function(back_url){		// 소셜 가입 시 추가정보 다이얼로그를 띄움
		$.cocoaDialog.close();
		$.ajax({
			type: 'POST',
			data: {'is_social': 'Y', 'back_url' : back_url},
			url: ('/dialog/join.cm'),
			dataType: 'html',
			async: true,
			cache: false,
			success : function(html){
				var $html = $(html);
				var $join_btn = $html.find('._join_btn');

				$join_btn.off('click').on('click', function(e){
					joinSubmit(true);
					e.preventDefault();
					return false;
				});

				$.cocoaDialog.open({type : 'site_join', custom_popup : $html, hide_event : function(e){
						if(confirm("추가정보 중 필수항목을 모두 입력해 주셔야 가입이 완료됩니다. 가입을 중단할까요?")){
							clearOAuthData();
						}else{
							e.preventDefault();		// 다이얼로그 닫기 중단
							return false;
						}
					}});
			}
		});
	};

	var clearOAuthData = function(){		// 소셜 가입 취소 시 세션에서 OAuthData 삭제
		$.ajax({
			type: 'POST',
			url: ('/oauth/clear.cm'),
			async: true,
			cache: false,
			success: function(res){
				location.href = '/';
			}
		});
	};
	
	var disconnectOAuth = function(type,back_url){
		var $join_form = $('#join_form');
		$.ajax({
			type:'POST',
			data:{'type' : type},
			url:('/ajax/disconnect_oauth.cm'),
			dataType:'json',
			async:false,
			cache:false,
			success:function(res){
				if(res.msg =='SUCCESS'){
					$join_form.find('._'+type+'_disconnect').hide();
					$join_form.find('._'+type+'_connect').show();
				}else{
					alert(res.msg);
				}
			}
		});
	};
	
	var openGoodbye = function(){
		$.ajax({
			type: 'POST',
			data: {d: 'd'},
			url: ('/dialog/goodbye.cm'),
			dataType: 'html',
			async: true,
			cache: false,
			success: function(html){
				var $html = $(html);
				$.cocoaDialog.open({type: 'site_goodbye', custom_popup: $html});
			}
		});
	};
	
	var goodbye = function(rand){
		$.ajax({
			type: 'POST',
			data: {'rand': rand},
			url: ('/ajax/goodbye.cm'),
			dataType: 'json',
			async: true,
			cache: false,
			success: function(res){
				if(res.msg == 'SUCCESS'){
					if ( typeof ACE_COUNTER_PLUS != 'undefined' ) ACE_COUNTER_PLUS.CompleteWithdraw(res.uid);
					window.location.href='/logout.cm';
				}else
					alert(res.msg);
			}
		});
	};

	var initJoinForm = function(_use_shopping, _site_lang_code, _standard_country, _only_one_country){
		$join_form = $('#join_form');
		use_shopping = _use_shopping;
		site_lang_code = _site_lang_code;
		standard_country = _standard_country;
		only_one_country = _only_one_country;
	};

	var changeCountry = function(compare_country){
		var $kr_addr_form_wrap = $join_form.find('#kr_addr_form_wrap');
		var $jp_addr_form_wrap = $join_form.find('#jp_addr_form_wrap');
		var $en_addr_form_wrap = $join_form.find('#en_addr_form_wrap');

		$kr_addr_form_wrap.hide();
		$jp_addr_form_wrap.hide();
		$en_addr_form_wrap.hide();
		if(!use_shopping){ // 쇼핑 사용 아닐때.
			switch(site_lang_code){
				case 'KR':
					$kr_addr_form_wrap.show();
					break;
				case 'JP':
					$jp_addr_form_wrap.show();
					break;
				case 'CN':
				case 'VN':
				case 'EN':
				case 'ES':
					$en_addr_form_wrap.show();
					break;
				default:
					$kr_addr_form_wrap.show();
			}
		}else{
			if(compare_country !== ''){
				if(only_one_country){
					switch(site_lang_code){
						case 'KR':
							if(compare_country === 'KR'){
								$kr_addr_form_wrap.show();
							}else if(standard_country === 'JP' && compare_country === 'JP'){
								$jp_addr_form_wrap.show();
							}else{
								$en_addr_form_wrap.show();
							}
							break;
						case 'JP':
						case 'CN':
						case 'VN':
						case 'EN':
						case 'ES':
							if(standard_country === 'KR' && compare_country === 'KR'){
								$kr_addr_form_wrap.show();
							}else if(standard_country === 'JP' && compare_country === 'JP'){
								$jp_addr_form_wrap.show();
							}else{
								$en_addr_form_wrap.show();
							}
							break;
						default:
							$kr_addr_form_wrap.show();
							break;
					}
				}else{
					if(standard_country === 'KR'){
						if(compare_country === 'KR'){
							$kr_addr_form_wrap.show();
						}else{
							$en_addr_form_wrap.show();
						}
					}else if(standard_country === 'JP'){
						if(site_lang_code === 'KR'){
							if(compare_country === 'KR'){
								$kr_addr_form_wrap.show();
							}else if(compare_country === 'JP'){
								$jp_addr_form_wrap.show();
							}else{
								$en_addr_form_wrap.show();
							}
						}else{
							if(compare_country === 'JP'){
								$jp_addr_form_wrap.show();
							}else{
								$en_addr_form_wrap.show();
							}
						}
					}else{
						if(site_lang_code === 'KR'){
							if(compare_country === 'KR'){
								$kr_addr_form_wrap.show();
							}else{
								$en_addr_form_wrap.show();
							}
						}else{
							$en_addr_form_wrap.show();
						}
					}
				}
			}
		}
	};

	var itemFileUpload = function($obj, code){

		$obj.fileupload({
			url : '/ajax/member_join_file_upload.cm',
			dataType : 'json',
			limitMultiFileUploads : 1,
			dropZone : null,
			maxFileSize : 20000000, //20mb
			limitMultiFileUploadSize : 100000000, //110 mb
			formData : {'code' : code},
			start : function(e, data){
			},
			progress : function(e, data){
			},
			done : function(e, data){
				var form_file = '';
				form_file = 'form_file_' + code;
				if(data.result[form_file][0].size > 52428800){
					alert(LOCALIZE.설명_최대업로드용량안내());
					return;
				}
				if(data.result[form_file][0].error){
					alert(data.result[form_file][0].error);
				}else{
					if(data.result[form_file][0].tmp_idx > 0){
						$obj.find('._form_file_list').show();
						$obj.find('._holder').hide();
						$obj.find('._filename').text(data.result[form_file][0].org_name);
						$obj.find('._filesize').text('(' + GetFileSize(data.result[form_file][0].size) + ')');
						$obj.find('._temp_file').val(data.result[form_file][0].tmp_idx);
						$obj.find('._upload_file').val('');
						$obj.find('._download_link').removeAttr("href");
						if(data.result[form_file][0].type.substring(0 ,5) === "image"){
							$obj.find('._image').show();
							$obj.find('._image_src').attr('src', CDN_UPLOAD_URL+data.result[form_file][0].url);
						}
					}
				}
			},
			fail : function(e, data){
			}
		})
			.find('._fileremove').click(function(){
			$obj.find('._form_file_list').hide();
			$obj.find('._holder').show();
			$obj.find('._temp_file').val('');
			$obj.find('._upload_file').val('');
			$obj.find('._image').hide();
		});
	};


	var init = function(){
		$member_profile = $('#'+member_profile_id);
	};
	return {
		init : function(){
			init();
		},
		showMemberProfile : function(o){
			showMemberProfile(o);
		},
		checkRequireOption: function(){
			return checkRequireOption();
		},
		openLogin : function(back_url,type,callback,used_login_btn, page_type){
			openLogin(back_url,type,callback,used_login_btn, page_type);
		},
		openGuestLogin : function(back_url){
			openGuestLogin(back_url);
		},
		openJoin : function(back_url, type){
			openJoin(back_url, type);
		},
		openJoinWithoutTerms : function(){
			openJoinWithoutTerms();
		},
		joinSubmit : function(is_social){
			joinSubmit(is_social);
		},
		editProfile : function(backurl){
			editProfile(backurl);
		},
		openFindPassword : function(){
			openFindPassword();
		},
		findSubmit : function(s,v){
			findSubmit(s,v);
		},
		openChangePassword : function(c,r,s){
			openChangePassword(c,r,s);
		},
		changePassword : function(){
			changePassword();
		},
		openDRMOKWindow : function(req_info,rtn_url,cpid){
			openDRMOKWindow(req_info,rtn_url,cpid);
		},
		showJoinForm : function() {
			showJoinForm();
		},
		openAppAction : function (isLogin) {
			openAppAction(isLogin);
		},
		openLoginOrModifyDialogByLoginStatus : function(){
			openLoginOrModifyDialogByLoginStatus();
		},
		isDialogOpen : function () {
			isDialogOpen();
		},
		openSocialJoin : function(back_url){
			openSocialJoin(back_url);
		},
		clearOAuthData : function(){
			clearOAuthData();
		},
		'disconnectOAuth' : function(type,back_url){
			disconnectOAuth(type,back_url);
		},
		'openGoodbye' : function(){
			openGoodbye();
		},
		'goodbye' : function(rand){
			goodbye(rand);
		},
		'initJoinForm' : function(use_shopping, site_lang_code, standard_country, only_one_country){
			initJoinForm(use_shopping, site_lang_code, standard_country, only_one_country);
		},
		'changeCountry' : function(compare_country){
			changeCountry(compare_country);
		},
		itemFileUpload : function($obj, code){
			itemFileUpload($obj, code);
		}
	};
}();

$(function() {
	SITE_MEMBER.init();
});
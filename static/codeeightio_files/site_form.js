var SITE_FORM = function(){
	var init = function(){
	};

	var itemFileUpload = function($obj, code){
		$obj.fileupload({
			url : '/ajax/form_file_upload.cm',
			dataType : 'json',
			singleFileUploads : false,
			limitMultiFileUploads : 1,
			dropZone : null,
			maxFileSize : 20000000, //20mb
			limitMultiFileUploadSize : 110000000, //110 mb
			formData : {'code' : code},
			start : function(e, data){
			},
			progress : function(e, data){
			},
			done : function(e, data){
				var form_file = '';
				form_file = 'form_file_' + code;
				if(data.result[form_file][0].size > 52428800){
					showModal('error',LOCALIZE.설명_최대업로드용량안내());
					return;
				}
				if(data.result[form_file][0].error){
					showModal('error',data.result[form_file][0].error);
				}else{
					if(data.result[form_file][0].tmp_idx > 0){
						$obj.find('._form_file_list').show();
						$obj.find('._holder').hide();
						$obj.find('._filename').text(data.result[form_file][0].org_name);
						$obj.find('._filesize').text('(' + GetFileSize(data.result[form_file][0].size) + ')');
						$obj.find('._temp_file').val(data.result[form_file][0].tmp_idx);
						$obj.find('._upload_file').val('');
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
		});
	};

	var itemRequiredCk = function($obj){
		var required_ck = true;
		$obj.find('.form-group').each(function(){
			var type = this.id.split('_');
			if($(this).find('label i').hasClass('icon-required') === true){
				switch(type[0]){
					case 'privacy':
						if($('#privacy input').is(":checked") === false){
							required_ck = 'privacy_required';
							return false;
						}
						break;
					case 'thirdparty':
						if($('#thirdparty input').is(":checked") === false){
							required_ck = 'third_party_required';
							return false;
						}
						break;
					case 'input':
						if(!$(this).find('input').val()){
							required_ck = false;
							return false;
						}
						break;
					case 'textarea':
						if(!$(this).find('textarea').val()){
							required_ck = false;
							return false;
						}
						break;
					case 'radio':
						if(!$('input:radio[name="' + this.id + '"]:checked').val()){
							required_ck = false;
							return false;
						}
						break;
					case 'checkbox':
						if($("input:checkbox[name='" + this.id + "[]']").is(":checked") === false){
							required_ck = false;
							return false;
						}
						break;
					case 'file':
						if(!$("input[name='temp_files_" + type[1] + "']").val()){
							if(!$("input[name='upload_files_" + type[1] + "']").val()){
								required_ck = false;
								return false;
							}
						}
						break;
					case 'phonenumber':
						$(this).find('input').each(function(){
							if(!$(this).val()){
								required_ck = false;
								return false;
							}
						});
						break;
					case 'datetime':
						$(this).find('input').each(function(){
							if(!$(this).val()){
								required_ck = false;
								return false;
							}
						});
						break;
					case 'address':
						$(this).find('input').each(function(){
							if(!$(this).val()){
								required_ck = false;
								return false;
							}
						});
						break;
					case 'select':
						$(this).find('select').each(function(){
							if(!$(this).val()){
								required_ck = false;
								return false;
							}
						});
						break;
				}
			}

			// 입력폼 체크박스 갯수 제한 추가
			if(type[0] == 'checkbox'){
				var checkmax = $('#'+this.id).attr('check-limit');
				if(checkmax > 0 && ($("input:checkbox[name='" + this.id + "[]']:checked").length > checkmax)){
					required_ck = 'checkbox_limit_'+checkmax;
					return false;
				}
			}
		});
		return required_ck;
	};

	var is_submitting= false;
	var submit = function(widget_code, callback){
		var $obj = $('#addForm' + widget_code);
		if(!is_submitting){
			is_submitting = true;
			$.ajax({
				type : 'POST',
				data : $obj.serialize(),
				url : ('/ajax/form_add.cm'),
				dataType : 'json',
				async : true,
				cache : false,
				success : function(result){
					is_submitting=false;
					if(result.msg == 'SUCCESS'){
						if ( typeof FB_PIXEL != 'undefined' && result.fb_registration_check == 'Y') FB_PIXEL.CompleteRegistration();
						if ( typeof DAUM_CTS != 'undefined' ) DAUM_CTS.OrderForm();
						if ( typeof NP_LOG != 'undefined' ) NP_LOG.EtcPage();
						if ( typeof ACE_COUNTER_PLUS != 'undefined' ) ACE_COUNTER_PLUS.CompleteSubmit();
						if ( typeof CHANNEL_TRACE != 'undefined') CHANNEL_TRACE.CompleteSubmit();

						//완료 메세지 변경
						if(result.form_add_end_msg.trim() != ''){
							showModal('complete',result.form_add_end_msg, widget_code);
						}

						if(typeof callback === 'function'){
							callback();
						}
					}else{
						showModal('error',result.msg, widget_code);
					}
				}
			});
		}
	};

	var confirmInputForm = function(widget_code, modify_permit){
		var $obj = $('#addForm' + widget_code);
		var chk_res = itemRequiredCk($obj);
		if(chk_res === true){
			if(modify_permit === 'N'){ //응답수정 허용 off
				submit(widget_code,function(){
					showModal('complete',null,widget_code);
				});
			}else{ //응답수정 허용 on
				showModal('complete',null,widget_code);
			}
		}else{
			if(chk_res === "privacy_required"){
				showModal('error',LOCALIZE.설명_개인정보처리방침에동의하여주시기바랍니다(), widget_code);
			} else if(chk_res == 'third_party_required'){
				showModal('error',LOCALIZE.설명_개인정보제3자제공에동의하여주시기바랍니다(), widget_code);
			} else {
				var checkbox_reg = /^checkbox_limit_[0-9]{1,}$/;
				if(checkbox_reg.test(chk_res)){
					chk_res = chk_res.replace(/[^0-9]/g,'');
					showModal('error',LOCALIZE.설명_최대n개까지선택가능합니다(chk_res), widget_code);
				}else{
					showModal('error',LOCALIZE.설명_필수항목을입력하여주시기바랍니다(), widget_code);
				}
			}
		}
	};

	var hideModal = function(){
		//$('#input_form_complete_modal').hide();
		$('.modal.in.modal_site_alert').hide();
	};

	var showModal = function(type,msg,widget_code){
		hideModal();
		var modal_target;
		if(type == 'complete'){
			modal_target = 'input_form_complete_modal_' + widget_code;
		} else {
			modal_target = 'input_form_error_modal_' + widget_code;
		}

		if(msg != undefined && msg.trim() != ''){
			$('#'+modal_target+' .modal-content .container-fluid p').html(msg);
			if(type == 'complete'){
				$('#'+modal_target+' .btn-group-justified').html('<a href="javascript:" class="btn right" onclick="location.reload();">'+LOCALIZE.버튼_확인()+'</a>');
			}
		}
		$('#'+modal_target).show();
	};

	return {
		init:function(){
			init();
		},
		itemFileUpload:function($obj,$code){
			itemFileUpload($obj,$code);
		},
		itemRequiredCk:function($obj){
			return itemRequiredCk($obj);
		},
		submit:function(widget_code){
			return submit(widget_code);
		},
		confirmInputForm:function(widget_code, modify_permit){
			return confirmInputForm(widget_code, modify_permit);
		},
		hideModal:function(){
			return hideModal();
		}
	}
}();
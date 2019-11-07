var ADVANCED_TRACE = function(){
	var appendCode = function(type,replace_variable){
		$(function(){
			$.ajax({
				type : 'POST',
				data : {'type' : type, replace_variable : replace_variable},
				url : ('/ajax/get_advanced_trace_code.cm'),
				dataType : 'json',
				success : function(res){
					if(res.msg == 'SUCCESS'){
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
					}else alert(res.msg);
				}
			});
		});
	};
	return {
		"appendCode" : function(type,replace_variable){
			appendCode(type,replace_variable);
		}
	}
}();
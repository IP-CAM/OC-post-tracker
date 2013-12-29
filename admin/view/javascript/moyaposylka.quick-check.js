jQuery(function() {
    $(document).on('submit', '#quick-check-form', function() {
        var $form = $(this),
            $result = $('#quick-check-result'),
            $input = $form.find('.input-lg'),
            $group = $input.parent('div.form-group'),
            $btn = $form.find('button'),
            originText = $btn.text(),
            pbClasses = 'progress-bar progress-bar-success';
		
        if ($input.val().length == 0) {
            $group.addClass('has-error');

            return false;
        }

        $group.hasClass('has-error') && $group.removeClass('has-error');
        
        $.ajax({
            url: 'http://furdream.ru/index.php?route=module/posttrackerquick/find',
            type: 'GET',
            crossDomain: true,
            data: $form.serialize(),
            beforeSend: function ( xhr ) {
                $btn.addClass(pbClasses).text('отслеживаем...').attr('disabled', 'disabled');
                $result.empty();
            }
            
        }).done(function(data) {
            $btn.removeAttr('disabled').removeClass(pbClasses).text(originText);
			var formdata = $(data).find(".track_result").html();
			$result.append(formdata);
			
			            
        }).fail(function(jqXHR, textStatus) {
            $result.html('<div class="quick-check-fatal">Отслеживание временно недоступно. Попробуйте позднее.</div>');
            $btn.removeAttr('disabled').removeClass(pbClasses).text(originText);
        });

        return false;
    });

   
});
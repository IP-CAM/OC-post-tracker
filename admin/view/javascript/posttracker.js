/**
 * Tracker widget
 * @version 1.0.0
 * @updated 17.03.2012
 * @updated 26/10/2012
 * @updated 13/11/2012
 */
var mainDomain = 'postabot.ru';
//регулярное выражение для очисттки строки
var clearStringRE = /[^a-zA-Z0-9]/g;
//Признак редиректа на чистый URL
var toCleanURL = true

/**
* Текст для социалок
* @url - заменяется на пермалинк
**/
var twText = 'Я отслеживаю посылки через postabot.ru @url';

function ajaxit() {
    var iFrameWindow = document.getElementById("formFrame").contentWindow;
    iFrameWindow.document.body.appendChild( document.getElementById("tracker-form").cloneNode(true));   
    var frameForm = iFrameWindow.document.getElementById("tracker-form");
    frameForm.onsubmit = null;
    frameForm.submit();
    return false;
}

function formInit(tn, cr) {
    tn=tn || "";
    tn.replace(clearStringRE,"")
    cr=cr || "";
jQuery(function($){
  
    $('#tracker-form').submit(function(e){
        //$('#formFrame').remove();
        //$("#tracker_wiget").append('<iframe id="formFrame" src="" style="display:none;"></iframe> <!-- you\'ll want this hidden -->');
        
        //отменяем стандартное действие при отправке формы
        //e.preventDefault();
        //e.stopPropagation();
        var tn = $(this).find('#track-number').val();
        $(this).find('#track-number').val(tn.replace(clearStringRE,""));
        // alexmay - изменен текст троббера
        throbber = "<div class=\"throbber\" style=\"background: url(http://"+mainDomain+"/misc/progress.gif) repeat-x 0 0 transparent; height: 45px; width: 260px; position: fixed; top: 50%; left: 50%; margin-top: -20px; margin-left: -60px; border-radius: 6px; z-index: 9000; \" ><center><font color=white><strong>Выполняется обработка...</strong><br>первый запрос может занимать до 15 сек.</font></center></div>";
        $("#tracker_wiget").prepend(throbber);
        //берем из формы метод передачи данных
        var m_method=$(this).attr('method');
        //получаем адрес скрипта на сервере, куда нужно отправить форму
        var m_action=$(this).attr('action');
        //получаем данные, введенные пользователем в формате input1=value1&input2=value2...,
        //то есть в стандартном формате передачи данных формы
        var m_data=$(this).serialize();
        $.ajax({
                type: m_method,
                dataType: "xml",
                url: m_action,
                data: m_data,
                crossDomain: true,
                success: function(xml){
                    $('#result').html("");
                    var itemsCount = $(xml).find('count').text();
                    itemsCount = itemsCount || 0;
                    //Номер накладной
                    var id = $(xml).find('track_number').attr("id");
                    var carrier = $(xml).find('track_number').attr("carrier");
                    
                    var permaLinkPre = 'http://'+carrier.toLowerCase()+'.'+mainDomain+'/'+id;
                    // original CODE var permaLink = '[ <a href="http://'+carrier+'.'+mainDomain+'/'+id+'" > постоянная ссылка</a> ]';
                    var permaLink = '<br><h3>Постоянная ссылка: <a href="'+permaLinkPre+'">'+permaLinkPre+'</a></h3><br>';
		    var twTextPermaLink = "Превед! Это постабот!";//twText.replace('@url', permaLinkPre);
                    var toTW = '<div class="share42init" data-url="postabot.ru" data-title="' + twTextPermaLink + '" data-path="'+permaLinkPre+'"></div>';

		    var pageDiv = [];
                    
                    var messages = '';
                    $(xml).find('messages').find('message').each(
                            function()
                            {
                                messages = '<div class="messages '+$(this).attr("type")+'">'+$(this).text()+'</div>'+"\n";
                            });
                    if (messages != '') {
                        pageDiv['messages'] = document.createElement("div");
                        pageDiv['messages'].appendChild(strToDiv(messages));
                    }
                            
                    if (itemsCount!=0) {
                        $(xml).find('item').each(
                            function()
                            {
                            	$("#tracker_wiget .throbber").hide(); // alexmay
                                var itemId = $(this).attr("id");

                                //Отправлено из
                                var routeStartLoc = $(this).find('routeStartLoc').attr("value");

                                //Получил
                                var signedFor = $(this).find('signedFor').attr("value");
                                var routeEndTime = $(this).find('routeEndTime').attr("value");


                                var oe=1;
                                var cls= "odd";
                                var tt = document.createElement("div");
                                tt.className = "table";
                                                                                            tt.appendChild(toDiv([
                                                                                                    strToDiv("<b>Дата</b> время","cell date"),
                                                                                                    strToDiv("Место","cell geo"),
                                                                                                    strToDiv("Событие","cell event")],"row header"));
                                $(this).find('track').each(
                                    function()
                                    {
                                        if (oe++ % 2 == 0) {cls= "even";} else {cls= "odd";}

                                        tt.appendChild(toDiv([
                                                strToDiv('<b>'+$(this).attr("date")+'</b> '+$(this).attr("time"),"cell date"),
                                                strToDiv($(this).attr("geo"),"cell geo"),
                                                strToDiv($(this).attr("event"),"cell event")],"row "+cls));
                                    });
                                    
                                if (itemId++ % 2 == 0) {cls= "even";} else {cls= "odd";}
                                pageDiv[itemId] = document.createElement("div");
                                pageDiv[itemId].setAttribute('id', "item-"+itemId);
                                pageDiv[itemId].className ="item "+cls;
                                pageDiv[itemId].appendChild(toDiv([getStrVal('Накладная:&nbsp;',carrier+" > "+id,"number string"),
                                                                   getStrVal('Отправлено из:&nbsp;',routeStartLoc,"routeStartLoc string"),
                                                                   getStrVal('Последняя новость:&nbsp;',signedFor+" "+routeEndTime,"signedFor string"),
                                                                   toFieldSet('Подробно (развернуть):&nbsp;',toDiv([tt],"wrapper","table-wrapper"),"","fieldset-item-"+itemId,itemsCount)
                                                                  ],"info-1"));

                                var transitTime = $(this).find('transitTime').attr("value");
                                var monitorTrack = '<form action="http://postabot.ru/tr/tracker2.php" method="post" id="track-monitor-form-"'+id+' class="track-monitor-form" accept-charset="UTF-8">'+
'<input  type="hidden" name="track-number" value="'+id+'" />'+
'<input  type="hidden" name="carrier" value="'+carrier+'" />'+
'<input  type="hidden" name="add-task" value="1" />'+
'<div class="input-wrapper">'+
'<input  type="text" id="email" class="email" name="email" value="" size="20" maxlength="60" autocomplete="on" rel="email пользователя" />'+
'</div>'+
//'<div class="input-wrapper">'+
//'<input  type="text" id="email-confirm" class="email confirm" name="email-confirm" value="" size="20" maxlength="60" autocomplete="on" rel="еще раз" />'+
//'</div>'+
'<div class="input-wrapper note">'+
'<input  type="text" id="noteAWB" class="noteAWB" name="noteAWB" value="" size="40" maxlength="60" autocomplete="on" rel="заметка к накладной (видна в личном кабинете)" />'+
'</div>'+
'<input class="track-submit" type="submit" value="Ок" />'+
'</div>'+
'</form>'+
'<div class="description"><br>Укажите адрес, и мы будем присылать на него уведомления об изменениях статуса посылки. Статус проверяется каждые 1-4 часов.</div>';


                                pageDiv[itemId].appendChild(toDiv([getStrVal('Общее время в пути (час):&nbsp;',transitTime),
                                                                   getStrVal('Перевозчик:&nbsp;',carrier+' [ <a href="http://'+mainDomain+'/forum/'+carrier.toLowerCase()+'" target="_blank">'+'обсуждение</a> ] '+permaLink),
								   strToDiv("", toTW),
                                                                   getStrVal('<p><h3>Получать уведомления на email:</h3></p>',monitorTrack)
                                                                  ],"info-2"));                            
                               pageDiv[itemId].appendChild(strToDiv("","item break"));
                               
                        });
                    } else {
                                $("#tracker_wiget .throbber").hide(); // alexmay
                                var monitorTrack = '<form action="http://postabot.ru/tr/tracker2.php" method="post" id="track-monitor-form-"'+id+' class="track-monitor-form" accept-charset="UTF-8">'+
'<input  type="hidden" name="track-number" value="'+id+'" />'+
'<input  type="hidden" name="carrier" value="'+carrier+'" />'+
'<input  type="hidden" name="add-task" value="1" />'+
'<div class="input-wrapper">'+
'<input  type="text" id="email" class="email" name="email" value="" size="20" maxlength="60" autocomplete="on" rel="email пользователя" />'+
'</div>'+
//'<div class="input-wrapper">'+
//'<input  type="text" type="hidden" id="email-confirm" class="email confirm" name="email-confirm" value="" size="20" maxlength="60" autocomplete="on" rel="еще раз" />'+
//'</div>'+
'<div class="input-wrapper note">'+
'<input  type="text" id="noteAWB" class="noteAWB" name="noteAWB" value="" size="40" maxlength="512" autocomplete="on" rel="заметка к накладной (видна в личном кабинете)" />'+
'</div>'+
'<input class="track-submit" type="submit" value="Ок" />'+
'</div>'+
'</form>'+
'<div class="description"><br>Накладной пока нет в системе.<br><strong>Включить оповещение</strong><br>Если вы укажите свой email, то мы пришлем вам извещение сразу, как только она появится у перевозчика в базе или на сайте. Это работает!</div>';
                                        
                                pageDiv['monitor'] = document.createElement("div");        
                                pageDiv['monitor'].appendChild(getStrVal('<h3>Получать уведомления на email:</h3></p>',monitorTrack),"info-2");
                    }
                $('#result').html(toDiv(pageDiv));
                monitorInit();
	        $(window).load();
            }
        });
        $("#tracker_wiget .throbber").delay(7000).fadeOut();
        //return ajaxit();
        trackUrlJQ();

        return false;
    });
    
    //Если имеем GET переменные, то заполняем форму и выполняем запрос
    
    var tn = getQueryVariable('tn');
    var cr = getQueryVariable('cr');
    if (tn && cr) {
        //Заполняем поле номера и выбираем перевозчика
        $('#track-number').val(tn);
        $('#'+cr.toLowerCase()).trigger('click');
        $('#tracker-form').submit();
    }        
});

    //Если имеем GET переменные, то заполняем форму и выполняем запрос
    
    formTrackerSubmit(tn, cr);    
}

function monitorInit() {
setPlaceholder("#email");
setPlaceholder("#email-confirm");
setPlaceholder("#noteAWB");
jQuery(function($){
    $('.track-monitor-form input.email').blur(function(e){
        this.className = this.className.replace(" error","");
        if ($(this).val() != '') {
            if (!isEmailCorrect($(this).val())) {
                this.className = this.className + " error";
            }
        }
        if ($(this).hasClass("confirm")) {
            if ($(this).parent().parent().find("#email").val() != $(this).val() && $(this).val() != '') {
                if (!$(this).hasClass("error")) {
                    this.className = this.className + " error";
                }
            }
        }
    });

    $('.track-monitor-form').submit(function(e){
        var errors = false;
        $(this).parent().parent().find("div.messages").remove();
        if ($(this).find("#email").val() =='' || $(this).find("#email-confirm").val()=='') {
//            $(this).parent().parent().append('<div class="messages warning">Введите email в оба поля.</div>');
//            errors = true;
        } else {
            if (!isEmailCorrect($(this).parent().find("input#email").val())) {
                $(this).parent().parent().append('<div class="messages error">Введенный email некорректен.</div>');
                errors = true;
            }
            if ($(this).find("#email").val() != $(this).find("#email-confirm").val()) {
//                $(this).parent().parent().append('<div class="messages error">Введенные email не совпадают.</div>');
//                errors = true;
            }
        }
        
        if (!errors) {
            throbber = "<div class=\"throbber\" style=\"background: url(http://"+mainDomain+"/misc/progress.gif) repeat-x 0 0 transparent; height: 40px; width: 120px; position: fixed; top: 50%; left: 50%; margin-top: -20px; margin-left: -60px; border-radius: 6px; z-index: 9000; \" ></div>";
            $(this).hide();
            var monitorForm = this;
            $(this).parent().prepend(throbber);
            //берем из формы метод передачи данных
            var m_method=$(this).attr('method');
            //получаем адрес скрипта на сервере, куда нужно отправить форму
            var m_action=$(this).attr('action');
            //получаем данные, введенные пользователем в формате input1=value1&input2=value2...,
            //то есть в стандартном формате передачи данных формы
            var m_data=$(this).serialize();
            $.ajax({
                    type: m_method,
                    dataType: "xml",
                    url: m_action,
                    data: m_data,
                    crossDomain: true,
                    success: function(xml){
                        var res = $(xml).find('add_result').text();
                        if (res == '1') {
                            $(monitorForm).parent().parent().parent().html('<div class="messages status">Спасибо. На ваш email ('+email.value+') будет направляться информация об изменении статуса данной посылки.</div>'+noteAWB.value );
                        } else {
                            $(monitorForm).parent().parent().parent().html('<div class="messages error">Произошла ошибка при добавлении задания на отслеживание.<br />Пожалуйста, попробуйте позже.</div>');
                        }
                    }
            });
            $(this).parent().find(".throbber").remove();
            $("#tracker_wiget .throbber").hide();

            //return ajaxit();
        }
        return false;
    });
});
}

//Функция принимает строку и заворачивает ее в div
function strToDiv(e,cls,divID) {
    cls=cls || "";
    divID=divID || "";
    var thisDiv = document.createElement("div");
        thisDiv.innerHTML = e;
                            if (divID!="") thisDiv.setAttrisbute('id',divID);
        if (cls!="") thisDiv.className =cls;
    return thisDiv;
}

//Функция принимает массив элементов и заворачивает их в div
function toDiv(e,cls,divID) {
    cls=cls || "";
    divID=divID || "";
    var thisDiv = document.createElement("div");
    for (var key in e) {
        thisDiv.appendChild(e[key]);
        if (divID!="") thisDiv.setAttribute('id',divID);
        if (cls!="") thisDiv.className =cls;
    }
    return thisDiv;
}

//функция принимает 2 строки, ярлык и значение, и выдает отформатированый HTML
function getStrVal(label, value, cls) {
    cls=cls || "";
    var thisLabel = document.createElement("label");
    thisLabel.style.cssFloat = "left";
    var thisValue = document.createElement("span");
    var thisWrapper = document.createElement("div");
    thisWrapper.style.clear = "both";
    thisLabel.innerHTML = label;
    thisValue.innerHTML = value;
    thisWrapper.appendChild(thisLabel);
    thisWrapper.appendChild(thisValue);
    if (cls!="") thisWrapper.className =cls;
    return thisWrapper;
}

function toFieldSet(title, value, cls, fID,cnt) {
    cls=cls || "";
    fID=fID || "";
    dsp = "block";
    if (cnt>1) dsp = "none";
    var hideSpan = document.createElement("span");
    hideSpan.className = "fieldset-legend-prefix element-invisible";
    hideSpan.innerHTML = "Hide";
    var titleA = document.createElement("a");
    titleA.className = "fieldset-title";
    //titleA.setAttribute('href',"#");
    titleA.appendChild(hideSpan);
    titleA.innerHTML = title;
    
    titleSpan = document.createElement("span");
    titleSpan.className = "fieldset-legend";
    titleSpan.appendChild(titleA);
    
    titleA.onclick = function(){hd(fID)};
    
    titleLegend = document.createElement("legend");
    titleLegend.appendChild(titleSpan);

    var thisWrapper = document.createElement("div");
    thisWrapper.className = "fieldset-wrapper";
    thisWrapper.appendChild(value);
    thisWrapper.style.display = dsp;

    var fieldSetWrapper = document.createElement("fieldset");
    fieldSetWrapper.className = "collapsible form-wrapper collapse-processed "+cls;
    fieldSetWrapper.appendChild(titleLegend);
    fieldSetWrapper.appendChild(thisWrapper);
    if (fID!="") fieldSetWrapper.setAttribute('id',fID);
    
    return fieldSetWrapper;
}

function hd(divID) {
    
    (function($) {$(document).find("#"+divID).find('div.fieldset-wrapper').slideToggle("slow");})(jQuery);
}

function formTrackerSubmit(tn, cr) {
    tn=tn || "";
    cr=cr || "";
    (function($) {
        if (tn && cr) {
            //Заполняем поле номера и выбираем перевозчика
            $('#track-number').val(tn);
            $('#'+cr.toLowerCase()).trigger('click');
            $('#tracker-form').submit();
        }   
    })(jQuery);
}

var jQ = false;
function initJQ(tn, cr, cleanURL) {
    tn=tn || "";
    tn = tn.replace(clearStringRE,"");
    cr=cr || "";
    cleanURL = (cleanURL == false)?cleanURL : true;
    //cleanURL = cleanURL.replace(clearStringRE,"");
  if (typeof(jQuery) == 'undefined') {
    if (!jQ) {
      jQ = true;
      document.write('<scr' + 'ipt type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.5.2/jquery.min.js"></scr' + 'ipt>');
      //document.write('<scr' + 'ipt type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.11/jquery-ui.min.js"></scr' + 'ipt>');
    }
    setTimeout('initJQ("'+tn+'", "'+cr+'")', 50);
  } else {
    (function($) {
    $(function() {
      toCleanURL = cleanURL;
      // здесь пишем jQuery код
      formInit(tn, cr);
    })
    })(jQuery)
  }
}


function getQueryVariable(variable) { 
    var query = window.location.search.substring(1); 
    var vars = query.split("&"); 
    for (var i = 0; i < vars.length; i++) { 
        var pair = vars[i].split("="); 
        if (pair[0] == variable) { 
            return unescape(pair[1]); 
        } 
    } 
    return false; 
}

//Функция проверки email на корректность 
function isEmailCorrect(email) { 
    var re = /^\w+([\.-]?\w+)*@(((([a-z0-9]{2,})|([a-z0-9][-][a-z0-9]+))[\.][a-z0-9])|([a-z0-9]+[-]?))+[a-z0-9]+\.([a-z]{2}|(com|net|org|edu|int|mil|gov|arpa|biz|aero|name|coop|info|pro|museum))$/i;
    if(re.test(email)) {
        return true;
    } else {
        return false; 
    } 
}

function setPlaceholder(id) {
    jQuery(id).each(function(){
        jQuery(this).parent().prepend('<span class="label">'+jQuery(this).attr('rel')+'</span>');
        if(jQuery(this).attr('value') != '') {
            jQuery(this).parent().children('span.label').hide();
        }
        jQuery(this).focus(function(){
            jQuery(this).parent().children('span.label').hide();
        })
        jQuery(this).blur(function(){
            if(jQuery(this).attr('value') == '') {
                jQuery(this).parent().children('span.label').show();
            }
        })
        jQuery(this).bind('keyup', function(){
            jQuery(this).parents('form').find('.form-item input').each(function(){
                //alert(1)
                if(jQuery(this).attr('value') != '') {
                    jQuery(this).parent().children('span.label').hide();
                }
            })
        })
        //alert(jQuery(this).attr('value')+'1')
    });
}

//Функиця редиректит запрос на пермалинк
function trackUrlJQ() {
    jQuery(function($){
            //Получаем перевозчика из формы
            var carrier = $('input[name=carrier]:checked', '#tracker-form').val();
            //Получаем введенный номер трекинга
            var track_number = $('#track-number').val();
            track_number = track_number.replace(clearStringRE,"");
            //Формируем пермалинк
            if (carrier && track_number) {
                var is_current = false;
                var tracks = document.location.href.match(/^http:\/\/([^\.]+).[^\/]+\/([\d\w]+).*$/i);
                if (tracks != null) {
                    if (tracks[1].toLowerCase() == carrier.toLowerCase() && tracks[2].toLowerCase() == track_number.toLowerCase()) {
                        is_current = true;
                    }
                }
                //Проверяем, является ли текущая страница пермалинком, и не запрещен ли редирект, и если нет, то редиректим
                if (!is_current && toCleanURL) {

                    var url = 'http://'+carrier.toLowerCase()+'.'+mainDomain+'/'+track_number;
                    //window.location.href=(url);
                }
            }
    });

    return false;
}
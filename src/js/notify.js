
$(document).ready(initNotify);

function initNotify(){
	$(document).attr('basetitle',$(document).attr('title'));
	if (Notification.permission !== "granted"){
		Notification.requestPermission();
	}
}

function notify(text){
	notifyTitle(text);
	notifyBrowser(text);
}

function notifyTitle(text){
	if(text.length > 0)
		$(document).attr('title',"("+text+")"+$(document).attr('basetitle'));
}

function notifyCleanTitle(){
	$(document).attr('title',$(document).attr('basetitle'));
}

function notifyBrowser(text){
	new Notification('Lunik Status', {
      icon: 'src/image/notify.png',
      body: text,
    });
}

$(window).focus(function(){
	notifyCleanTitle();
});
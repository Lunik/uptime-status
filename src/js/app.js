var APIKEYS

var COUNTDOWN
var DEFAULTCOUNTDOWN = 300

$(document).ready(function () {
  $.getJSON('src/json/apikey.json', function (data) {
    APIKEYS = data
    init()
  })
})

function init () {
  initCountDown(1)
  updateCountDown()
  $container = $('.container')
  for (var app in APIKEYS) {
    $newApp = $('<div>').addClass('app').attr('id', app)
    $newApp.append($('<div>').addClass('app-name').text(app))
    $monitors = $('<div>').addClass('app-monitors')
    for (var monitor in APIKEYS[app]) {
      $newMonitor = $('<div>').addClass('monitor').attr('id', monitor).text(APIKEYS[app][monitor].name)
      $monitors.append($newMonitor)
    }
    $newApp.append($monitors)
    $newApp.append($('<div>').addClass('app-uptime'))
    $newApp.append($('<div>').addClass('app-status'))
    $container.append($newApp)
  }
  update()
}

function initCountDown (speed) {
  COUNTDOWN = DEFAULTCOUNTDOWN / speed

  $('.reload progress').attr('max', COUNTDOWN)
}

function updateCountDown () {
  COUNTDOWN--
  if (COUNTDOWN <= 0) {
    update()
    COUNTDOWN = DEFAULTCOUNTDOWN
    $('.reload progress').attr('max', COUNTDOWN)
  }
  $('.reload progress').attr('value', COUNTDOWN)

  setTimeout(updateCountDown, 1000)
}

function update () {
  for (var app in APIKEYS) {
    for (var monitor in APIKEYS[app]) {
      getUptime(APIKEYS[app][monitor].key)
    }
  }
}

/* load uptime variables from uptimerobot
* this calls jsonUptimeRobotApi() when loaded
*/
function getUptime (apikey) {
  var url = '//api.uptimerobot.com/getMonitors?apiKey=' + apikey + '&format=json&logs=1&logsLimit=5'
  $.ajax({
    url: url,
    context: document.body,
    dataType: 'jsonp'
  })
}

/* callBack de getUptime */
function jsonUptimeRobotApi (data) {
  updateMonitor(data.monitors.monitor)
}

function updateMonitor (monitor) {
  if (monitor.friendlyname == null)
    monitor = monitor[0]
  var friendlyname = monitor.friendlyname.split(' ')
  var appName = friendlyname[0]
  var monitorName = friendlyname[1].toLowerCase()

  // console.log(monitor)
  var data = {}
  data.selector = $('#' + appName + ' #' + monitorName)
  data.status = monitor.status
  data.url = monitor.url
  data.log = monitor.log
  data.uptime = monitor.alltimeuptimeratio

  switch (parseInt(data.status, 10)) {
    case 0:
      data.statustxt = 'Up-Time paused'
      data.statusicon = 'icon-pause'
      data.label = 'info'
      break
    case 1:
      data.statustxt = 'Not checked yet'
      data.statusicon = 'icon-question'
      data.label = 'default'
      break
    case 2:
      data.statustxt = 'Online'
      data.statusicon = 'icon-ok'
      data.label = 'success'
      data.alert = ''
      break
    case 8:
      data.statustxt = 'Seems offline'
      data.statusicon = 'icon-remove'
      data.label = 'warning'
      data.alert = 'alert alert-warning'
      notify(appName + ' ' + monitorName + ' ' + data.statustxt)
      initCountDown(5)
      break
    case 9:
      data.statustxt = 'Offline'
      data.statusicon = 'icon-bolt'
      data.label = 'danger'
      data.alert = 'alert alert-danger'
      notify(appName + ' ' + monitorName + ' ' + data.statustxt)
      initCountDown(5)
      break
  }

  updateViewMonitor(data)
  updateViewApp(appName)
}

function updateViewMonitor (data) {
  data.selector.css('backgroundColor', data.color)
  data.selector.attr('etat', data.status)
  data.selector.click(function () {
    window.location = '//' + data.url.replace('http://', '')
  })
  data.selector.attr('uptime', data.uptime)
}

function updateViewApp (appName) {
  var moyenneUptime = 0
  var moyenneStatus = 0
  var nb = 0

  $('#' + appName + ' .monitor').each(function () {
    if (parseInt($(this).attr('etat'), 10) !== 0) {
			nb++
      moyenneUptime += parseInt($(this).attr('uptime'), 10)
      moyenneStatus += parseInt($(this).attr('etat'), 10)
    }
  })
  moyenneUptime = Math.round(moyenneUptime / nb)
  moyenneStatus = Math.round(moyenneStatus / nb)

  if (moyenneStatus == 0) {
    $('#' + appName + ' .app-uptime').attr('etat', '0').text(moyenneUptime + '%')
    $('#' + appName + ' .app-status').attr('etat', '0').text('Up-Time paused')
  } else if (moyenneStatus == 1) {
    $('#' + appName + ' .app-uptime').attr('etat', '1').text(moyenneUptime + '%')
    $('#' + appName + ' .app-status').attr('etat', '1').text('Not checked yet')
  } else if (moyenneStatus == 2) {
    $('#' + appName + ' .app-uptime').attr('etat', '2').text(moyenneUptime + '%')
    $('#' + appName + ' .app-status').attr('etat', '2').text('Online')
  } else if (moyenneStatus > 2 && moyenneStatus <= 8) {
    $('#' + appName + ' .app-uptime').attr('etat', '8').text(100 - moyenneUptime + '%')
    $('#' + appName + ' .app-status').attr('etat', '8').text('Seems offline')
  } else if (moyenneStatus == 9) {
    $('#' + appName + ' .app-uptime').attr('etat', '9').text(100 - moyenneUptime + '%')
    $('#' + appName + ' .app-status').attr('etat', '9').text('Offline')
  } else {
    $('#' + appName + ' .app-status').attr('etat', '-1').text('Error')
  }
}

//==============================================
//======================定数====================
//==============================================

//SlackAPIの投稿用のトークンを設定する
const slackToken = PropertiesService.getScriptProperties().getProperty('SLACK_BOT_TOKEN')
//ライブラリから導入したSlackAppを定義し、トークンを設定する
const slackApp = SlackApp.create(slackToken)
//Slackボットがメッセージを投稿するチャンネル(randomを設定)を定義する(個人IDを指定すればDMも可)
const channelId = "#it-team-test"
//実行ユーザーのデフォルトであるGoogleカレンダーを取得する
const myCalendar = CalendarApp.getCalendarsByName('000_カレッジイベント')[0]
//曜日取得用
const weekItems = ["日", "月", "火", "水", "木", "金", "土"]

//==============================================
//==============================================

function main() {

  //Googleカレンダーの予定取得する日(今日)を設定する
  const calDate = new Date()
  //今日1日のGoogleカレンダーのイベントを取得する
  const allEvents = myCalendar.getEventsForDay(calDate)
  if (!allEvents.length) return slackApp.postMessage(channelId, `There is no event today!`)
  const filteredTodayEvents = allEvents.filter(event => !event.isAllDayEvent())

  //Slackに通知するGoogleカレンダーの予定メッセージを作成
  let message = `*[There ${filteredTodayEvents.length > 1 ? `are ${filteredTodayEvents.length} events` : `is ${filteredTodayEvents.length} event`} today!]*\n`
  filteredTodayEvents.map(event => {
    if (event.isAllDayEvent()) return
    const month = event.getStartTime().getMonth() + 1
    const date = event.getStartTime().getDate()
    const dayIndex = event.getStartTime().getDay()
    const dayOfWeek = weekItems[dayIndex]
    const startH = event.getStartTime().getHours()
    let startM = event.getStartTime().getMinutes()

    if (startM < 10) startM = "0" + startM
    const endH = event.getEndTime().getHours()
    let endM = event.getEndTime().getMinutes()
    if (endM < 10) endM = "0" + endM

    const location = event.getLocation()
    const locationInfo = location && `\n> @ ${location}`
    message += `> *${event.getTitle()}* \n> ${month}/${date} (${dayOfWeek}) ${startH} : ${startM} ~ ${endH} : ${endM} ${locationInfo} \n\n`
  })
  message += '良い一日を！'
  //SlackAppオブジェクトのpostMessageメソッドでボット投稿を行う
  slackApp.postMessage(channelId, message)
}
/*
 * 修改布局 改自:https://raw.githubusercontent.com/zqzess/rule_for_quantumultX/master/js/Mine/wnCalendar/wnCalendar.js
 * 本脚本旨在获取当日的黄历，支持Surge(Panel,Cron),Stash(Tile,Cron),Loon,QuantumultX,Shadowrocket
 * @author: zqzess、Keywos
 * 仓库地址：https://github.com/zqzess/rule_for_quantumultX
 * 感谢@chavyleung提供的Env
 * 定时任务添加： 0 7,10 * * * https://raw.githubusercontent.com/Toperlock/Quantumult/main/task/wnCalendar.js, tag=今日黄历, img-url=https://raw.githubusercontent.com/Toperlock/Quantumult/main/icon/YellowCalendar_2.png
 */
const $ = API('今日黄历')
let title = '📅 今日黄历'
let proxy = 'https://ghproxy.com/'
let url = 'https://raw.githubusercontent.com/zqzess/openApiData/main/calendar/'
let date = new Date()
date = date.toLocaleDateString() // 2023/1/17
let dateArray = date.split('/') // 分割日期
let month = '0' + dateArray[1] // 默认月份前加0，再加后长度是否大于2，大于就截取后两位，排除 012 此情况
if (month.length > 2)
    month = month.substring(1,month.length)
let yearMonth = dateArray[0] + '/' + dateArray[0] + month + '.json' // 拼接链接中的年月路径 2023/202301.json
let ymCode = encodeURIComponent(yearMonth)
let apiUrl = url + ymCode // 拼接链接
let option = {
    url: 'http://ip-api.com/json/',
    headers: {
        'Accept': '*/*',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Mobile Safari/537.36',
        'Content-Type': 'application/json; charset=utf-8'
    }
}
doWork()
function doWork(){
    let body = {}
    let notifyContent = '错误！未获取到数据'
    // 先查看ip是否是中国，是中国则使用代理加速链接
    $.http.get(option).then((response) => {
        let jsonObj = JSON.parse(response.body)
        if(jsonObj.country === 'China')
            apiUrl = proxy + url + ymCode // 链接前面加代理
        let option2 = {
            url: apiUrl,
            headers: {}
        }
        let nlDate = '' // 农历 如 正月初一
        let desc = '' // 节日或描述 如 上元节 四九
        // 请求日历数据
        $.http.get(option2).then((response) =>{
            let jsonObj = JSON.parse(response.body)
            let result = jsonObj.data[0].almanac
            result.forEach(function (i) {
                if( i.year === dateArray[0] && i.month === dateArray[1] && i.day === dateArray[2] )
                {
                    nlDate = date + ' ' + i.lMonth + '月' + i.lDate
                    // 拼接今日节日
                    desc += i.desc?i.desc:''
                    desc += i.term?' ' + i.term:''
                    desc += i.value?' ' + i.value:''
                    // 拼接消息体
                    notifyContent = '🈲️忌：' + i.avoid + '\n✅宜：' + i.suit + '\n干支纪法：' + i.gzYear + '年 ' + i.gzMonth + '月 ' + i.gzDate + '日 ' + desc
                }
            })
            
            $.isSurge ? body = {
                title: title,
                content: notifyContent,
                icon: 'calendar',
                'icon-color': '#9999FF'
            } : body = {title: title, content: notifyContent, icon: 'calendar', backgroundColor: '#9999FF'}
            
            console.log('\n内容：\n' + notifyContent)
            $.notify(nlDate, "", notifyContent)
            $.isSurge || $.isStash ? $.done(body) : $.done()
        })
    })
}


// prettier-ignore: https://github.com/Peng-YM/QuanX/blob/master/Tools/OpenAPI/README.md
/*********************************** API *************************************/
function ENV(){const e="undefined"!=typeof $task,t="undefined"!=typeof $loon,s="undefined"!=typeof $httpClient&&!t,i="function"==typeof require&&"undefined"!=typeof $jsbox;return{isQX:e,isLoon:t,isSurge:s,isNode:"function"==typeof require&&!i,isJSBox:i,isRequest:"undefined"!=typeof $request,isScriptable:"undefined"!=typeof importModule}}function HTTP(e={baseURL:""}){const{isQX:t,isLoon:s,isSurge:i,isScriptable:n,isNode:o}=ENV(),r=/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)/;const u={};return["GET","POST","PUT","DELETE","HEAD","OPTIONS","PATCH"].forEach(l=>u[l.toLowerCase()]=(u=>(function(u,l){l="string"==typeof l?{url:l}:l;const h=e.baseURL;h&&!r.test(l.url||"")&&(l.url=h?h+l.url:l.url);const a=(l={...e,...l}).timeout,c={onRequest:()=>{},onResponse:e=>e,onTimeout:()=>{},...l.events};let f,d;if(c.onRequest(u,l),t)f=$task.fetch({method:u,...l});else if(s||i||o)f=new Promise((e,t)=>{(o?require("request"):$httpClient)[u.toLowerCase()](l,(s,i,n)=>{s?t(s):e({statusCode:i.status||i.statusCode,headers:i.headers,body:n})})});else if(n){const e=new Request(l.url);e.method=u,e.headers=l.headers,e.body=l.body,f=new Promise((t,s)=>{e.loadString().then(s=>{t({statusCode:e.response.statusCode,headers:e.response.headers,body:s})}).catch(e=>s(e))})}const p=a?new Promise((e,t)=>{d=setTimeout(()=>(c.onTimeout(),t(`${u} URL: ${l.url} exceeds the timeout ${a} ms`)),a)}):null;return(p?Promise.race([p,f]).then(e=>(clearTimeout(d),e)):f).then(e=>c.onResponse(e))})(l,u))),u}function API(e="untitled",t=!1){const{isQX:s,isLoon:i,isSurge:n,isNode:o,isJSBox:r,isScriptable:u}=ENV();return new class{constructor(e,t){this.name=e,this.debug=t,this.http=HTTP(),this.env=ENV(),this.node=(()=>{if(o){return{fs:require("fs")}}return null})(),this.initCache();Promise.prototype.delay=function(e){return this.then(function(t){return((e,t)=>new Promise(function(s){setTimeout(s.bind(null,t),e)}))(e,t)})}}initCache(){if(s&&(this.cache=JSON.parse($prefs.valueForKey(this.name)||"{}")),(i||n)&&(this.cache=JSON.parse($persistentStore.read(this.name)||"{}")),o){let e="root.json";this.node.fs.existsSync(e)||this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.root={},e=`${this.name}.json`,this.node.fs.existsSync(e)?this.cache=JSON.parse(this.node.fs.readFileSync(`${this.name}.json`)):(this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.cache={})}}persistCache(){const e=JSON.stringify(this.cache,null,2);s&&$prefs.setValueForKey(e,this.name),(i||n)&&$persistentStore.write(e,this.name),o&&(this.node.fs.writeFileSync(`${this.name}.json`,e,{flag:"w"},e=>console.log(e)),this.node.fs.writeFileSync("root.json",JSON.stringify(this.root,null,2),{flag:"w"},e=>console.log(e)))}write(e,t){if(this.log(`SET ${t}`),-1!==t.indexOf("#")){if(t=t.substr(1),n||i)return $persistentStore.write(e,t);if(s)return $prefs.setValueForKey(e,t);o&&(this.root[t]=e)}else this.cache[t]=e;this.persistCache()}read(e){return this.log(`READ ${e}`),-1===e.indexOf("#")?this.cache[e]:(e=e.substr(1),n||i?$persistentStore.read(e):s?$prefs.valueForKey(e):o?this.root[e]:void 0)}delete(e){if(this.log(`DELETE ${e}`),-1!==e.indexOf("#")){if(e=e.substr(1),n||i)return $persistentStore.write(null,e);if(s)return $prefs.removeValueForKey(e);o&&delete this.root[e]}else delete this.cache[e];this.persistCache()}notify(e,t="",l="",h={}){const a=h["open-url"],c=h["media-url"];if(s&&$notify(e,t,l,h),n&&$notification.post(e,t,l+`${c?"\n多媒体:"+c:""}`,{url:a}),i){let s={};a&&(s.openUrl=a),c&&(s.mediaUrl=c),"{}"===JSON.stringify(s)?$notification.post(e,t,l):$notification.post(e,t,l,s)}if(o||u){const s=l+(a?`\n点击跳转: ${a}`:"")+(c?`\n多媒体: ${c}`:"");if(r){require("push").schedule({title:e,body:(t?t+"\n":"")+s})}else console.log(`${e}\n${t}\n${s}\n\n`)}}log(e){this.debug&&console.log(`[${this.name}] LOG: ${this.stringify(e)}`)}info(e){console.log(`[${this.name}] INFO: ${this.stringify(e)}`)}error(e){console.log(`[${this.name}] ERROR: ${this.stringify(e)}`)}wait(e){return new Promise(t=>setTimeout(t,e))}done(e={}){s||i||n?$done(e):o&&!r&&"undefined"!=typeof $context&&($context.headers=e.headers,$context.statusCode=e.statusCode,$context.body=e.body)}stringify(e){if("string"==typeof e||e instanceof String)return e;try{return JSON.stringify(e,null,2)}catch(e){return"[object Object]"}}}(e,t)}
/*****************************************************************************/
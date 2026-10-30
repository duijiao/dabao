const { app, BrowserWindow, Menu, session, shell, dialog } = require('electron');
const path = require('path'), fs = require('fs');
const { createServer } = require('./server');

const PORT = 38917;                                   // 固定端口：改了它，之前保存的歌单/库/设置就读不到了
const ORIGIN = `http://127.0.0.1:${PORT}`;
const ROOT = path.join(__dirname, 'app');

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');   // 动态背景视频自动播放
app.commandLine.appendSwitch('disable-renderer-backgrounding');                // 投屏窗口在后台也不降速

if (!app.requestSingleInstanceLock()) { app.quit(); }
let main = null;
app.on('second-instance', ()=>{ if (main) { if (main.isMinimized()) main.restore(); main.focus(); } });

function vendorMap(){
  const m = {};
  try { m['/__vendor/crypto-js.js'] = path.join(path.dirname(require.resolve('crypto-js/package.json')), 'crypto-js.js'); } catch {}
  return m;
}
function startServer(){
  return new Promise((ok, bad)=>{
    const srv = createServer(ROOT, vendorMap());
    srv.once('error', bad);
    srv.listen(PORT, '127.0.0.1', ()=>ok(srv));
  });
}

const childOpts = ()=>({ autoHideMenuBar:true, backgroundColor:'#000000', title:'投屏显示',
  webPreferences:{ webSecurity:false, backgroundThrottling:false } });

function hookWindowOpen(wc){
  wc.setWindowOpenHandler(({ url })=>{
    if (url.startsWith(ORIGIN)) return { action:'allow', overrideBrowserWindowOptions:childOpts() };   // 投屏窗口 / 舞台屏
    if (/^https?:/i.test(url)) shell.openExternal(url);                                                  // 其它网址用系统浏览器打开
    return { action:'deny' };
  });
}

function createWindow(){
  main = new BrowserWindow({ width:1360, height:880, minWidth:900, minHeight:600, title:'歌谱投屏', backgroundColor:'#0b1220', autoHideMenuBar:true,
    webPreferences:{ webSecurity:false, backgroundThrottling:false, contextIsolation:true, nodeIntegration:false } });
  // webSecurity:false —— 页面要直接请求赞美网 / 诗歌库等外部接口，桌面版里关掉跨域限制才能和网页版一样用。只加载本机的这一个页面，不会打开陌生网站。
  hookWindowOpen(main.webContents);
  app.on('web-contents-created', (_e, wc)=>{ if (wc !== main.webContents) hookWindowOpen(wc); });
  main.on('closed', ()=>{ main = null; app.quit(); });
  main.loadURL(ORIGIN + '/?lyric=1');   // 启动后直接进入「歌词投屏」界面
}

app.whenReady().then(async ()=>{
  const ses = session.defaultSession;
  ses.setPermissionRequestHandler((_wc, _perm, cb)=>cb(true));        // 多屏检测（window-management）、全屏等
  ses.setPermissionCheckHandler(()=>true);
  // crypto-js 原本从 CDN 加载，离线时会失败：改成用安装包里自带的一份
  ses.webRequest.onBeforeRequest({ urls:['https://cdnjs.cloudflare.com/ajax/libs/crypto-js/*', 'https://cdn.jsdelivr.net/npm/crypto-js@*'] }, (d, cb)=>{
    cb(vendorMap()['/__vendor/crypto-js.js'] ? { redirectURL: ORIGIN + '/__vendor/crypto-js.js' } : {});
  });
  try { await startServer(); }
  catch (e) { dialog.showErrorBox('歌谱投屏', `本机端口 ${PORT} 被占用，无法启动。\n请关闭其它正在运行的「歌谱投屏」或占用该端口的程序后再试。\n\n${e.message||e}`); app.quit(); return; }

  const isMac = process.platform === 'darwin';
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    ...(isMac ? [{ role:'appMenu' }] : []),
    { role:'editMenu' },
    { label:'视图', submenu:[ { role:'reload', label:'刷新' }, { role:'togglefullscreen', label:'全屏' }, { role:'resetZoom', label:'恢复缩放' }, { role:'zoomIn', label:'放大' }, { role:'zoomOut', label:'缩小' }, { role:'toggleDevTools', label:'开发者工具' } ] },
    { role:'windowMenu' }
  ]));
  createWindow();
  app.on('activate', ()=>{ if (!BrowserWindow.getAllWindows().length) createWindow(); });
});
app.on('window-all-closed', ()=>app.quit());

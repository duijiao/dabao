// 本地静态服务：把 app/ 里的页面放到 http://127.0.0.1:端口 上。
// 不用 file:// 的原因：投屏窗口要和主窗口互相通信、读写子窗口，需要一个正常的 http 来源；
// 端口固定，浏览器存储（歌单、库、设置）才不会每次启动都丢。
const http = require('http'), fs = require('fs'), path = require('path');
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8',
  '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.gif':'image/gif', '.webp':'image/webp', '.svg':'image/svg+xml', '.ico':'image/x-icon',
  '.mp4':'video/mp4', '.webm':'video/webm', '.woff2':'font/woff2', '.woff':'font/woff', '.ttf':'font/ttf' };

function createServer(root, vendor){
  return http.createServer((req, res)=>{
    let p; try{ p = decodeURIComponent(new URL(req.url, 'http://x').pathname); }catch{ res.writeHead(400); return res.end(); }
    let file;
    if (vendor && vendor[p]) file = vendor[p];                                   // 本地自带的第三方库（如 crypto-js）
    else {
      file = path.normalize(path.join(root, p === '/' ? 'index.html' : p));
      if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403); return res.end(); }   // 防止 ../ 越界
    }
    fs.stat(file, (err, st)=>{
      if (err || !st.isFile()) {
        if (path.extname(p)) { res.writeHead(404); return res.end('Not found'); }          // 带扩展名又不存在：404
        file = path.join(root, 'index.html');                                                  // 其它路径一律回到首页
      }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control':'no-cache' });
      fs.createReadStream(file).pipe(res);
    });
  });
}
module.exports = { createServer };

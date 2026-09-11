/* ============================================================
 * link-jump · 主脚本
 * 主题切换 / DNS 预解析 / 长链跳转 / 短链跳转 / 404 彩蛋
 * ============================================================ */
(function () {
  'use strict';

  /* ---------- 配置 ---------- */
  var LONG_DELAY = 5;                 // 长链倒计时（秒）
  var SHORT_DELAY = 3;                // 短链倒计时（秒）
  var PREFETCH_TIMEOUT = 3000;        // DNS 预解析超时（毫秒），超时销毁标签
  var PREFETCH_HOSTS = [              // 附加预解析域名（可多条，如 CDN）
    'gcore.jsdelivr.net'
  ];

  /* ---------- 工具函数 ---------- */
  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function hostOf(url) {
    try { return new URL(url).hostname; } catch (e) { return ''; }
  }

  /* ---------- 主题：本地时间 19:00-07:00 深色 ---------- */
  function applyTheme() {
    var h = new Date().getHours();
    document.documentElement.classList.toggle('dark', h >= 19 || h < 7);
  }

  /* ---------- DNS 预解析（可多条，超时销毁） ---------- */
  var prefetchLinks = [];
  function startPrefetch(url) {
    var hosts = [];
    var target = hostOf(url);
    if (target) hosts.push(target);
    PREFETCH_HOSTS.forEach(function (h) {
      if (h && hosts.indexOf(h) === -1) hosts.push(h);
    });
    hosts.forEach(function (h) {
      var link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = '//' + h;
      document.head.appendChild(link);
      prefetchLinks.push(link);
    });
    setTimeout(stopPrefetch, PREFETCH_TIMEOUT);
  }
  function stopPrefetch() {
    prefetchLinks.forEach(function (link) {
      if (link.parentNode) link.parentNode.removeChild(link);
    });
    prefetchLinks.length = 0;
  }

  /* ---------- 跳转：location.replace，不保留历史记录 ---------- */
  function go(url) {
    location.replace(url);
  }

  /* ---------- index.html 跳转页逻辑 ---------- */
  function initJump() {
    var loadingEl = document.getElementById('loading');
    var jumpEl = document.getElementById('jump');
    if (!loadingEl || !jumpEl) return;   // 非跳转页

    var riskBox = document.getElementById('riskBox');
    var targetText = document.getElementById('targetText');
    var countNum = document.getElementById('countNum');
    var jumpBtn = document.getElementById('jumpBtn');

    var t = getParam('t');
    var s = getParam('s');

    function render(target, seconds, withRisk) {
      var display = target.name || target.link || '';
      targetText.textContent = display;
      if (withRisk && riskBox) riskBox.hidden = false;
      loadingEl.hidden = true;
      jumpEl.hidden = false;

      var left = seconds;
      countNum.textContent = left;
      var timer = setInterval(function () {
        left -= 1;
        if (left <= 0) { clearInterval(timer); go(target.link); return; }
        countNum.textContent = left;
      }, 1000);
      jumpBtn.addEventListener('click', function () {
        clearInterval(timer);
        go(target.link);
      });
      startPrefetch(target.link);
    }

    if (t !== null) {
      /* ---- 长链模式：?t=目标链接，5s 倒计时 + 强制风险提示 ---- */
      var link = t;
      if (!/^https?:\/\//i.test(link)) link = 'https://' + link;
      if (/^https?:\/\/.+/i.test(link)) {
        render({ name: link, link: link }, LONG_DELAY, true);
      } else {
        go('404.html');
      }
    } else if (s !== null) {
      /* ---- 短链模式：?s=识别码 → ls/{code}.json，3s 倒计时，无风险提示 ---- */
      loadingEl.hidden = false;
      var url = 'ls/' + encodeURIComponent(s) + '.json?r=' + Date.now(); // 随机参数规避缓存
      fetch(url)
        .then(function (res) {
          if (!res.ok) throw new Error('not found');
          return res.json();
        })
        .then(function (data) {
          if (!data || typeof data.link !== 'string' || !data.link) throw new Error('bad config');
          render({
            name: typeof data.name === 'string' ? data.name : '',
            link: data.link
          }, SHORT_DELAY, false);
        })
        .catch(function () {
          /* 配置文件不存在 / 解析失败 → 404 彩蛋页 */
          go('404.html');
        });
    } else {
      /* ---- 无有效参数 → 404 ---- */
      go('404.html');
    }
  }

  /* ---------- 404.html 沙漠彩蛋逻辑 ---------- */
  function initDesert() {
    var title = document.getElementById('desert-title');
    var timer = document.getElementById('desert-timer');
    var tipWrap = document.getElementById('desert-tip-wrap');
    var tip = document.getElementById('desert-tip');
    if (!title || !timer) return;      // 非 404 页

    var start = Date.now();
    setInterval(function () {
      var e = Math.floor((Date.now() - start) / 1000);
      var text = pad(Math.floor(e / 3600)) + ':' + pad(Math.floor((e % 3600) / 60)) + ':' + pad(e % 60);
      timer.textContent = text;
      if (e >= 60) title.textContent = '您已经在这片沙漠待了 ' + text;
    }, 1000);

    if (tipWrap && tip) {
      fetch('wordbank.json?r=' + Date.now())
        .then(function (res) {
          if (!res.ok) throw new Error('load fail');
          return res.json();
        })
        .then(function (data) {
          var words = data && data.words;
          if (words && words.length) {
            tip.textContent = words[Math.floor(Math.random() * words.length)];
            tipWrap.hidden = false;
          }
        })
        .catch(function () { /* 词库加载失败：隐藏提示模块，不阻塞页面 */ });
    }
  }

  /* ---------- 启动 ---------- */
  applyTheme();
  initJump();
  initDesert();
})();

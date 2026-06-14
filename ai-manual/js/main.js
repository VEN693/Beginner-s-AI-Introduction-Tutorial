// AI使用手册 - 主脚本
(function() {
  'use strict';

  // 侧边栏导航数据
  var NAV_DATA = [
    { part: '第一部分：基础概念入门', chapters: [
      { id: 'chapter1', num: '1', title: 'AI认知基础', file: 'chapter1.html' },
      { id: 'chapter2', num: '2', title: 'AI分类与区别', file: 'chapter2.html' },
      { id: 'chapter3', num: '3', title: 'AI使用基础要素', file: 'chapter3.html' }
    ]},
    { part: '第二部分：快速上手指南', chapters: [
      { id: 'chapter4', num: '4', title: '主流AI模型', file: 'chapter4.html' },
      { id: 'chapter5', num: '5', title: '主流AI工具', file: 'chapter5.html' }
    ]},
    { part: '第三部分：进阶技巧', chapters: [
      { id: 'chapter6', num: '6', title: 'MCP详解', file: 'chapter6.html' },
      { id: 'chapter7', num: '7', title: 'Skills详解', file: 'chapter7.html' },
      { id: 'chapter8', num: '8', title: '高级配置与优化', file: 'chapter8.html' }
    ]}
  ];

  // 获取当前页面文件名
  function getCurrentFile() {
    var path = window.location.pathname;
    var file = path.split('/').pop() || 'index.html';
    return file;
  }

  // 渲染侧边栏
  function renderSidebar() {
    var sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    var currentFile = getCurrentFile();
    var html = '<a href="index.html" class="nav-chapter' + (currentFile === 'index.html' ? ' active' : '') + '" style="font-weight:700;padding-left:1.25rem;margin-bottom:0.5rem;">📖 手册首页</a>';

    NAV_DATA.forEach(function(part) {
      html += '<div class="nav-part">';
      html += '<div class="nav-part-title">' + part.part + '</div>';
      part.chapters.forEach(function(ch) {
        var isActive = currentFile === ch.file;
        html += '<a href="' + ch.file + '" class="nav-chapter' + (isActive ? ' active' : '') + '">';
        html += '第' + ch.num + '章 ' + ch.title;
        html += '</a>';
      });
      html += '</div>';
    });

    sidebar.innerHTML = html;
  }

  // 主题切换
  function initTheme() {
    var saved = localStorage.getItem('ai-manual-theme');
    if (saved === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    var btn = document.querySelector('.theme-toggle');
    if (!btn) return;

    btn.addEventListener('click', function() {
      var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('ai-manual-theme', 'light');
        btn.textContent = '🌙';
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('ai-manual-theme', 'dark');
        btn.textContent = '☀️';
      }
    });

    // 设置初始图标
    btn.textContent = document.documentElement.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙';
  }

  // 移动端侧边栏
  function initMobileMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var sidebar = document.querySelector('.sidebar');
    var overlay = document.querySelector('.sidebar-overlay');
    if (!toggle || !sidebar) return;

    toggle.addEventListener('click', function() {
      sidebar.classList.toggle('open');
      if (overlay) overlay.classList.toggle('show');
    });

    if (overlay) {
      overlay.addEventListener('click', function() {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
      });
    }

    // 点击导航链接后关闭
    sidebar.addEventListener('click', function(e) {
      if (e.target.classList.contains('nav-chapter')) {
        sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('show');
      }
    });
  }

  // 搜索功能
  function initSearch() {
    var input = document.querySelector('.search-box input');
    if (!input) return;

    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        var q = input.value.trim().toLowerCase();
        if (!q) return;

        // 简单搜索：在当前页面查找
        var content = document.querySelector('.main-content');
        if (!content) return;

        // 移除之前的高亮
        var marks = content.querySelectorAll('.search-highlight');
        marks.forEach(function(m) {
          var parent = m.parentNode;
          parent.replaceChild(document.createTextNode(m.textContent), m);
          parent.normalize();
        });

        if (!q) return;

        // 递归搜索文本节点
        var walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, null, false);
        var firstMatch = null;
        while (walker.nextNode()) {
          var node = walker.currentNode;
          var idx = node.textContent.toLowerCase().indexOf(q);
          if (idx >= 0) {
            var range = document.createRange();
            range.setStart(node, idx);
            range.setEnd(node, idx + q.length);
            var mark = document.createElement('mark');
            mark.className = 'search-highlight';
            mark.style.cssText = 'background:#fef08a;color:#000;padding:1px 2px;border-radius:2px;';
            range.surroundContents(mark);
            if (!firstMatch) firstMatch = mark;
          }
        }

        if (firstMatch) {
          firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });
  }

  // 代码复制按钮
  function initCodeCopy() {
    document.querySelectorAll('pre').forEach(function(pre) {
      var btn = document.createElement('button');
      btn.className = 'code-copy';
      btn.textContent = '复制';
      btn.addEventListener('click', function() {
        var code = pre.querySelector('code');
        var text = code ? code.textContent : pre.textContent;
        navigator.clipboard.writeText(text).then(function() {
          btn.textContent = '已复制 ✓';
          setTimeout(function() { btn.textContent = '复制'; }, 2000);
        });
      });
      pre.style.position = 'relative';
      pre.appendChild(btn);
    });
  }

  // 滚动渐入动画
  function initScrollReveal() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var targets = document.querySelectorAll(
      '.chapter-card, .card, .tip-box, .table-wrap, .home-stats, .part-section, .stat-item'
    );

    if (!targets.length) return;

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(function(el) {
      el.classList.add('reveal-target');
      observer.observe(el);
    });
  }

  // 获取上一章/下一章
  function getChapterNav() {
    var currentFile = getCurrentFile();
    var allChapters = [];
    NAV_DATA.forEach(function(part) {
      part.chapters.forEach(function(ch) {
        allChapters.push(ch);
      });
    });

    var currentIdx = -1;
    for (var i = 0; i < allChapters.length; i++) {
      if (allChapters[i].file === currentFile) {
        currentIdx = i;
        break;
      }
    }

    if (currentIdx < 0) return '';

    var html = '<div class="chapter-nav">';

    if (currentIdx > 0) {
      var prev = allChapters[currentIdx - 1];
      html += '<a href="' + prev.file + '" class="prev">';
      html += '<span class="nav-label">← 上一章</span>';
      html += '<span class="nav-title">第' + prev.num + '章 ' + prev.title + '</span>';
      html += '</a>';
    } else {
      html += '<a href="index.html" class="prev">';
      html += '<span class="nav-label">← 返回</span>';
      html += '<span class="nav-title">手册首页</span>';
      html += '</a>';
    }

    if (currentIdx < allChapters.length - 1) {
      var next = allChapters[currentIdx + 1];
      html += '<a href="' + next.file + '" class="next">';
      html += '<span class="nav-label">下一章 →</span>';
      html += '<span class="nav-title">第' + next.num + '章 ' + next.title + '</span>';
      html += '</a>';
    }

    html += '</div>';
    return html;
  }

  // 渲染章节导航
  function renderChapterNav() {
    var container = document.getElementById('chapter-nav');
    if (!container) return;
    container.innerHTML = getChapterNav();
  }

  // 初始化
  document.addEventListener('DOMContentLoaded', function() {
    renderSidebar();
    initTheme();
    initMobileMenu();
    initSearch();
    initCodeCopy();
    initScrollReveal();
    renderChapterNav();
  });

  // 导出给外部使用
  window.AIManual = {
    NAV_DATA: NAV_DATA,
    getCurrentFile: getCurrentFile
  };
})();

// 秒著 - 一体化服务器 v5 (多模型适配版)
// node proxy.js
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PORT = 3000;
const HTML_FILE = path.join(__dirname, '秒著.html');

// ═══════════════════════════════════════════════════════════════
// 多模型提供商配置表
// ═══════════════════════════════════════════════════════════════
const PROVIDERS = {
  volcengine: {
    name: '火山引擎方舟',
    baseURL: 'ark.cn-beijing.volces.com',
    apiPath: '/api/coding/v3/chat/completions',
    headers: (apiKey) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }),
    formatRequest: (body) => ({
      model: body.model,
      messages: body.messages
    }),
    testModel: 'doubao-seed-2-0-code'
  },

  deepseek: {
    name: 'DeepSeek',
    baseURL: 'api.deepseek.com',
    apiPath: '/v1/chat/completions',
    headers: (apiKey) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }),
    formatRequest: (body) => ({
      model: body.model,
      messages: body.messages
    }),
    testModel: 'deepseek-chat'
  },

  zhipu: {
    name: '智谱 GLM',
    baseURL: 'open.bigmodel.cn',
    apiPath: '/api/paas/v4/chat/completions',
    headers: (apiKey) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }),
    formatRequest: (body) => ({
      model: body.model,
      messages: body.messages
    }),
    testModel: 'glm-4.7-thinking'
  },

  moonshot: {
    name: '月之暗面 Kimi',
    baseURL: 'api.moonshot.cn',
    apiPath: '/v1/chat/completions',
    headers: (apiKey) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }),
    formatRequest: (body) => ({
      model: body.model,
      messages: body.messages
    }),
    testModel: 'moonshot-v1-8k'
  },

  minimax: {
    name: 'MiniMax',
    baseURL: 'api.minimax.chat',
    apiPath: '/v1/text/chatcompletion',
    headers: (apiKey) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }),
    formatRequest: (body) => ({
      model: body.model,
      messages: body.messages
    }),
    testModel: 'MiniMax-Text-01'
  }
};

const MODEL_PROVIDER_MAP = {
  'doubao-seed-2-0-code': 'volcengine',
  'doubao-seed-2-0-pro': 'volcengine',
  'deepseek-chat': 'deepseek',
  'deepseek-coder': 'deepseek',
  'glm-4.7-thinking': 'zhipu',
  'glm-z1-airx': 'zhipu',
  'glm-4-flash': 'zhipu',
  'moonshot-v1-8k': 'moonshot',
  'moonshot-v1-32k': 'moonshot',
  'MiniMax-Text-01': 'minimax'
};

function getProviderConfig(model) {
  const providerKey = MODEL_PROVIDER_MAP[model] || 'volcengine';
  return { providerKey, config: PROVIDERS[providerKey] };
}

// ═══════════════════════════════════════════════════════════════
// API 调用核心函数
// ═══════════════════════════════════════════════════════════════

function callProviderAPI(providerKey, apiKey, body, callback) {
  const provider = PROVIDERS[providerKey];
  if (!provider) {
    return callback(new Error(`未知的提供商: ${providerKey}`));
  }

  const requestBody = provider.formatRequest(body);
  const requestData = JSON.stringify(requestBody);
  const headers = provider.headers(apiKey);
  
  const options = {
    hostname: provider.baseURL,
    path: provider.apiPath,
    method: 'POST',
    headers: {
      ...headers,
      'Content-Length': Buffer.byteLength(requestData)
    }
  };

  console.log(`[${new Date().toLocaleTimeString()}] → ${provider.name} (${body.model})`);

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log(`[${new Date().toLocaleTimeString()}] ← ${provider.name} HTTP ${res.statusCode}`);
      
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const parsed = JSON.parse(data);
          callback(null, parsed);
        } catch (e) {
          callback(new Error(`解析响应失败: ${e.message}`));
        }
      } else {
        let errorMsg = `HTTP ${res.statusCode}`;
        try {
          const errorData = JSON.parse(data);
          errorMsg = errorData.error?.message || errorData.message || errorMsg;
        } catch (e) {
          errorMsg = data || errorMsg;
        }
        callback(new Error(errorMsg));
      }
    });
  });

  req.on('error', (e) => {
    console.error(`[${new Date().toLocaleTimeString()}] ✗ ${provider.name} 请求失败:`, e.message);
    callback(new Error(`网络请求失败: ${e.message}`));
  });

  req.write(requestData);
  req.end();
}

function testAPIConnection(providerKey, apiKey, model, callback) {
  const provider = PROVIDERS[providerKey];
  if (!provider) {
    return callback(new Error(`未知的提供商: ${providerKey}`));
  }
  const testModel = model || provider.testModel;
  
  const testBody = {
    model: testModel,
    messages: [
      { role: 'user', content: '你好，这是一个API连接测试，请回复"连接成功"。' }
    ]
  };

  callProviderAPI(providerKey, apiKey, testBody, (err, response) => {
    if (err) {
      return callback(err);
    }
    
    const content = response.choices?.[0]?.message?.content;
    if (content) {
      callback(null, {
        success: true,
        provider: provider.name,
        model: testModel,
        response: content.slice(0, 100)
      });
    } else {
      callback(new Error('响应格式异常'));
    }
  });
}

function ensureDocx() {
  if (!fs.existsSync(path.join(__dirname, 'node_modules', 'docx'))) {
    console.log('  正在安装 docx 依赖包...');
    try { execSync('npm install docx', { cwd: __dirname, stdio: 'inherit' }); console.log('  ✓ docx 安装完成'); }
    catch(e) { console.error('  ✗ docx 安装失败，请手动运行: npm install docx'); }
  }
}
ensureDocx();

// ── 工具函数 ──────────────────────────────────────────────────────────────
function makeBorder() {
  const b = { style: 'single', size: 1, color: '333333' };
  return { top: b, bottom: b, left: b, right: b };
}

function makeHeaderCell(text, widthDxa) {
  const { TableCell, Paragraph, TextRun, ShadingType, WidthType } = require('docx');
  return new TableCell({
    borders: makeBorder(),
    width: { size: widthDxa, type: WidthType.DXA },
    shading: { fill: 'F2F2F2', type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text: String(text||''), bold: true, size: 22, font: '宋体' })] })]
  });
}

function makeDataCell(text, widthDxa) {
  const { TableCell, Paragraph, TextRun, WidthType } = require('docx');
  return new TableCell({
    borders: makeBorder(),
    width: { size: widthDxa, type: WidthType.DXA },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text: String(text||''), size: 22, font: '宋体' })] })]
  });
}

function makePara(text, opts = {}) {
  const { Paragraph, TextRun, AlignmentType } = require('docx');
  return new Paragraph({
    alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
    spacing: { before: opts.before || 0, after: opts.after !== undefined ? opts.after : 100 },
    children: [new TextRun({ text: String(text||''), bold: opts.bold, size: opts.size || 22, font: '宋体', color: opts.color })]
  });
}

function makeHeading(text, level) {
  const { Paragraph, TextRun, HeadingLevel } = require('docx');
  const lvlMap = { 1: HeadingLevel.HEADING_1, 2: HeadingLevel.HEADING_2, 3: HeadingLevel.HEADING_3 };
  return new Paragraph({
    heading: lvlMap[level] || HeadingLevel.HEADING_2,
    spacing: { before: level === 1 ? 360 : 240, after: 120 },
    children: [new TextRun({ text: String(text||''), font: '宋体', bold: true, size: level === 1 ? 28 : level === 2 ? 24 : 22 })]
  });
}

function getImageSize(buf, mime) {
  try {
    if (mime && (mime.includes('png'))) {
      if (buf[0]===0x89 && buf[1]===0x50 && buf[2]===0x4E && buf[3]===0x47) {
        const w = buf.readUInt32BE(16);
        const h = buf.readUInt32BE(20);
        if (w > 0 && h > 0) return { w, h };
      }
    }
    if (mime && (mime.includes('jpeg') || mime.includes('jpg'))) {
      let i = 2;
      while (i < buf.length - 8) {
        if (buf[i] === 0xFF) {
          const marker = buf[i+1];
          if (marker >= 0xC0 && marker <= 0xC3) {
            const h = buf.readUInt16BE(i+5);
            const w = buf.readUInt16BE(i+7);
            if (w > 0 && h > 0) return { w, h };
          }
          const segLen = buf.readUInt16BE(i+2);
          i += 2 + segLen;
        } else { i++; }
      }
    }
  } catch(e) {}
  return null;
}

function makeImageRun(imgObj) {
  const { ImageRun } = require('docx');
  const buf = Buffer.from(imgObj.b64, 'base64');
  const mime = imgObj.mime || 'image/png';
  const type = mime.includes('jpeg') || mime.includes('jpg') ? 'jpg' : 'png';

  const MAX_W = 500;
  const MAX_H = 600;

  const size = getImageSize(buf, mime);
  let width, height;
  if (size && size.w > 0 && size.h > 0) {
    const ratio = size.w / size.h;
    if (size.w <= MAX_W && size.h <= MAX_H) {
      width = size.w;
      height = size.h;
    } else if (size.w / MAX_W > size.h / MAX_H) {
      width = MAX_W;
      height = Math.round(MAX_W / ratio);
    } else {
      height = MAX_H;
      width = Math.round(MAX_H * ratio);
    }
  } else {
    width = MAX_W;
    height = Math.round(MAX_W * 0.6);
  }

  return new ImageRun({ data: buf, transformation: { width, height }, type });
}

function makeImagePara(imgObj, caption) {
  const { Paragraph, TextRun, AlignmentType } = require('docx');
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 160, after: 60 },
      children: [makeImageRun(imgObj)]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: caption || '', size: 18, font: '宋体', color: '666666', italics: true })]
    })
  ];
}

function makeDocHeader(titleText) {
  const { Header, Paragraph, TextRun, TabStopPosition, TabStopType, PageNumber } = require('docx');

  return new Header({
    children: [
      new Paragraph({
        tabStops: [
          { type: TabStopType.RIGHT, position: TabStopPosition.MAX }
        ],
        children: [
          new TextRun({ 
            text: titleText, 
            size: 18, 
            font: '宋体'
          }),
          new TextRun({ text: '\t', size: 18, font: '宋体' }),
          new TextRun({ text: '第', size: 18, font: '宋体' }),
          new TextRun({ children: [PageNumber.CURRENT], size: 18, font: '宋体' }),
          new TextRun({ text: '页 共', size: 18, font: '宋体' }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, font: '宋体' }),
          new TextRun({ text: '页', size: 18, font: '宋体' }),
        ]
      })
    ]
  });
}

function makeEmptyFooter() {
  const { Footer, Paragraph } = require('docx');
  return new Footer({
    children: [new Paragraph({ children: [] })]
  });
}

function makeEmptyHeaderFooter() {
  const { Header, Footer, Paragraph } = require('docx');
  return {
    header: new Header({ 
      children: [new Paragraph({ children: [] })] 
    }),
    footer: new Footer({ 
      children: [new Paragraph({ children: [] })] 
    }),
  };
}

// ═══════════════════════════════════════════════════════════════
// HTTP 服务器路由处理
// ═══════════════════════════════════════════════════════════════

function handleCORS(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function sendJSON(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function parseBody(req, callback) {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    try {
      const parsed = JSON.parse(body);
      callback(null, parsed);
    } catch (e) {
      callback(new Error('无效的JSON格式'));
    }
  });
}

function handleTestAPI(req, res) {
  parseBody(req, (err, body) => {
    if (err) {
      return sendJSON(res, 400, { success: false, error: err.message });
    }

    const { provider, apiKey, model } = body;
    
    if (!provider || !apiKey) {
      return sendJSON(res, 400, { 
        success: false, 
        error: '缺少必要参数: provider 和 apiKey' 
      });
    }

    const providerConfig = PROVIDERS[provider];
    if (!providerConfig) {
      return sendJSON(res, 400, { 
        success: false, 
        error: `未知的提供商: ${provider}` 
      });
    }

    testAPIConnection(provider, apiKey, model, (err, result) => {
      if (err) {
        console.error(`[${new Date().toLocaleTimeString()}] ✗ ${providerConfig.name} 测试失败:`, err.message);
        return sendJSON(res, 200, {
          success: false,
          provider: provider,
          providerName: providerConfig.name,
          error: err.message
        });
      }

      console.log(`[${new Date().toLocaleTimeString()}] ✓ ${providerConfig.name} 测试成功`);
      sendJSON(res, 200, {
        success: true,
        provider: provider,
        providerName: providerConfig.name,
        model: result.model,
        response: result.response
      });
    });
  });
}

function handleChatAPI(req, res) {
  parseBody(req, (err, body) => {
    if (err) {
      return sendJSON(res, 400, { error: err.message });
    }

    const { apiKey, model, messages } = body;

    if (!apiKey) {
      return sendJSON(res, 401, { error: '缺少API密钥' });
    }

    if (!messages || !Array.isArray(messages)) {
      return sendJSON(res, 400, { error: 'messages 必须是数组' });
    }

    const { providerKey, config: providerConfig } = getProviderConfig(model);

    const requestBody = {
      model: model || providerConfig.testModel,
      messages: messages
    };

    callProviderAPI(providerKey, apiKey, requestBody, (err, result) => {
      if (err) {
        return sendJSON(res, 502, { 
          error: {
            message: err.message,
            provider: providerConfig.name
          }
        });
      }

      sendJSON(res, 200, result);
    });
  });
}

function handleGenerateDocx(req, res) {
  let body = '';
  req.on('data', c => body += c);
  req.on('end', async () => {
    try {
      const data = JSON.parse(body);
      console.log('[' + new Date().toLocaleTimeString() + '] 生成docx: ' + data.type + ' | 图片数: ' + (data.images||[]).length + ' | 人员数: ' + (data.info?.team_members||[]).length);
      const buffer = data.type === 'overview' ? await buildOverviewDocx(data) : await buildDesignDocx(data);
      const fname = data.type === 'overview' ? '%E8%BD%AF%E4%BB%B6%E6%A6%82%E8%BF%B0.docx' : '%E8%AE%BE%E8%AE%A1%E8%AF%B4%E6%98%8E%E4%B9%A6.docx';
      res.writeHead(200, {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename*=UTF-8\'\'' + fname,
        'Access-Control-Allow-Origin': '*',
        'Content-Length': buffer.length,
      });
      res.end(buffer);
      console.log('[' + new Date().toLocaleTimeString() + '] ✓ docx生成 ' + buffer.length + ' bytes');
    } catch(e) {
      console.error('生成docx失败:', e);
      res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ error: e.message }));
    }
  });
}

// ═══════════════════════════════════════════════════════════════
// 生成软件概述和设计说明书的函数
// ═══════════════════════════════════════════════════════════════

async function buildOverviewDocx(data) {
  const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
          AlignmentType, WidthType, ShadingType, PageBreak, HeaderFooterType } = require('docx');

  const info = data.info || {};
  const images = data.images || [];
  const softwareName = info.software_name || '软件概述';

  function fieldRow(label, value) {
    return new TableRow({
      children: [
        new TableCell({
          borders: makeBorder(), width: { size: 3200, type: WidthType.DXA },
          shading: { fill: 'F2F2F2', type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: String(label||''), bold: true, size: 22, font: '宋体' })] })]
        }),
        new TableCell({
          borders: makeBorder(), width: { size: 6800, type: WidthType.DXA },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: String(value||''), size: 22, font: '宋体' })] })]
        })
      ]
    });
  }

  const fields = [
    ['软件全称', info.software_name],
    ['版本号', info.version],
    ['开发者', info.developer],
    ['开发完成日期', info.completion_date],
    ['首次发表日期', info.publish_date],
    ['首次发表地点', info.publish_location],
    ['开发目的', info.purpose],
    ['主要功能', info.main_features],
    ['编程语言', info.programming_langs],
    ['源程序量', info.source_lines ? info.source_lines + ' 行' : ''],
    ['开发操作系统', info.dev_os],
    ['开发工具', info.dev_tools],
    ['运行平台', info.run_platform],
    ['运行环境', info.runtime_env],
    ['开发硬件环境', info.dev_hardware],
    ['技术架构', info.architecture],
    ['面向领域', info.industry],
  ];

  const bodyChildren = [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 1200, after: 600 }, children: [new TextRun({ text: softwareName, bold: true, size: 48, font: '宋体' })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 800 }, children: [new TextRun({ text: '软件概述', bold: true, size: 40, font: '宋体' })] }),
    new Paragraph({ spacing: { after: 400 }, children: [] }),
    new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: fields.map(f => fieldRow(f[0], f[1])) }),
  ];

  if (images.length > 0) {
    bodyChildren.push(new Paragraph({ spacing: { before: 400, after: 200 }, children: [new TextRun({ text: '软件界面截图', bold: true, size: 24, font: '宋体' })] }));
    for (const img of images.slice(0, 5)) {
      const caption = img.section ? img.section.replace(/^[\d\.\、\s]+/, '').slice(0, 40) : '界面截图';
      bodyChildren.push(...makeImagePara(img, caption));
    }
  }

  const pageProps = { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1800 } } };
  const emptyHF = makeEmptyHeaderFooter();
  const docHeader = makeDocHeader(softwareName);

  const doc = new Document({
    features: { updateFields: true },
    styles: {
      paragraphStyles: [
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 32, bold: true, font: '宋体' }, paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 26, bold: true, font: '宋体' }, paragraph: { spacing: { before: 280, after: 140 }, outlineLevel: 1 } },
      ]
    },
    sections: [
      {
        properties: {
          ...pageProps,
          headers: { default: docHeader },
          footers: { default: emptyHF.footer },
        },
        children: bodyChildren,
      },
    ]
  });
  return Packer.toBuffer(doc);
}

async function buildDesignDocx(data) {
  const { Document, Packer, Paragraph, TextRun, Table, TableRow, AlignmentType,
          HeadingLevel, WidthType, PageBreak } = require('docx');

  const info = data.info || {};
  const images = data.images || [];
  const aiContent = data.content || '';

  console.log('[调试] aiContent 长度:', aiContent.length);

  const members = info.team_members || [];
  const validMembers = members.filter(m => m.name && m.name.trim() && m.name !== '待填写');
  const memberWidths = [1500, 2500, 2000, 2000, 2000];
  const memberRows = [
    new TableRow({ children: ['姓名','项目组职务','参与时间','研究阶段','开发阶段'].map((h,i) => makeHeaderCell(h, memberWidths[i])) }),
    ...(validMembers.length > 0 
      ? validMembers.map(m => new TableRow({ children: [m.name||'', m.role||'', m.period||'', m.research||m.period||'', m.dev||m.period||''].map((v,i) => makeDataCell(v, memberWidths[i])) }))
      : [new TableRow({ children: ['','','','',''].map((v,i) => makeDataCell('', memberWidths[i])) })]
    )
  ];

  const modules = (info.main_features||'').split('\n').filter(l=>l.trim()).slice(0,10);
  const goalRows = [
    new TableRow({ children: ['序号','名称','功能'].map((h,i) => makeHeaderCell(h,[1000,2800,6200][i])) }),
    ...modules.map((mod,i) => {
      const clean = mod.replace(/^[\d\.\-\*①-⑩、]+/,'').trim();
      const parts = clean.split(/[：:]/);
      const name = (parts[0]||'').trim() || ('功能'+(i+1));
      const desc = (parts[1]||clean).trim();
      return new TableRow({ children: [makeDataCell(i+1,1000), makeDataCell(name,2800), makeDataCell(desc,6200)] });
    })
  ];

  function textSimilarity(a, b) {
    if (!a || !b) return 0;
    a = a.replace(/[\s\d\.\、\#\*]+/g, '').toLowerCase();
    b = b.replace(/[\s\d\.\、\#\*]+/g, '').toLowerCase();
    if (!a || !b) return 0;
    if (a === b) return 1;
    if (a.includes(b) || b.includes(a)) return 0.8;
    let common = 0;
    const shorter = a.length < b.length ? a : b;
    const longer = a.length < b.length ? b : a;
    for (const ch of shorter) {
      if (longer.includes(ch)) common++;
    }
    return common / Math.max(a.length, b.length);
  }

  function findNearestHeading(lines, lineIndex) {
    for (let i = lineIndex; i >= 0; i--) {
      const t = lines[i].trim();
      if (/^#{1,3}\s/.test(t)) return t.replace(/^#+\s*/, '');
      if (/^[\d]+[\.\、]/.test(t) && t.length < 60) return t.replace(/^[\d]+[\.\、]\s*/, '');
    }
    return '';
  }

  function matchImagesToPlaceholders(lines, images, archImg) {
    const placeholders = [];
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      const wireframeMatch = trimmed.match(/^\[WIREFRAME(?::(.+))?\]$/);
      if (wireframeMatch || trimmed === '[ARCHITECTURE_IMAGE]') {
        const heading = findNearestHeading(lines, i);
        const explicitName = wireframeMatch ? (wireframeMatch[1] || '').trim() : '';
        placeholders.push({ 
          lineIndex: i, 
          type: wireframeMatch ? '[WIREFRAME]' : trimmed, 
          heading: explicitName || heading
        });
      }
    }

    const usedImageIndices = new Set();
    const mapping = {};

    let archImgIndex = -1;
    if (archImg) {
      archImgIndex = images.findIndex(img => img.name === archImg.name && img.from === archImg.from);
    }

    for (const ph of placeholders) {
      if (ph.type === '[ARCHITECTURE_IMAGE]' && archImgIndex >= 0) {
        mapping[ph.lineIndex] = { img: images[archImgIndex], caption: '产品功能架构图' };
        usedImageIndices.add(archImgIndex);
      }
    }

    const wireframePhs = placeholders.filter(ph => ph.type === '[WIREFRAME]');
    let wireframeIndex = 0;

    for (const ph of wireframePhs) {
      if (!ph.heading) continue;
      
      let bestMatch = { index: -1, similarity: 0 };
      for (let i = 0; i < images.length; i++) {
        if (usedImageIndices.has(i)) continue;
        const img = images[i];
        if (!img.section) continue;
        
        const sim = textSimilarity(ph.heading, img.section);
        if (sim > bestMatch.similarity) {
          bestMatch = { index: i, similarity: sim };
        }
      }
      
      if (bestMatch.index >= 0 && bestMatch.similarity > 0.5) {
        const img = images[bestMatch.index];
        const caption = img.section ? img.section.replace(/^[\d\.\、\s]+/, '').slice(0, 40) : (ph.heading || '界面示意图');
        mapping[ph.lineIndex] = { img, caption };
        usedImageIndices.add(bestMatch.index);
      }
    }

    for (const ph of wireframePhs) {
      if (mapping[ph.lineIndex]) continue;
      
      while (wireframeIndex < images.length && usedImageIndices.has(wireframeIndex)) {
        wireframeIndex++;
      }
      if (wireframeIndex < images.length) {
        const img = images[wireframeIndex];
        const caption = img.section ? img.section.replace(/^[\d\.\、\s]+/, '').slice(0, 40) : (ph.heading || '界面示意图');
        mapping[ph.lineIndex] = { img, caption };
        usedImageIndices.add(wireframeIndex);
        wireframeIndex++;
      }
    }

    const unmatchedImgs = images.filter((img, idx) => !usedImageIndices.has(idx));
    return { mapping, unmatchedImgs };
  }

  const archImg = images.find(img => img.section && (img.section.includes('架构') || img.section.includes('功能模块') || img.section.includes('产品功能')));
  const wireframeImgs = images.filter(img => img !== archImg);

  function cleanMarkdown(txt) {
    return (txt || '').replace(/\*\*/g, '').replace(/\*/g, '').replace(/`/g, '').trim();
  }

  function contentToParasWithImages(text, images) {
    const lines = (text||'').split('\n');
    const { mapping, unmatchedImgs } = matchImagesToPlaceholders(lines, images, archImg);
    const result = [];
    let skipTocSection = false;
    
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      
      if (/^\[WIREFRAME(?::.+)?\]$/.test(trimmed) || trimmed === '[ARCHITECTURE_IMAGE]') {
        if (mapping[i]) {
          result.push(...makeImagePara(mapping[i].img, mapping[i].caption));
        }
        continue;
      }
      
      if (!trimmed) {
        if (!skipTocSection) {
          result.push(new Paragraph({ spacing: { after: 60 }, children: [] }));
        }
        continue;
      }
      
      if (/^#{1,3}\s/.test(trimmed)) {
        const title = cleanMarkdown(trimmed.replace(/^#+\s/, ''));
        const lvl = trimmed.startsWith('###') ? 3 : trimmed.startsWith('##') ? 2 : 1;
        
        if (title.includes('目录')) {
          skipTocSection = true;
          continue;
        }
        if (skipTocSection && lvl === 2) {
          skipTocSection = false;
        }
        if (!skipTocSection) {
          result.push(makeHeading(title, lvl));
        }
      } else if (!skipTocSection) {
        if (/^[-\*•]\s/.test(trimmed)) {
          result.push(new Paragraph({ bullet: { level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: cleanMarkdown(trimmed.replace(/^[-\*•]\s/, '')), size: 22, font: '宋体' })] }));
        } else if (/^\d+\.\s/.test(trimmed)) {
          result.push(new Paragraph({ numbering: { reference: 'default', level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: cleanMarkdown(trimmed.replace(/^\d+\.\s/, '')), size: 22, font: '宋体' })] }));
        } else {
          result.push(makePara(cleanMarkdown(trimmed)));
        }
      }
    }
    
    return { paragraphs: result, unmatchedImgs };
  }

  const { paragraphs: requirementChildren, unmatchedImgs } = contentToParasWithImages(aiContent, wireframeImgs);

  if (unmatchedImgs.length > 0) {
    requirementChildren.push(makePara(''));
    requirementChildren.push(makeHeading('附录：其他界面截图', 2));
    for (const img of unmatchedImgs) {
      const caption = img.section ? img.section.replace(/^[\d\.\、\s]+/, '').slice(0, 40) : '界面示意图';
      requirementChildren.push(...makeImagePara(img, caption));
    }
  }

  const { HeaderFooterType, PageNumberFormat } = require('docx');
  const softwareName = info.software_name || '设计说明书';
  const pageProps = { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1800 } } };
  const emptyHF = makeEmptyHeaderFooter();
  const docHeader = makeDocHeader(softwareName);

  function generateTocFromContent(content) {
    const lines = (content || '').split('\n');
    const tocItems = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      const cleanTitle = (t) => t.replace(/\*\*/g, '').replace(/\*/g, '').replace(/`/g, '').trim();
      
      if (/^##\s/.test(trimmed) && !/^###/.test(trimmed)) {
        const title = cleanTitle(trimmed.replace(/^##\s*/, ''));
        if (title && !title.includes('目录')) {
          tocItems.push({ level: 2, title });
        }
      }
      else if (/^###\s/.test(trimmed)) {
        const title = cleanTitle(trimmed.replace(/^###\s*/, ''));
        if (title) {
          tocItems.push({ level: 3, title });
        }
      }
    }
    
    return tocItems;
  }

  const tocItems = generateTocFromContent(aiContent);

  const seenTitles = new Set();
  const uniqueTocItems = [];
  for (const item of tocItems) {
    const key = item.level + '|' + item.title;
    if (!seenTitles.has(key)) {
      seenTitles.add(key);
      uniqueTocItems.push(item);
    }
  }

  const coverChildren = [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 3000, after: 600 }, children: [new TextRun({ text: softwareName, bold: true, size: 48, font: '宋体' })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 800 }, children: [new TextRun({ text: '设计说明书', bold: true, size: 40, font: '宋体' })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: info.developer||'', size: 26, font: '宋体' })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: info.completion_date||'', size: 24, font: '宋体' })] }),
  ];

  const tocChildren = [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 400 }, children: [new TextRun({ text: '目录', bold: true, size: 32, font: '宋体' })] }),
  ];

  if (uniqueTocItems.length === 0) {
    tocChildren.push(new Paragraph({
      spacing: { after: 120 },
      children: [new TextRun({ text: '（目录内容将在正文中展示）', size: 22, font: '宋体', color: '999999' })]
    }));
  } else {
    uniqueTocItems.forEach(item => {
      tocChildren.push(new Paragraph({
        spacing: { after: 120 },
        indent: { left: item.level === 3 ? 400 : 0 },
        children: [new TextRun({ text: item.title, size: item.level === 2 ? 24 : 22, font: '宋体', bold: item.level === 2 })]
      }));
    });
  }

  const doc = new Document({
    features: { updateFields: true },
    styles: {
      paragraphStyles: [
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 32, bold: true, font: '宋体' }, paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 26, bold: true, font: '宋体' }, paragraph: { spacing: { before: 280, after: 140 }, outlineLevel: 1 } },
        { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 24, bold: true, font: '宋体' }, paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 } },
      ]
    },
    sections: [
      {
        properties: {
          ...pageProps,
          headers: { ["default"]: emptyHF.header },
          footers: { ["default"]: emptyHF.footer },
        },
        children: coverChildren,
      },
      {
        properties: {
          ...pageProps,
          headers: { default: docHeader },
          footers: { default: emptyHF.footer },
        },
        children: tocChildren,
      },
      {
        properties: {
          ...pageProps,
          page: {
            ...pageProps.page,
            pageNumbers: { start: 1 },
          },
          headers: { default: docHeader },
          footers: { default: emptyHF.footer },
        },
        children: requirementChildren,
      },
    ]
  });
  return Packer.toBuffer(doc);
}

// ═══════════════════════════════════════════════════════════════
// HTTP 服务器
// ═══════════════════════════════════════════════════════════════

const server = http.createServer((req, res) => {

  if (req.method === 'OPTIONS') {
    handleCORS(req, res);
    res.writeHead(204);
    res.end();
    return;
  }

  // API 测试端点
  if (req.url === '/api/test' && req.method === 'POST') {
    handleCORS(req, res);
    return handleTestAPI(req, res);
  }

  // 聊天 API 端点
  if (req.url === '/api/chat' && req.method === 'POST') {
    handleCORS(req, res);
    return handleChatAPI(req, res);
  }

  // 旧的 /proxy 端点（向后兼容）
  if (req.url === '/proxy' && req.method === 'POST') {
    handleCORS(req, res);
    return handleChatAPI(req, res);
  }

  // 生成 docx 端点
  if (req.url === '/generate-docx' && req.method === 'POST') {
    return handleGenerateDocx(req, res);
  }

  // 静态文件服务
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    if (!fs.existsSync(HTML_FILE)) { 
      res.writeHead(404); 
      res.end('找不到秒著.html'); 
      return; 
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(fs.readFileSync(HTML_FILE, 'utf-8'));
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log('\n  🌋 秒著 v5 (多模型适配版) 已启动');
  console.log('  ──────────────────────────────────');
  console.log('  👉 http://localhost:' + PORT);
  console.log('  ──────────────────────────────────');
  console.log('  · 支持: 火山引擎、DeepSeek、智谱GLM、Kimi、MiniMax');
  console.log('  · 按 Ctrl+C 停止\n');
});

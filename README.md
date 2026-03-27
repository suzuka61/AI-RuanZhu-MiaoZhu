# 秒著 - AI软著材料生成工具

## 🎯 产品简介

秒著是一款基于AI的软件著作权申请材料自动生成工具，支持一键生成软件概述和设计说明书。

## ✨ 主要功能

- 🆓 **免费模型**：Step 3.5 Flash 完全免费，无需配置API Key
- 🤖 多AI模型支持（火山引擎、DeepSeek、智谱GLM、Kimi、MiniMax）
- 📄 自动提取文档信息
- 📝 生成规范的软著申请材料
- 🖼️ 自动提取并嵌入图片
- 📊 智能目录生成
- 🔒 安全的API Key管理
- ✨ **流式输出**：实时预览生成内容，降低等待焦虑
- 📊 **字数统计**：实时显示生成内容的字数
- ⏱️ **预估时间**：显示预估剩余时间

## 🚀 快速开始

### 方式一：直接运行（开发者模式）

1. **安装依赖**
```bash
npm install
```

2. **启动应用**
```bash
npm start
```

3. **访问应用**
打开浏览器访问：http://localhost:3000

### 方式二：打包成桌面应用（推荐）

1. **安装依赖**
```bash
npm install
```

2. **打包应用**

**macOS:**
```bash
npm run build:mac
```

**Windows:**
```bash
npm run build:win
```

**Linux:**
```bash
npm run build:linux
```

3. **运行打包后的应用**
- macOS: 在 `dist` 目录找到 `秒著.dmg`，双击安装
- Windows: 在 `dist` 目录找到 `秒著 Setup.exe`，双击安装
- Linux: 在 `dist` 目录找到 `秒著.AppImage`，双击运行

## 🔑 获取API Key

### Step 3.5 Flash (免费模型) ✨ 推荐
- **免费**：Step 3.5 Flash 完全免费
- **注册 OpenRouter**：<a href="https://openrouter.ai/stepfun/step-3.5-flash:free/api" target="_blank">点击获取免费密钥</a>
- **模型**：Step 3.5 Flash (256K上下文)
- **费用**：完全免费

### 火山引擎方舟
1. 访问：https://www.volcengine.com/
2. 注册并登录
3. 开通方舟服务
4. 获取API Key

### DeepSeek
1. 访问：https://www.deepseek.com/
2. 注册并登录
3. 获取API Key

### 智谱GLM
1. 访问：https://open.bigmodel.cn/
2. 注册并登录
3. 获取API Key

### 月之暗面 Kimi
1. 访问：https://www.moonshot.cn/
2. 注册并登录
3. 获取API Key

### MiniMax
1. 访问：https://www.minimax.chat/
2. 注册并登录
3. 获取API Key

## 🔒 安全说明

### API Key 安全
- ✅ API Key 仅在当前会话中使用
- ✅ 不会保存到本地存储
- ✅ 关闭应用后自动清除
- ✅ 不会上传到任何服务器

### 使用建议
- 🔐 请勿在公共电脑上保存API Key
- 🔄 建议定期更换API Key
- 💡 使用完毕后及时关闭应用
- 🚫 不要分享您的API Key给他人

## 📖 使用指南

### 第一步：配置模型
1. 选择AI提供商
   - **Step 3.5 Flash (免费)**：输入您注册的 OpenRouter API 密钥
   - **其他模型**：输入API Key
2. 点击"测试连接"验证
3. 点击"保存并继续"

![首页](https://github.com/suzuka61/AI-MiaoZhu/blob/4da5ceb8c220c5e0ebf8798974ffd087ebe76434/%E8%BD%AF%E4%BB%B6%E7%95%8C%E9%9D%A2/1.%E9%A6%96%E9%A1%B5.jpg)

### 第二步：上传文件
1. 上传项目文档（支持.doc, .docx, .pdf）
2. 或直接粘贴文档内容
3. 点击"AI提取信息"

![上传文件](https://github.com/suzuka61/AI-MiaoZhu/blob/4da5ceb8c220c5e0ebf8798974ffd087ebe76434/%E8%BD%AF%E4%BB%B6%E7%95%8C%E9%9D%A2/2.%E7%AC%AC%E4%BA%8C%E9%A1%B5%E4%B8%8A%E4%BC%A0%E6%96%87%E4%BB%B6.jpg)

### 第三步：确认信息
1. 核对提取的信息
2. 手动修改错误信息
3. 点击"生成软著材料"

![确认信息](https://github.com/suzuka61/AI-MiaoZhu/blob/4da5ceb8c220c5e0ebf8798974ffd087ebe76434/%E8%BD%AF%E4%BB%B6%E7%95%8C%E9%9D%A2/3.%E7%AC%AC%E4%B8%89%E9%A1%B5%E7%A1%AE%E8%AE%A4%E4%BF%A1%E6%81%AF%E9%A1%B5.jpg)

### 第四步：生成中
实时预览生成进度，预估剩余时间

![生成中](https://github.com/suzuka61/AI-MiaoZhu/blob/4da5ceb8c220c5e0ebf8798974ffd087ebe76434/%E8%BD%AF%E4%BB%B6%E7%95%8C%E9%9D%A2/4.%E7%AC%AC%E5%9B%9B%E9%A1%B5%E7%94%9F%E6%88%90%E4%B8%AD.jpg)

### 第五步：下载文档
1. 查看生成的材料
2. 下载软件概述.docx
3. 下载设计说明书.docx

![生成结果](https://github.com/suzuka61/AI-MiaoZhu/blob/4da5ceb8c220c5e0ebf8798974ffd087ebe76434/%E8%BD%AF%E4%BB%B6%E7%95%8C%E9%9D%A2/5.4.%E7%AC%AC%E4%BA%94%E9%A1%B5%E7%94%9F%E6%88%90%E7%BB%93%E6%9E%9C.jpg)

## 📄 文档说明

### 软件概述
包含软件基本信息、开发环境、主要功能等

### 设计说明书
包含项目背景、需求分析、系统设计、功能模块等，自动生成目录和页码

## ⚠️ 注意事项

### 重要提示与免责声明

**请务必仔细阅读以下内容：**

1. **仅供学习参考**
   - 本工具生成的文档内容仅供参考和学习使用
   - 不构成任何法律建议或专业意见
   - 不得用于任何违法用途

2. **人工核对必需**
   - 生成的文档必须经过人工审核和修改
   - 确保内容真实、准确、完整后再提交使用
   - 核对所有信息，特别是软件名称、版本号、开发日期等关键信息

3. **责任声明**
   - 用户对使用本工具生成的文档内容负全部责任
   - 开发者不对因使用本工具而产生的任何直接或间接损失承担责任
   - 使用本工具即表示您已理解并同意本声明

4. **合规提示**
   - 软件著作权申请材料需符合国家版权局的相关规定
   - 请务必核实生成内容的合规性
   - 建议咨询专业人士或知识产权代理机构

### 文档格式

1. **文档格式**
   - 支持 .doc, .docx, .pdf 格式
   - 单个文件最大 10MB
   - 建议上传包含完整项目信息的文档

2. **图片提取**
   - 自动提取文档中的图片
   - 图片会嵌入到生成的文档中
   - 建议上传包含界面截图的文档

3. **目录更新**
   - 生成的文档包含自动目录
   - 打开文档后按提示更新字段
   - Windows: Ctrl+A → F9
   - Mac: Cmd+A → Fn+F9

## 🛠️ 技术栈

- **前端**: HTML5, CSS3, JavaScript
- **后端**: Node.js, Express
- **桌面应用**: Electron
- **文档生成**: docx.js
- **AI集成**: 多模型API

## 📝 开发说明

### 项目结构
```
软著生成器/
├── 秒著.html          # 主页面
├── proxy.js           # 后端代理服务
├── main.js            # Electron主进程
├── package.json       # 项目配置
└── README.md          # 使用说明
```

### 开发命令
```bash
# 安装依赖
npm install

# 启动开发模式
npm start

# 打包应用
npm run build

# 打包特定平台
npm run build:mac
npm run build:win
npm run build:linux
```

## 📞 支持

如有问题或建议，请联系开发者。

## 📄 许可证

MIT License

---

**秒著** - 让软著申请更简单 🚀

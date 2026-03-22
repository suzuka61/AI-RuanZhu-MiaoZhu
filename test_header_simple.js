const { Document, Header, Paragraph, TextRun, Packer } = require('docx');
const fs = require('fs');

// 测试1: 使用属性名 default（不是字符串）
const header = new Header({
  children: [
    new Paragraph({
      children: [new TextRun({ text: '测试页眉', size: 20 })]
    })
  ]
});

const doc = new Document({
  sections: [{
    properties: {
      headers: {
        default: header  // 注意：这里是属性名 default，不是字符串 "default"
      }
    },
    children: [
      new Paragraph({ children: [new TextRun('正文内容')] })
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('/tmp/test_header_result.docx', buffer);
  console.log('✓ 测试文档已生成: /tmp/test_header_result.docx');
  console.log('  文件大小:', buffer.length, 'bytes');
}).catch(err => {
  console.error('✗ 生成失败:', err);
});

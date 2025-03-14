const fs = require('fs')
const path = require('path')

type CharObjectItem = {
  zhChar: string;
  explain?: string;
}
type CharObject = {
  [ipa: string]: {
    [tone: string]: CharObjectItem[]
  }
}

// 优化后的parseTSV函数核心部分
function parseTSV(content): CharObject {
  const result: CharObject = {}
  let currentYun = ''

  const lines = content.split('\n')

  lines.forEach(line => {
    line = line.trim()
    if (!line) return

    if (line.startsWith('#')) {
      currentYun = line.slice(1).trim()
      return
    }

    const [shengmu, content] = line.split('\t')
    if (!shengmu || !content) return

    const fullKey = shengmu + currentYun
    result[fullKey] = result[fullKey] || {}

    // 优化后的解析逻辑
    let lastPos = 0
    const toneMatches: any = Array.from(content.matchAll(/\[(\d+)\]/g))

    toneMatches.forEach((match, index) => {
      const tone = match[1]
      const start = match.index + match[0].length
      const end = toneMatches[index + 1]?.index || content.length

      const segment = content.slice(start, end)
      const items: CharObjectItem[] = []
      let buffer = ''
      let inExplain = false

      for (const char of segment) {
        if (char === '{') {
          inExplain = true
          continue
        } else if (char === '}') {
          const lastItem = items[items.length - 1]
          if (lastItem) {
            lastItem.explain = buffer
          }
          buffer = ''
          inExplain = false
          continue
        }

        if (inExplain) {
          buffer += char
        } else {
          if (/[\[\]]/.test(char)) continue
          if (char.match(/[\d\s]/)) continue  // 跳过数字和空白

          if (char !== ' ') {
            items.push({ zhChar: char })
          }
        }
      }

      result[fullKey][tone] = items
    })
  })

  return result
}

// 文件路径
const inputPath = path.join(__dirname, '../../refer/杭州五杭.origin.tsv')
const outputPath = path.join(__dirname, './output.json')

// 读取文件并解析
try {
  const data = fs.readFileSync(inputPath, 'utf-8')
  const result = parseTSV(data)

  // 写入文件
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8')
  console.log('解析完成，结果已保存至 output.json')
  saveTsv(
    result,
    '../../refer/杭州五杭.tsv'
  )
} catch (err) {
  console.error('处理文件时出错:', err)
}

export function saveTsv(data: CharObject, fileName: string) {
  // 定义 TSV 文件的路径
  const outputFilePath = path.join(__dirname,  fileName);

  // 将 JSON 数组转换为 TSV 格式字符串
  const tsvData = Object.keys(data).map(ipa => {
    const tones = Object.keys(data[ipa])

    return tones.map(tone => {
      const charItemList = data[ipa][tone]
      const charExplainString = charItemList.map(charItem => {
        return charItem.zhChar + (
          charItem.explain ? `[${charItem.explain}]` : ''
        )
      }).join('')
      return ipa + '\t' + tone + '\t' + charExplainString
      
    })
  }).flat().join('\n')
  console.log('🍓', tsvData)
  // const tsvData = [
  //   // headers.join('\t'), // 添加表头行
  //   ...data
  //   // .map((row) => headers.map((header) => row[header]).join("\t")), // 添加数据行
  // ].join("\n");

  // 写入 TSV 文件
  fs.writeFile(outputFilePath, tsvData, (err) => {
    if (err) {
      console.error("Error writing file:", err.message);
    } else {
      console.log("File has been saved as", outputFilePath);
    }
  });
}

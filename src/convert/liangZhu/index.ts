import path from 'path';
import liangZhuJSON from '../../../refer/余杭良渚.json'
import fs from 'fs'



const ToneMap = {
  44: 1, // 多
  22: 2, // 鹅
  53: 3, // 左
  243: 4, // 柱
  423: 5, // 破
  213: 6, // 大
  5: 7, // 可
  2: 8, // 鼻
}

type CharItem = {
  char: string;
  // ipa: string;
  initial: string;
  final: string;
  tone: string;
}



let otherList: any[] = []
const liangZhuList: CharItem[] = liangZhuJSON
  .map(ele => {
    // return {
    //   syllable: ele.syllable,
    //   remark: ele.remark,
    //   records: ele.records,
    // }
    return ele.records.map(item => ({
      name: ele.name,
      initial: item.initial,
      finals: item.finals,
      tone: item.tone,
    }))
  })
  .flat()
  .filter(ele => {
    const _tone = ToneMap[ele.tone]
    if (!_tone) {
      otherList.push(ele)
    } else {
      ele.tone = _tone
    }
    return !!_tone
  })
  .map(ele => {
    return {
      char: ele.name,
      // ipa: ele.initial + ele.finals,
      initial: ele.initial,
      final: ele.finals,
      tone: ele.tone
    }
  })

const liangZhuObject = liangZhuList.reduce((ret, val) => {
  // if (!ret[val.ipa]) {
  //   ret[val.ipa] = {
  //     [val.tone]: val.char
  //   }
  // } else if (ret[val.ipa] && !ret[val.ipa][val.tone]) {
  //   ret[val.ipa][val.tone] = val.char
  // } else if (ret[val.ipa] && ret[val.ipa][val.tone]) {
  //   ret[val.ipa][val.tone] += val.char
  // }
  if (!ret[val.final]) {
    ret[val.final] = {
      [val.initial]: {
        [val.tone]: val.char
      }
    }
  } else if (ret[val.final] && !ret[val.final][val.initial]) {
    ret[val.final][val.initial] = {
      [val.tone]: val.char
    }
  } else if (ret[val.final] && ret[val.final][val.initial] && !ret[val.final][val.initial][val.tone]) {
    ret[val.final][val.initial][val.tone] = val.char
  } else if (ret[val.initial] && ret[val.final][val.initial] && ret[val.final][val.initial][val.tone]) {
    ret[val.final][val.initial][val.tone] += val.char
  }
  return ret
}, {})



console.log(
  "语保良渚字数：", liangZhuList,
)
console.log(
  "不在声调映射Map上的字：", otherList,
)

saveTsv(liangZhuObject, '../../../result/余杭良渚.tsv')

console.log('liangZhuObject', liangZhuObject)

export function saveTsv(data: Object, fileName: string) {
  // 定义 TSV 文件的路径
  const outputFilePath = path.join(__dirname, fileName);

  //  // 将 JSON 数组转换为 TSV 格式字符串
  //  const tsvData = Object.keys(data).map(initial => {
  //   const finals = Object.keys(data[initial])

  //   return finals.map(final => {
  //     const tones = Object.keys(data[initial][final] )

  //     return tones.map(tone => {
  //       const charString = data[initial][final][tone]

  //       return initial+final + '\t' + tone + '\t' + charString

  //     })

  //   })
  // }).flat().flat().join('\n')


  // 将 JSON 数组转换为 TSV 格式字符串
  const tmpData: any[] = [];
  const tmpData2: any[] = [];
  Object.keys(data).forEach(final => {
    const initials = Object.keys(data[final])

    initials.forEach(initial => {
      const tones = Object.keys(data[final][initial])

      tones.forEach(tone => {
        const charString = data[final][initial][tone]

        // tsvData.push(initial + final + '\t' + tone + '\t' + charString)
        if (final.includes('ʔ')) {
          tmpData2.push({
            initial,
            final,
            tone,
            charString
          })
        } else {
          tmpData.push({
            initial,
            final,
            tone,
            charString
          })
        }
        

      })

    })
  })
  const tsvData = [
    ...tmpData,
    ...tmpData2
  ].map(ele => {
    return ele.initial + ele.final + '\t' + ele.tone + '\t' + ele.charString
  })
  

  // 写入 TSV 文件
  fs.writeFile(outputFilePath, tsvData.flat().flat().join('\n'), (err) => {
    if (err) {
      console.error("Error writing file:", err.message);
    } else {
      console.log("File has been saved as", outputFilePath);
    }
  });
}

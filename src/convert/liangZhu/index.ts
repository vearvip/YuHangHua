import liangZhuJSON from '../../../refer/余杭良渚.json'

const liangZhuList = liangZhuJSON.map(ele => {
  return {
    syllable: ele.syllable,
    remark: ele.remark,
    records: ele.records,
  }
})

console.log(
  "语保良渚字数：", liangZhuList.length
)

let list = liangZhuList.filter(ele => ele.records.length > 1)

console.log(
  list,
  list.length
)
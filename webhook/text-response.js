const axios = require('axios')

module.exports = class TextResponse {
  constructor(lineClient, context, isDebug) {
    this.client = lineClient
    this.context = context
    this.isDebug = isDebug
  }
  replyMessage(replyToken, message) {
    if(this.isDebug == 'false') {
      this.context.log('TextResponse: send messages to QnA Maker Service')
      // // request to thrid server
      // const url = `https://yuqingguan.top/text/${messages.text}`
      // axios.get(url)
      //   .then(res => {
      //     const replyText = res.data
      //     const reply = {
      //       type: 'text',
      //       text: replyText
      //     }
      //     return this.client.replyMessage(replyToken, reply)
      //   })
      // request to Auzre QnA Maker
      const url = 'https://hokkoriai-qna.azurewebsites.net/qnamaker/knowledgebases/7a05a644-aacc-4177-b3af-73f3d249fe8f/generateAnswer',
        data = {question: message.text},
        config = {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'EndpointKey 0c088b78-4811-4565-b452-d121ae9075b1'
          },
        }
      axios.post(url, data, config)
        .then(res => {
          // this.context.log(res.data)
          // const reply = {
          //   type: 'text',
          //   text: res.data.answers[0].answer
          // }
          const data = res.data.answers[0].answer
          this.context.log(data)
          const replyList = []
          let temp = 0,
            flag = 0
          for(let i=0;i<data.length;i++) {
            const d = data[i]
            temp += d
            if(d=='。'&&flag==1) {
              replyList.push(temp)
              temp = ''
              flag = 0
              continue
            }
            if(d=='。'&&flag==0){
              flag += 1
            }
          }
          const reply = replyList.map(d => {
            return {type: 'text',text: d}
          })
          return this.client.replyMessage(replyToken, reply)
        })
        .catch(err => {this.context.log(`axios post error: ${err}`)})
    }
    else {
      return Promise.resolve(null)
    }
  }
}

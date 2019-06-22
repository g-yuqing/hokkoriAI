const axios = require('axios')

class QnaMaker {
    constructor(context) {
        this.context = context
    }

    async GetQnaAnswer(text) {
        const
        url = 'https://hokkoriai-qna.azurewebsites.net/qnamaker/knowledgebases/7a05a644-aacc-4177-b3af-73f3d249fe8f/generateAnswer',
        data = { question: text, top: 2, scoreThreshold: 40 },
        config = {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'EndpointKey 0c088b78-4811-4565-b452-d121ae9075b1'
          },
        }
        try {
            const res = await axios.post(url, data, config)
            return res
        } catch (err) {
            this.context.log(`[GetQnaAnswer] axios post error: ${err}`)
        }
    }

    GenerateSelection(answers) {
        var res = {};
        res.type = "template";
        res.altText = "質問を選んでね";

        var template = {};
        template.type = "buttons";
        template.title = "質問を選んでね";
        template.text = "あなたの質問はこの中にある？";

        var actions = answers.map(answer => ({
            type: "postback",
            label: answer.questions[0],
            data: `{"label":"${answer.questions[0]}"}`,
            displayText: answer.questions[0]
          }));

        template.actions = actions;
        res.template = template;

        return res;
    }
}
module.exports = QnaMaker
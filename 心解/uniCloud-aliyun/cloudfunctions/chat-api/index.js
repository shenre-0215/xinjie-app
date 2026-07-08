'use strict'

// Load config from same directory
let _config = null
function loadConfig() {
  if (_config) return _config
  try {
    _config = require('./config.json')
  } catch (e) {
    console.error('[chat-api] Failed to load config.json:', e.message)
    _config = {}
  }
  return _config
}

// Shared DeepSeek API call helper
async function callDeepSeek({ messages, temperature, maxTokens, timeout }) {
  const config = loadConfig()
  const apiKey = config.deepseekApiKey || ''
  const baseUrl = config.deepseekBaseUrl || 'https://api.deepseek.com/chat/completions'
  const model = config.model || 'deepseek-chat'

  if (!apiKey) {
    throw new Error('DeepSeek API key not configured')
  }

  const res = await uniCloud.httpclient.request(baseUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    data: {
      model,
      messages,
      temperature: temperature ?? (config.temperature || 0.8),
      max_tokens: maxTokens ?? (config.maxTokens || 800)
    },
    dataType: 'json',
    timeout: timeout ?? (config.timeout || 20000)
  })
  return res.data || res
}

exports.main = async function (event, context) {
  // Recommend mode: generate 3 worldview recommendations based on existing entries
  if (event.mode === 'recommend') {
    return recommendWorldview(event.worldview || [])
  }
  // Summarize mode: distill thinking-chain content into a 2-6 char keyword
  if (event.mode === 'summarize') {
    return summarizeChain(event.stepContents || [])
  }

  const { messages, suspendBias, delta } = event || {}

  const biasInstruction = suspendBias === 'high'
    ? '你更倾向于建议悬置——只要用户说了 2 轮以上类似内容，就应该温和地问要不要先放一放。'
    : suspendBias === 'low'
      ? '你更愿意继续深入追问，除非用户明显在重复自己超过 5 轮。'
      : '当用户反复说同一件事但没有新的推进（约 3-4 轮），温和地问一句：要不要先放一放？'

  let deltaInstruction = ''
  if (delta !== undefined) {
    if (delta < 0.3) {
      deltaInstruction = '当前对话深度较低，用户可能还在表达表面感受。请用开放式问题鼓励用户多说一点，不要急于下判断。'
    } else if (delta >= 0.3 && delta < 0.6) {
      deltaInstruction = '对话正在深入。注意引导用户从情绪描述转向具体事件，帮助 ta 发现隐藏的矛盾点。'
    } else {
      deltaInstruction = '对话已接近闭合状态。可以适当总结用户提到的关键点，确认是否已经触及核心矛盾，并温和询问是否需要继续。'
    }
  }

  const systemMsg = {
    role: 'system',
    content: `你是"心宝"，帮用户看清自己困惑的思考搭档。

你的风格：温和，简洁，不绕弯。像一个朋友在旁边帮你梳理——不是导师，不是情感热线，也不是答题机器。

你的核心原则：
- 你的工作不是替用户安排，而是帮用户发现 ta 自己早就知道但还没说出来的东西
- 每次回复只做一件事：把一个模糊的感觉变成更清晰的问题。具体问题是用户自己回答的
- 好的回复是"听起来你在意的好像是……对吗？"而不是"你应该先做 X，再做 Y"
- 当用户反复说同一件事没有新的推进，温和地问一句：你觉得现在继续想下去有帮助吗，还是先放一放？
- 不说"辛苦了""你可以的""你需要"这类话；不讲道理；不灌鸡汤
- 回复尽量短，控制在 100 字以内

${biasInstruction}

${deltaInstruction}

当用户表达了明确的核心矛盾（或对话进行了 5 轮以上），在回复末尾附加一行：
【#关键词】
关键词是 2-4 个字，精炼概括这段对话本质的矛盾点。例如：时间焦虑、完美标准、关系撕裂。
这一行不会显示给用户，只用于内部归档。

**悬置建议规则（重要）**：
当你判断用户正在绕圈——反复描述同一困境但没有新的视角或信息出现——且你已经在回复中温和建议了"要不要先放一放"，在回复的最末尾单独加一行标记：
[SUSPEND]
这个标记不会显示给用户。只在确有必要时加，不要每轮都加。`
  }

  if (!messages || !messages.length) {
    return { code: 0, reply: '我是心宝。你有想不通的事，说出来，我帮你理一理——它卡在哪、该现在解决还是先放一放。' }
  }

  try {
    const body = await callDeepSeek({ messages: [systemMsg, ...messages] })

    if (body?.choices?.length) {
      const reply = body.choices[0].message.content.trim()
      // [SUSPEND] marker is preserved in reply — front-end strips it
      return { code: 0, reply }
    }

    return { code: 500, reply: '我的思绪飘了一会儿…我们继续吧。' }
  } catch (e) {
    console.error('[chat-api] error:', e.message || String(e))
    return { code: 500, reply: '我好像走神了，再说一次好吗？' }
  }
}

// Generate 3 worldview recommendations based on user's existing entries
async function recommendWorldview(existing) {
  const prompt = `用户的三观体系已有以下条目：
${existing.map(e => '- ' + e).join('\n')}

根据用户已有的条目，推荐 3 个可以进一步探索的方向。每条推荐包含：
- 一个 2-8 字的标题（像箴言一样简短有力）
- 一句 10-20 字的描述（自然、文艺，不像机器写的）
- 归类到 世相（世界观）、我行（人生观）或心秤（价值观）

返回纯 JSON 数组，不要任何额外文字：
[{"title":"允许一切发生","desc":"看到世界的流动和包容","cat":"shixiang"}, ...]`

  try {
    const body = await callDeepSeek({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.9,
      maxTokens: 400,
      timeout: 15000
    })

    if (body?.choices?.length) {
      const text = body.choices[0].message.content.trim()
      const json = JSON.parse(text.replace(/```json|```/g, '').trim())
      return { code: 0, recs: json }
    }
    return { code: 500, recs: null }
  } catch (e) {
    return { code: 500, recs: null }
  }
}

// Summarize thinking-chain content into a 2-6 char keyword
async function summarizeChain(stepContents) {
  const prompt = `用户完成了 5 步思考链（觉察→拆解→破局→实践→复盘），内容如下：
${stepContents.map((c, i) => `${i + 1}. ${c || '（未填写）'}`).join('\n')}

请用 2-6 个字概括这段思考的本质主题。只返回词，不要任何解释。`

  try {
    const body = await callDeepSeek({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      maxTokens: 20,
      timeout: 10000
    })

    if (body?.choices?.length) {
      const kw = body.choices[0].message.content.trim().replace(/[""''「」『』【】《》、，。！？\s]/g, '').substring(0, 8)
      return { code: 0, keyword: kw || '新的思考' }
    }
    return { code: 500, keyword: '新的思考' }
  } catch (e) {
    return { code: 500, keyword: '新的思考' }
  }
}

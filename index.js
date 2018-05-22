const {
  Wechaty,
  Room

} = require('wechaty')

const qrcodeTerminal = require('qrcode-terminal')
const Tuling123 = require('tuling123-client')
const TULING123_API_KEY = '6d9a34f14b51471596419965037d8094'
const tuling = new Tuling123(TULING123_API_KEY)


const RoomName = "gamepoch测试";

Wechaty.instance() // Singleton
  .on('scan', (url, code) => {
    if (!/201|200/.test(String(code))) {
      const loginUrl = url.replace(/\/qrcode\//, '/l/')
      qrcodeTerminal.generate(loginUrl)
    }
    console.log(`${url}\n[${code}] Scan QR Code in above url to login: `)
  })
  .on('login', user => {
    console.log(`${user} login`)
  })

  .on('friend', async function (contact, request) {
    if (request) {
      await request.accept()
      console.log(`Contact: ${contact.name()} send request ${request.hello}`)
    }
  })

  .on('message', async function (m) {
    const contact = m.from()
    const content = m.content()
    const room = m.room()
    if (room) {
      console.log(`Room: ${room.topic()} Contact: ${contact.name()} Content: ${content}`)
    } else {
      console.log(`Contact: ${contact.name()} Content: ${content}`)
    }

    if (m.self()) {
      return
    }

    // 和机器人进行聊天，输入“你好”就回复以下内容
    if (/你好/.test(content)) {
      m.say("你好哦😯" + content);
    }

    // 在房间中输入room，自动回复“welcome ...”
    // if (/room/.test(content)) {
    //   let keyroom = await Room.find({
    //     topic: RoomName
    //   })
    //   if (keyroom) {
    //     await keyroom.add(contact)
    //     await keyroom.say("欢迎加入!", contact)
    //   }
    // }

    // 在房间中输入out就将人踢出群
    if (/out/.test(content)) {
      let keyroom = await Room.find({
        topic: RoomName

      })
      if (keyroom) {
        await keyroom.say("因为违反群内规定已被踢出此群，请大家遵守群内规定～", contact)
        await keyroom.del(contact)
      }
    } else {
      let keyroom = await Room.find({
        topic: RoomName
      })
      try {
        const reply = await tuling.ask(content, {
          userid: contact
        });
        m.say(reply.text);
      } catch (e) {
        console.log('Bot, on message tuling.ask() exception: %s' + e && e.message || e)
      }
    }

  })
  .start()

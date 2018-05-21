const {
  Wechaty,
  Room

} = require('wechaty')

const qrcodeTerminal = require('qrcode-terminal')

const RoomName = "gamepoch-test";

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

    // 输入hello就回复以下内容
    if (/hello/.test(content)) {
      m.say("hello how are you")
    }

    // 在房间中输入room，自动回复“welcome ...”
    if (/room/.test(content)) {
      let keyroom = await Room.find({
        topic: RoomName
      })
      if (keyroom) {
        await keyroom.add(contact)
        await keyroom.say("welcome!", contact)
      }
    }

    // 在房间中输入out就将人踢出群
    if (/out/.test(content)) {
      let keyroom = await Room.find({
        topic: RoomName

      })
      if (keyroom) {
        await keyroom.say("Remove from the room", contact)
        await keyroom.del(contact)
      }
    }
  })
  .start()

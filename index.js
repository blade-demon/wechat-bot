const { Wechaty, Room } = require("wechaty");

const qrcodeTerminal = require("qrcode-terminal");
const Tuling123 = require("tuling123-client");
const TULING123_API_KEY = "6d9a34f14b51471596419965037d8094";
const tuling = new Tuling123(TULING123_API_KEY);

const RoomName = "gamepoch测试";

const bot = Wechaty.instance();

// 微信用户扫描二维码
bot
  .on("scan", (url, code) => {
    if (!/201|200/.test(String(code))) {
      const loginUrl = url.replace(/\/qrcode\//, "/l/");
      qrcodeTerminal.generate(loginUrl);
    }
    console.log(`${url}\n[${code}] Scan QR Code in above url to login: `);
  })

  // 微信用户登录
  .on("login", user => {
    console.log(`${user} login`);
  })

  // 添加好友
  .on("friend", (contact, request) => {
    let logMsg;
    const fileHelper = bot.Contact.load("filehelper");

    try {
      logMsg = "received `friend` event from " + request.contact().name();
      fileHelper.say(logMsg);
      console.log(logMsg);
    } catch (e) {
      logMsg = e.message;
    }

    console.log(logMsg);
    fileHelper.say(logMsg);
    // if (request) {
    //   let result = await request.accept();
    //   if (result) {
    //     console.log(`Request from ${contact.name} is accepted successfully!`);
    //   } else {
    //     console.log(`Request from ${contact.name} is failed to accept!`);
    //   }
    //   console.log(`Contact: ${contact.name()} send request ${request.hello}`);
    // }
  })

  // 有人加入房间
  .on("room-join", async function(room, inviteeList, inviter) {
    const nameList = inviteeList.map(c => c.name()).join(",");
    console.log(
      `Room ${room.topic()} got new member ${nameList}, invited by ${inviter}`
    );
  })

  // 有人离开房间
  .on("room-leave", async (room, leaverList) => {
    const nameList = leaverList.map(c => c.name()).join(",");
    console.log(`Room ${room.topic()} lost member ${nameList}`);
  })

  // 房间名称被修改
  .on("room-topic", (room, topic, oldTopic, changer) => {
    console.log(
      `Room ${room.topic()} topic changed from ${oldTopic} to ${topic} by ${changer.name()}`
    );
  })

  // 自动消息回复
  .on("message", async function(m) {
    const contact = m.from();
    const content = m.content();
    const room = m.room();
    if (room) {
      console.log(
        `Room: ${room.topic()} Contact: ${contact.name()} Content: ${content}`
      );
    } else {
      console.log(`Contact: ${contact.name()} Content: ${content}`);
    }

    if (m.self()) {
      return;
    }

    // 和机器人进行聊天，输入“你好”就回复以下内容
    if (/你好/.test(content)) {
      m.say("你好哦😯" + content);
    }
    // 在房间中输入out就将人踢出群
    if (/out/.test(content)) {
      let keyroom = await Room.find({
        topic: RoomName
      });
      if (keyroom) {
        await keyroom.say(
          "因为违反群内规定已被踢出此群，请大家遵守群内规定～",
          contact
        );
        await keyroom.del(contact);
      }
    }

    // 如果@ziwei会自动回复信息
    if (/ziwei/.test(content)) {
      let keyroom = await Room.find({
        topic: RoomName
      });
      try {
        const reply = await tuling.ask(content, {
          userid: contact
        });
        m.say(reply.text);
      } catch (e) {
        console.log(
          ("Bot, on message tuling.ask() exception: %s" + e && e.message) || e
        );
      }
    }
  })
  .start()
  .catch(e => {
    log.error("Bot", "init() fail: %s", e);
    bot.stop();
    process.exit(-1);
  });

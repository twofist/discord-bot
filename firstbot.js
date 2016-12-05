const Discord = require("discord.js");
const yt = require('ytdl-core');
const bot = new Discord.Client();



//give out in console how many channels and server and users
bot.on("ready", () => {
    console.log(`Ready to server in ${bot.channels.size} channels on ${bot.guilds.size} servers, for a total of ${bot.users.size} users.`);
});

//greet new user broken
bot.on("guildMemberAdd",(guild, member) => {
	console.log(`New User ${member.user.username} has joined ${guild.name}` );
	guild.defaultChannel.sendMessage(`${member.user.username} has joined this server`);
});


bot.on('message', message => {
  if (message.content.includes('++play')) {
	  const voiceChannel = message.member.voiceChannel;
    if (!voiceChannel) {
      return message.reply(`Please be in a voice channel first!`);
    }
    voiceChannel.join()
      .then(connnection => {
        let stream = yt("https://www.youtube.com/watch?v=d6T8H85y8NU", {audioonly: true});
        const dispatcher = connnection.playStream(stream);
        dispatcher.on('end', () => {
          voiceChannel.leave();
        });
      });
  }
});

//if someone types a message
bot.on("message", msg => {
	//set prefix
	let prefix = "!";
	//only respond if message starts with !
	if(!msg.content.startsWith(prefix)) return;
	//only talk if no other bot talked
	if(msg.author.bot) return;
	//respond if the first word is X
    if (msg.content.startsWith(prefix + "ping")) {
        msg.channel.sendMessage("pong!");
    }
	else if (msg.content.startsWith(prefix + "foo"))
	{
		msg.channel.sendMessage("bar!");
	}
});

// create an event listener for messages
bot.on('message', message => {
  // if the message is "what is my avatar",
  if (message.content.toLowerCase() === 'what is my avatar') {
    // send the user's avatar URL
    message.reply(message.author.avatarURL);
  }
});

//declare object when someone says x answer y
var responseObject = {
  "ayy": "lmao!",
  "wat": "Say what?",
  "lol": "roflmaotntpmp",
  "fuck you": "no you",
  "xd": "hehe xD",
  "XD": "hehe xD",
  "xD": "hehe xD",
  ":c": "don't be sad i'm here for you!",
  "i love you": "i love you too!<3",
  "lenny": "( ͡° ͜ʖ ͡°)",
  "shrug": "¯\_(ツ)_/¯",
  "justright": "✋😩👌",
  "fuck": "(╯°□°）╯︵ ┻━┻",
  "no fuck": "┬──┬﻿ ノ( ゜-゜ノ)",
  "OwO": "http://i2.kym-cdn.com/photos/images/facebook/001/163/262/147.jpg",
  "owo": "http://i2.kym-cdn.com/photos/images/facebook/001/163/262/147.jpg",
  "lewd": "http://i.imgur.com/Kscx9g5.png",
  "Lewd": "http://i.imgur.com/Kscx9g5.png",
  "noticed": "https://www.dramafever.com/st/news/images/Senpai_Title.jpg",
  "calm down": "http://www.relatably.com/m/img/anime-memes/Whoa-dude.-Calm-down.jpg",
};

//when someone says something from the object reply the y
bot.on('message', (message) => {
  if(responseObject[message.content]) {
    message.channel.sendMessage(responseObject[message.content]);
  }
});

//deletes message
bot.on('message', message => {
		if(message.content.toLowerCase().includes("badwords")){
			message.delete()
		.then(msg => console.log(`Deleted message from ${msg.author} ${msg.member.user.username}`));
		//message.channel.sendMessage("No bad!");
		message.reply("no bad!");
		}		
});


//ready message in console when bot is ready
bot.on('ready', () => {
  console.log('I am ready!');
});

//give out any errors in console
bot.on('error', e => { console.error(e); });

//how the bot logins
bot.login("MjU0OTUwMzMyMzE1MDc0NTcz.CyWgkQ.LjOo3NvetRUGDLiRxdC9a_jjhKA");

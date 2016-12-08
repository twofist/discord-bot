const Discord = require("discord.js");
const yt = require('ytdl-core');
const tokens = require('./tokens.json');
const bot = new Discord.Client();
const colors = require('colors');




//give out in console how many channels and server and users
bot.on("ready", () => {
    console.log(`Ready to serve in ${bot.channels.size} channels on ${bot.guilds.size} servers, for a total of ${bot.users.size} users.`.yellow);
});

//music bot no tutorial
let queue = {};

const commands = {
	'play': (msg) => {
		if (queue[msg.guild.id] === undefined) return msg.channel.sendMessage(`Add some songs to the queue first with ${tokens.prefix}add`);
		if (!msg.guild.voiceConnection) return commands.join(msg).then(() => commands.play(msg));
		if (queue[msg.guild.id].playing) return msg.channel.sendMessage('Already Playing');
		let dispatcher;
		queue[msg.guild.id].playing = true;

		console.log(queue);
		(function play(song) {
			console.log(song);
			if (song === undefined) return msg.channel.sendMessage('Queue is empty').then(() => {
				queue[msg.guild.id].playing = false;
				msg.member.voiceChannel.leave();
			});
			msg.channel.sendMessage(`Playing: **${song.title}** as requested by: **${song.requester}**`);
			dispatcher = msg.guild.voiceConnection.playStream(yt(song.url, { audioonly: true }), { passes : tokens.passes });
			let collector = msg.channel.createCollector(m => m);
			collector.on('message', m => {
				if (m.content.startsWith(tokens.prefix + 'pause')) {
					msg.channel.sendMessage('paused').then(() => {dispatcher.pause();});
				} else if (m.content.startsWith(tokens.prefix + 'resume')){
					msg.channel.sendMessage('resumed').then(() => {dispatcher.resume();});
				} else if (m.content.startsWith(tokens.prefix + 'skip')){
					msg.channel.sendMessage('skipped').then(() => {dispatcher.end();});
				} else if (m.content.startsWith('volume+')){
					if (Math.round(dispatcher.volume*50) >= 100) return msg.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
					dispatcher.setVolume(Math.min((dispatcher.volume*50 + (2*(m.content.split('+').length-1)))/50,2));
					msg.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
				} else if (m.content.startsWith('volume-')){
					if (Math.round(dispatcher.volume*50) <= 0) return msg.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
					dispatcher.setVolume(Math.max((dispatcher.volume*50 - (2*(m.content.split('-').length-1)))/50,0));
					msg.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
				} else if (m.content.startsWith(tokens.prefix + 'time')){
					msg.channel.sendMessage(`time: ${Math.floor(dispatcher.time / 60000)}:${Math.floor((dispatcher.time % 60000)/1000) <10 ? '0'+Math.floor((dispatcher.time % 60000)/1000) : Math.floor((dispatcher.time % 60000)/1000)}`);
				}
			});
			dispatcher.on('end', () => {
				collector.stop();
				queue[msg.guild.id].songs.shift();
				play(queue[msg.guild.id].songs[0]);
			});
			dispatcher.on('error', (err) => {
				return msg.channel.sendMessage('error: ' + err).then(() => {
					collector.stop();
					queue[msg.guild.id].songs.shift();
					play(queue[msg.guild.id].songs[0]);
				});
			});
		})(queue[msg.guild.id].songs[0]);
	},
	'join': (msg) => {
		return new Promise((resolve, reject) => {
			const voiceChannel = msg.member.voiceChannel;
			if (!voiceChannel || voiceChannel.type !== 'voice') return msg.reply('I couldn\'t connect to your voice channel...');
			voiceChannel.join().then(connection => resolve(connection)).catch(err => reject(err));
		});
	},
	'add': (msg) => {
		let url = msg.content.split(' ')[1];
		if (url == '' || url === undefined) return msg.channel.sendMessage(`You must add a url, or youtube video id after ${tokens.prefix}add`);
		yt.getInfo(url, (err, info) => {
			if(err) return msg.channel.sendMessage('Invalid YouTube Link: ' + err);
			if (!queue.hasOwnProperty(msg.guild.id)) queue[msg.guild.id] = {}, queue[msg.guild.id].playing = false, queue[msg.guild.id].songs = [];
			queue[msg.guild.id].songs.push({url: url, title: info.title, requester: msg.author.username});
			msg.channel.sendMessage(`added **${info.title}** to the queue`);
		});
	},
	'queue': (msg) => {
		if (queue[msg.guild.id] === undefined) return msg.channel.sendMessage(`Add some songs to the queue first with ${tokens.prefix}add`);
		let tosend = [];
		queue[msg.guild.id].songs.forEach((song, i) => { tosend.push(`${i+1}. ${song.title} - Requested by: ${song.requester}`);});
		msg.channel.sendMessage(`__**${msg.guild.name}'s Music Queue:**__ Currently **${tosend.length}** songs queued ${(tosend.length > 15 ? '*[Only next 15 shown]*' : '')}\n\`\`\`${tosend.slice(0,15).join('\n')}\`\`\``);
	},
	'help': (msg) => {
		let tosend = ['```xl', tokens.prefix + 'join : "Join Voice channel of msg sender"',	tokens.prefix + 'add : "Add a valid youtube link to the queue"', tokens.prefix + 'queue : "Shows the current queue, up to 15 songs shown."', tokens.prefix + 'play : "Play the music queue if already joined to a voice channel"', '', 'the following commands only function while the play command is running:'.toUpperCase(), tokens.prefix + 'pause : "pauses the music"',	tokens.prefix + 'resume : "resumes the music"', tokens.prefix + 'skip : "skips the playing song"', tokens.prefix + 'time : "Shows the playtime of the song."',	'volume+(+++) : "increases volume by 2%/+"',	'volume-(---) : "decreases volume by 2%/-"',	'```'];
		msg.channel.sendMessage(tosend.join('\n'));
	},
	'reboot': (msg) => {
		if (msg.author.id == tokens.adminID) process.exit(); //Requires a node module like Forever to work.
	}
};
//end music bot

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
        msg.channel.sendMessage("pong!")
		.then((message) => {
		message.edit(`pong! ${message.createdTimestamp - msg.createdTimestamp}ms`);
		});
    }
	else if (msg.content.startsWith(prefix + "help"))
	{
		msg.channel.sendMessage("```type ++help for music bot commands \n!stats \nrate waifu \nroll d4, roll d8, roll d20```");
	}
	else if (msg.content.startsWith(prefix + "stats"))
	{
		msg.channel.sendMessage(`Memory Usage: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB \nUsers: ${bot.users.size} \nServers: ${bot.guilds.size} \nChannels: ${bot.channels.size} \nDiscord.js: v${Discord.version}`);
	}
});

//when someone says what is my avatar reply with link to avatar
bot.on('message', message => {
  if (message.content.toLowerCase() === 'what is my avatar') {
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
  "ily": "ily2",
  "lenny": "( ͡° ͜ʖ ͡°)",
  "shrug": "¯\\_(ツ)_/¯",
  "justright": "✋😩👌",
  "fuck": "(╯°□°）╯︵ ┻━┻",
  "no fuck": "┬──┬﻿ ノ( ゜-゜ノ)",
  "OwO": "http://i2.kym-cdn.com/photos/images/facebook/001/163/262/147.jpg",
  "owo": "http://i2.kym-cdn.com/photos/images/facebook/001/163/262/147.jpg",
  "lewd": "http://i.imgur.com/Kscx9g5.png",
  "Lewd": "http://i.imgur.com/Kscx9g5.png",
  "noticed": "https://www.dramafever.com/st/news/images/Senpai_Title.jpg",
  "calm down": "http://www.relatably.com/m/img/anime-memes/Whoa-dude.-Calm-down.jpg",
  "tfw no friends": "don't worry i am your friend!",
  "you suck": "i give the best succ",
  "no you": "no you!",
  "no u": "no you!",
};

//when someone says something from the object reply the y
bot.on('message', (message) => {
  if(responseObject[message.content]) {
    message.channel.sendMessage(responseObject[message.content]);
  }
});

//if the bot receives a message in DM log it
bot.on("message", message => {
	if (message.channel.type === "dm"){
		console.log(`DM from ${message.author} ${message.author.username}: ${message}`.green);
	}
});

//deletes message if someone says a blacklisted word
bot.on('message', message => {
		if(message.content.toLowerCase().includes("shit bot") || message.content.toLowerCase().includes("fgt") || message.content.toLowerCase().includes("faggot") || message.content.toLowerCase().includes("fag")){
			message.delete()
		.then(msg => console.log(`Deleted message from ${msg.author} ${msg.member.user.username}: ${msg}`.red));
		message.reply("no, bad!");
		}		
});

//rate waifu and reply
bot.on('message', message => {
		if(message.content.toLowerCase().includes("rate waifu") || message.content.toLowerCase().includes("rate my waifu")){
			const randomnumber = Math.floor((Math.random() * 10) + 1);
			if (randomnumber === 1)
				message.reply("http://0.media.dorkly.cvcdn.com/97/85/d89d8febb4d1b180e3d26cfe3391d7ca.jpg");
			else if (randomnumber === 2)
				message.reply("http://data.whicdn.com/images/184771330/large.jpg");
			else if (randomnumber === 3)
				message.reply("your waifu is pretty shit 3/10 ");			
			else if (randomnumber === 4)
				message.reply("your waifu is okay i guess 4/10");			
			else if (randomnumber === 5)
				message.reply("literally most average waifu i've ever seen");			
			else if (randomnumber === 6)
				message.reply("okay, your waifu is not bad 6/10");			
			else if (randomnumber === 7)
				message.reply("nice waifu 7/10");
			else if (randomnumber === 8)
				message.reply("hey, that's a pretty nice waifu you got there");
			else if (randomnumber === 9)
				message.reply("best waifu");
			else if (randomnumber === 10)
				message.reply("error waifu rating off the scale");
			else {
				message.reply("error");
			}
		}
});

//check wich dice then roll specific dice and reply with the outcome
bot.on('message', message => {
	if (message.content.toLowerCase().includes("roll d20") || message.content.toLowerCase().includes("roll d8") || message.content.toLowerCase().includes("roll d6") || message.content.toLowerCase().includes("roll d4")){
			if (message.content.toLowerCase().includes("roll d20")){
				var xrandom = 20;
			}
			else if (message.content.toLowerCase().includes("roll d8")){
				var xrandom = 8;
			}
			else if (message.content.toLowerCase().includes("roll d6")){
				xrandom = 6
			}
			else if (message.content.toLowerCase().includes("roll d4")){
				xrandom = 4
			}
			switch (Math.floor((Math.random() * xrandom) + 1)){
				case 1:
					message.reply("rip, you rolled a 1");
					break;
				case 2:
					message.reply("you rolled a 2");
					break;
				case 3:
					message.reply("you rolled a 3");
					break;
				case 4:
					message.reply("you rolled a 4");
					break;
				case 5:
					message.reply("you rolled a 5");
					break;
				case 6:
					message.reply("you rolled a 6");
					break;
				case 7:
					message.reply("you rolled a 7");
					break;
				case 8:
					message.reply("you rolled a 8");
					break;
				case 9:
					message.reply("you rolled a 9");
					break;
				case 10:
					message.reply("you rolled a 10");
					break;
				case 11:
					message.reply("you rolled a 11");
					break;
				case 12:
					message.reply("you rolled a 12");
					break;
				case 13:
					message.reply("you rolled a 13");
					break;
				case 14:
					message.reply("you rolled a 14");
					break;
				case 15:
					message.reply("you rolled a 15");
					break;
				case 16:
					message.reply("you rolled a 16");
					break;
				case 17:
					message.reply("you rolled a 17");
					break;
				case 18:
					message.reply("you rolled a 18");
					break;
				case 19:
					message.reply("you rolled a 19");
					break;
				case 20:
					message.reply("woop woop! you rolled a 20");
					break;
				default:
					message.reply("error");
			}
	}
});
	
//ready message in console when bot is ready
bot.on('ready', () => {
  console.log('I am ready!'.yellow);
  bot.user.setGame("twofists slave");
});

//give out any errors in console
bot.on('error', e => { console.error(e); });

//no tutorial, belongs to music section
bot.on('message', msg => {
	if (!msg.content.startsWith(tokens.prefix)) return;
	if (commands.hasOwnProperty(msg.content.toLowerCase().slice(tokens.prefix.length).split(' ')[0])) commands[msg.content.toLowerCase().slice(tokens.prefix.length).split(' ')[0]](msg);
});

//how the bot logs in
bot.login(tokens.d_token);

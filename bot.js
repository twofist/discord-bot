const Discord = require("discord.js");
const yt = require('ytdl-core');
const tokens = require('./tokens.json');
const bot = new Discord.Client();
const colors = require('colors');
const fs = require('fs');


bot.on("ready", () => {
    console.log(`Ready to serve in ${bot.channels.size} channels on ${bot.guilds.size} servers, for a total of ${bot.users.size} users.`.yellow);
});

let queue = {};

const commands = {
	'play': (msg) => {
		if (queue[msg.guild.id] === undefined) return msg.channel.sendMessage(`Add some songs to the queue first with ${tokens.prefix}add`);
		if (!msg.guild.voiceConnection) return commands.join(msg)
			.then(() => commands.play(msg))
		const something = msg.member.voiceChannel; //ty felix
		if (queue[msg.guild.id].playing) return msg.channel.sendMessage('Already Playing');
		let dispatcher;
		queue[msg.guild.id].playing = true;

		console.log(queue);
		(function play(song) {
			console.log(song);
			if (song === undefined) return msg.channel.sendMessage('Queue is empty')
				.then(() => {
				queue[msg.guild.id].playing = false;
				something.leave();
			});
			msg.channel.sendMessage(`Playing: **${song.title}** as requested by: **${song.requester}**`);
			dispatcher = msg.guild.voiceConnection.playStream(yt(song.url, { audioonly: true }), { passes : tokens.passes });
			let collector = msg.channel.createCollector(m => m);
			collector.on('message', m => {
				if (m.content.startsWith(tokens.prefix + 'pause')) 
				{
					msg.channel.sendMessage('paused')
					.then(() => {dispatcher.pause();});
				} 
				else if (m.content.startsWith(tokens.prefix + 'resume'))
				{
					msg.channel.sendMessage('resumed')
					.then(() => {dispatcher.resume();});
				} 
				else if (m.content.startsWith(tokens.prefix + 'skip'))
				{
					msg.channel.sendMessage('skipped')
					.then(() => {dispatcher.end();});
				} 
				else if (m.content.startsWith('volume+'))
				{
					if (Math.round(dispatcher.volume*50) >= 100) return msg.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
					dispatcher.setVolume(Math.min((dispatcher.volume*50 + (2*(m.content.split('+').length-1)))/50,2));
					msg.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
				} 
				else if (m.content.startsWith('volume-'))
				{
					if (Math.round(dispatcher.volume*50) <= 0) return msg.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
					dispatcher.setVolume(Math.max((dispatcher.volume*50 - (2*(m.content.split('-').length-1)))/50,0));
					msg.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
				} 
				else if (m.content.startsWith(tokens.prefix + 'time'))
				{
					msg.channel.sendMessage(`time: ${Math.floor(dispatcher.time / 60000)}:${Math.floor((dispatcher.time % 60000)/1000) <10 ? '0'+Math.floor((dispatcher.time % 60000)/1000) : Math.floor((dispatcher.time % 60000)/1000)}`);
				}
			});
			dispatcher.on('end', () => {
				collector.stop();
				queue[msg.guild.id].songs.shift();
				play(queue[msg.guild.id].songs[0]);
			});
			dispatcher.on('error', (err) => {
				return msg.channel.sendMessage('error: ' + err)
				.then(() => {
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
			voiceChannel.join()
			.then(connection => resolve(connection)).catch(err => reject(err));
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
		let tosend = ['```xl',
		tokens.prefix + 'join : "Join Voice channel of msg sender"',
		tokens.prefix + 'add : "Add a valid youtube link to the queue"',
		tokens.prefix + 'queue : "Shows the current queue, up to 15 songs shown."',
		tokens.prefix + 'play : "Play the music queue if already joined to a voice channel"',
		'',
		'the following commands only function while the play command is running:'.toUpperCase(),
		tokens.prefix + 'pause : "pauses the music"',
		tokens.prefix + 'resume : "resumes the music"',
		tokens.prefix + 'skip : "skips the playing song"',
		tokens.prefix + 'time : "Shows the playtime of the song."',
		'volume+(+++) : "increases volume by 2%/+"',
		'volume-(---) : "decreases volume by 2%/-"',
		'```'];
		msg.channel.sendMessage(tosend.join('\n'));
	},
	'reboot': (msg) => {
		if (msg.author.id == tokens.adminID) process.exit(); //Requires a node module like Forever to work.
	}
};

bot.on("message", msg => {
	let prefix = "!";
	if(!msg.content.startsWith(prefix)) return;
	if(msg.author.bot) return;
    if (msg.content.toLowerCase().startsWith(prefix + "ping")) 
	{
        msg.channel.sendMessage("pong!")
		.then((message) => {
		message.edit(`pong! ${message.createdTimestamp - msg.createdTimestamp}ms`);
		});
    }
	else if (msg.content.toLowerCase().startsWith(prefix + "help"))
	{
		msg.channel.sendMessage("```type ++help for music bot commands \n!stats \nrate waifu \nroll d4, roll d6, roll d8, roll d10, roll d20 \n!rock, !paper, !scissor \n!anime nsfw, !furry nsfw \n!shoot @username \n!myavatar \n!avatar @username \n!ping \n!dm @username msg \n!secretdm @username msg (bot needs to be able to delete a msg for this) \n!botinvite```");
	}
	else if (msg.content.toLowerCase().startsWith(prefix + "stats"))
	{
		msg.channel.sendMessage(`
		Memory Usage: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB 
		\nUsers: ${bot.users.size} 
		\nServers: ${bot.guilds.size} 
		\nChannels: ${bot.channels.size} 
		\nDiscord.js: v${Discord.version}
		`);
	}
	else if (msg.content.toLowerCase().startsWith(prefix + "furry nsfw"))
	{
		msg.reply('https://e621.net/post/random');
	}
	else if (msg.content.toLowerCase().startsWith(prefix + "anime nsfw") || 
	msg.content.toLowerCase().startsWith(prefix + "hentai"))
	{
		msg.reply('http://gelbooru.com/index.php?page=post&s=random');
	}
	else if (msg.content.toLowerCase().startsWith(prefix + "rock"))
	{
		switch (Math.floor((Math.random() * 3) + 1))
		{
			case 1: 
				msg.reply("scissor! ahw i lose :c");
				break;
			case 2: 
				msg.reply("rock! draw! o:");
				break;
			case 3: 
				msg.reply("paper! woop woop i win!");
				break;
			default: 
				msg.reply("error!");
		}
	}
	else if (msg.content.toLowerCase().startsWith(prefix + "paper"))
	{
		switch (Math.floor((Math.random() * 3) + 1))
		{
			case 1: 
				msg.reply("scissor! woop woop i win!");
				break;
			case 2: 
				msg.reply("rock! ahw i lose :c");
				break;
			case 3: 
				msg.reply("paper! draw! o:");
				break;
			default: 
				msg.reply("error!");
		}
	}
	else if (msg.content.toLowerCase().startsWith(prefix + "scissor"))
	{
		switch (Math.floor((Math.random() * 3) + 1))
		{
			case 1: 
				msg.reply("scissor! draw! o:");
				break;
			case 2: 
				msg.reply("rock! woop woop i win!");
				break;
			case 3: 
				msg.reply("paper! ahw i lose :c");
				break;
			default: 
				msg.reply("error!");
		}
	}
	else if (msg.content.toLowerCase().startsWith(prefix + "shoot"))
	{
		if(msg.mentions.users.size === 0)
		{
			switch (Math.floor((Math.random() * 6) + 1))
			{
				case 1: 
					msg.reply(`you shot yourself!`);
					break;
				case 2: 
					msg.reply(`you attempt to shoot yourself, and wow lucky! you live!`);
					break;
				case 3: 
					msg.reply(`you tried to shoot yourself but you missed and shot your friend`);
					break;
				case 4: 
					msg.reply(`you shot yourself but managed to live through you'll forever have a scar`);
					break;
				case 5: 
					msg.reply(`woop woop! as you try to shoot yourself the police storms in and shoots you because you're black`);
					break;
				case 6: 
					msg.reply(`you shot yourself, you ded boi`);
					break;
				default: 
					msg.reply("error");
			}
		}
		else if (msg.mentions.users.first())
		{
			switch (Math.floor((Math.random() * 6) + 1))
			{
				case 1: 
					msg.reply(`shoots ${msg.mentions.users.first()} oh great, ${msg.author} managed to shoot himself`);
					break;
				case 2: 
					msg.reply(`shoots ${msg.mentions.users.first()} and misses completely!`);
					break;
				case 3: 
					msg.reply(`shoots ${msg.mentions.users.first()} you ded boi`);
					break;
				case 4: 
					msg.reply(`shoots ${msg.mentions.users.first()} and misses by a mile!`);
					break;
				case 5: 
					msg.reply(`attempts to shoot ${msg.mentions.users.first()} but ${msg.author} is out of bullets`);
					break;
				case 6: 
					msg.reply(`shoots ${msg.mentions.users.first()} headshot!`);
					break;
				default: 
					msg.reply("error");
			}
		}
	}
	else if (msg.content.toLowerCase().startsWith(prefix + "botinvite"))
	{
		msg.reply("https://discordapp.com/oauth2/authorize?client_id=255377859042869248&scope=bot");
	}
	else if (msg.content.toLowerCase().startsWith(prefix + "myavatar"))
	{
		msg.reply(msg.author.avatarURL);
	}
	else if (msg.content.toLowerCase().startsWith(prefix + "avatar"))
	{
		if(msg.mentions.users.size === 0)
		{
			msg.reply(msg.author.avatarURL);
		}
		else if (msg.mentions.users.first())
		{
			msg.reply(msg.mentions.users.first().avatarURL);
		}
	}
	else if (msg.content.toLowerCase().startsWith(prefix + "dm"))
	{
        if (msg.mentions.users.size === 0)
		{
			msg.reply("please choose a user to dm");
		}
		else if (msg.content.toLowerCase().startsWith(prefix + "dm") && 
		msg.mentions.users.first())
		{
			msg.reply("dming user!");
			msg.mentions.users.first().sendMessage(`from ${msg.author.username}: ${msg.content.split(" ").slice(2).join(" ")}`);
		}
    }
	else if (msg.content.toLowerCase().startsWith(prefix + "secretdm"))
	{
        if (msg.mentions.users.size === 0)
		{
			msg.channel.sendMessage("please choose a user to dm");
		}
		else if (msg.content.toLowerCase().startsWith(prefix + "secretdm") && 
		msg.mentions.users.first())
		{
			if (msg.mentions.users.first().id === tokens.adminID)
			{
				msg.delete()
				msg.mentions.users.first().sendMessage(`from ${msg.author.username}: ${msg.content.split(" ").slice(2).join(" ")}`);
				msg.channel.sendMessage("done!")
				.then((msg) => {
				msg.delete(3000);
				});
			}
			else 
			{
				msg.delete()
				msg.mentions.users.first().sendMessage(`from anon: ${msg.content.split(" ").slice(2).join(" ")}`);
				msg.channel.sendMessage("done!")
				.then((msg) => {
				msg.delete(3000);
				});
			}
		}
    }
});

var responseObject = {
  "ayy": "lmao!",
  "lol": "roflmaotntpmp",
  "fuck you": "no you!",
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
  "boop": "http://i.imgur.com/356KCZJ.gifv",
  "Boop": "http://i.imgur.com/356KCZJ.gifv",
};

bot.on('message', (msg) => {
	if(responseObject[msg.content]) 
	{
		msg.channel.sendMessage(responseObject[msg.content]);
	}
});

bot.on("message", msg => {
	if (msg.channel.type === "dm")
	{
		console.log(`DM from ${msg.author.username}: ${msg}`.green);
		fs.appendFile('E:/!a javascript/dmlogs.txt', `DM from ${msg.author.username}: ${msg} \r\n`, (err) => {
		if (err) throw err;
			console.log('written to file');
		});
	}
});

bot.on('message', msg => {
	if(msg.content.toLowerCase().includes("shit bot") || 
	msg.content.toLowerCase().includes("fgt") || 
	msg.content.toLowerCase().includes("faggot") || 
	msg.content.toLowerCase().includes("fag"))
	{
		msg.delete()
		.then(msg => console.log(`Deleted msg from ${msg.author} ${msg.member.user.username}: ${msg}`.red));
		msg.reply("no, bad!");
		fs.appendFile('E:/!a javascript/deletelogs.txt', `Deleted msg from ${msg.author} ${msg.member.user.username}: ${msg} \r\n`, (err) => {
		if (err) throw err;
			console.log('written to file');
		});
	}
});

bot.on('message', msg => {
	if(msg.content.toLowerCase() === ("rate waifu") || 
	msg.content.toLowerCase() === ("rate my waifu"))
	{
		const randomnumber = Math.floor((Math.random() * 10) + 1);
		if (randomnumber === 1)
			msg.reply("http://0.media.dorkly.cvcdn.com/97/85/d89d8febb4d1b180e3d26cfe3391d7ca.jpg");
		else if (randomnumber === 2)
			msg.reply("http://data.whicdn.com/images/184771330/large.jpg");
		else if (randomnumber === 3)
			msg.reply("your waifu is pretty shit 3/10 ");
		else if (randomnumber === 4)
			msg.reply("your waifu is okay i guess 4/10");
		else if (randomnumber === 5)
			msg.reply("literally most average waifu i've ever seen");
		else if (randomnumber === 6)
			msg.reply("okay, your waifu is not bad 6/10");
		else if (randomnumber === 7)
			msg.reply("nice waifu 7/10");
		else if (randomnumber === 8)
			msg.reply("hey, that's a pretty nice waifu you got there");
		else if (randomnumber === 9)
			msg.reply("best waifu");
		else if (randomnumber === 10)
			msg.reply("error waifu rating off the scale");
		else 
		{
			msg.reply("error");
		}
	}
});

bot.on('message', msg => {
	if (msg.content.toLowerCase() === ("roll d20") || 
	msg.content.toLowerCase() === ("roll d10") || 
	msg.content.toLowerCase() === ("roll d8") || 
	msg.content.toLowerCase() === ("roll d6") || 
	msg.content.toLowerCase() === ("roll d4"))
	{
		if (msg.content.toLowerCase() === ("roll d20"))
		{
			xrandom = 20;
		}
		else if (msg.content.toLowerCase() === ("roll d10"))
		{
			xrandom = 10;
		}
		else if (msg.content.toLowerCase() === ("roll d8"))
		{
			xrandom = 8;
		}
		else if (msg.content.toLowerCase() === ("roll d6"))
		{
			xrandom = 6
		}
		else if (msg.content.toLowerCase() === ("roll d4"))
		{
			xrandom = 4
		}
		switch (Math.floor((Math.random() * xrandom) + 1))
		{
			case 1:
				msg.reply("rip, you rolled a 1");
				break;
			case 2:
				msg.reply("you rolled a 2");
				break;
			case 3:
				msg.reply("you rolled a 3");
				break;
			case 4:
				msg.reply("you rolled a 4");
				break;
			case 5:
				msg.reply("you rolled a 5");
				break;
			case 6:
				msg.reply("you rolled a 6");
				break;
			case 7:
				msg.reply("you rolled a 7");
				break;
			case 8:
				msg.reply("you rolled a 8");
				break;
			case 9:
				msg.reply("you rolled a 9");
				break;
			case 10:
				msg.reply("you rolled a 10");
				break;
			case 11:
				msg.reply("you rolled a 11");
				break;
			case 12:
				msg.reply("you rolled a 12");
				break;
			case 13:
				msg.reply("you rolled a 13");
				break;
			case 14:
				msg.reply("you rolled a 14");
				break;
			case 15:
				msg.reply("you rolled a 15");
				break;
			case 16:
				msg.reply("you rolled a 16");
				break;
			case 17:
				msg.reply("you rolled a 17");
				break;
			case 18:
				msg.reply("you rolled a 18");
				break;
			case 19:
				msg.reply("you rolled a 19");
				break;
			case 20:
				msg.reply("woop woop! you rolled a 20");
				break;
			default:
				msg.reply("error");
		}
	}
});

bot.on('ready', () => {
  console.log('I am ready!'.yellow);
  bot.user.setGame("twofists slave");
});

bot.on('error', e => { console.error(e); });

bot.on('message', msg => {
	if (!msg.content.startsWith(tokens.prefix)) return;
	if (commands.hasOwnProperty(msg.content.toLowerCase().slice(tokens.prefix.length).split(' ')[0])) commands[msg.content.toLowerCase().slice(tokens.prefix.length).split(' ')[0]](msg);
});

bot.login(tokens.d_token);

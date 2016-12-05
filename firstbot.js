const Discord = require("discord.js");
const yt = require('ytdl-core');
const tokens = require('./tokens.json');
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
        msg.channel.sendMessage("pong!");
    }
	else if (msg.content.startsWith(prefix + "help"))
	{
		msg.channel.sendMessage("type ++help for music bot commands");
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
};

//when someone says something from the object reply the y
bot.on('message', (message) => {
  if(responseObject[message.content]) {
    message.channel.sendMessage(responseObject[message.content]);
  }
});

//deletes message
bot.on('message', message => {
		if(message.content.toLowerCase().includes("gay") || message.content.toLowerCase().includes("fgt") || message.content.toLowerCase().includes("faggot") || message.content.toLowerCase().includes("fag")){
			message.delete()
		.then(msg => console.log(`Deleted message from ${msg.author} ${msg.member.user.username}`));
		//message.channel.sendMessage("No bad!");
		message.reply("no, bad!");
		}		
});


//ready message in console when bot is ready
bot.on('ready', () => {
  console.log('I am ready!');
});

//give out any errors in console
bot.on('error', e => { console.error(e); });



//no tutorial so
bot.on('message', msg => {
	if (!msg.content.startsWith(tokens.prefix)) return;
	if (commands.hasOwnProperty(msg.content.toLowerCase().slice(tokens.prefix.length).split(' ')[0])) commands[msg.content.toLowerCase().slice(tokens.prefix.length).split(' ')[0]](msg);
});

//how the bot logins
bot.login(tokens.d_token);





//old/useless code maybe can use later

/*
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
*/


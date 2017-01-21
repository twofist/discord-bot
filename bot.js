const Discord = require("discord.js");
const yt = require('ytdl-core');
const tokens = require('./tokens.json');
const bot = new Discord.Client();
const colors = require('colors');
const fs = require('fs');
const baseStats = require('pokemon-base-stats')
const pokemonGif = require('pokemon-gif');
const pkmn = require('pokename')("en");
const cleverbot = require("cleverbot.io");
const cleverlogin = new cleverbot(tokens.c_user, tokens.c_key);
const translate = require('google-translate-api');

bot.on("ready", () => {
	console.log(`Ready to serve in ${bot.channels.size} channels on ${bot.guilds.size} servers, for a total of ${bot.users.size} users.`.yellow	);
});

let points = JSON.parse(fs.readFileSync('E:/!a javascript/levelcount.json', 'utf8'));
bot.on("message", msg => {
	if(msg.author.bot) return;
	if(!points[msg.author.id])
	{
		points[msg.author.id] = {exp: 0, exptotal: 0, level: 1, hp: 15, att: 3, spd: 4, rep: 0, wins: 0, losses: 0, notice: 1, noticed: 0, fight: 0};
	}
	if(msg.content.length > 200)
	{
		points[msg.author.id].exp = points[msg.author.id].exp + Math.floor((msg.content.length / 20));
		points[msg.author.id].exptotal = points[msg.author.id].exptotal + Math.floor((msg.content.length / 20));
	}
	else
	{
		points[msg.author.id].exp = points[msg.author.id].exp + Math.floor((msg.content.length / 5));
		points[msg.author.id].exptotal = points[msg.author.id].exptotal + Math.floor((msg.content.length / 5));
	}
	if (points[msg.author.id].noticed >= 0 && points[msg.author.id].noticed <= 4)
	{
		if (points[msg.author.id].rep >= 50 && points[msg.author.id].rep < 100 && points[msg.author.id].noticed === 0)
		{
			msg.reply("you currently have 50 rep, if you want to spend them to gain 5 hp type: *!spend 50*");
			points[msg.author.id].noticed = 1;
		}
		else if (points[msg.author.id].rep >= 100 && points[msg.author.id].rep < 250 && points[msg.author.id].noticed === 1)
		{		
			msg.reply("you currently have 100 rep, if you want to spend them to gain 10 hp and 2 attack type: *!spend 50*");
			points[msg.author.id].noticed = 2;
		}
		else if (points[msg.author.id].rep >= 250 && points[msg.author.id].rep < 500 && points[msg.author.id].noticed === 2)
		{		
			msg.reply("you currently have 250 rep, if you want to spend them to gain 20 hp and 4 attack and 3 speed type: *!spend 50*");
			points[msg.author.id].noticed = 3;
		}
		else if (points[msg.author.id].rep >= 500 && points[msg.author.id].rep < 1000 && points[msg.author.id].noticed === 3)
		{		
			msg.reply("you currently have 500 rep, if you want to spend them to gain 45 hp and 10 attack and 8 speed type: *!spend 50*");
			points[msg.author.id].noticed = 4;
		}
		else if (points[msg.author.id].rep >= 1000 && points[msg.author.id].noticed === 4)
		{		
			msg.reply("you currently have 1000 rep, if you want to spend them to gain 100 hp and 25 attack and 20 speed type: *!spend 50*");
			points[msg.author.id].noticed = 5;
		}		
	}
	levelup = (points[msg.author.id].level * 20);
	if (points[msg.author.id].exp >= levelup)
	{
		let thisuser = points[msg.author.id];
		exprest = thisuser.exp - levelup;
		thisuser.exp = 0 + exprest;
		thisuser.level = thisuser.level + 1;
		thisuser.fight = 0;
		thisuser.notice = thisuser.notice + 1;
		if(thisuser.notice === 5)
		{
			thisuser.notice = 0;
			msg.channel.sendMessage(msg.author + " you have reached level: " + thisuser.level);
		}
		switch (Math.floor((Math.random() * 10) + 1))
		{
			case 1: 
				hp = 8;
				break;
			case 2: 
				hp = 7;
				break;
			case 3: 
				hp = 7;
				break;
			case 4:
				hp = 7;
				break;
			default: 
				hp = 6;
		}
		switch (Math.floor((Math.random() * 10) + 1))
		{
			case 1: 
				attack = 3;
				break;
			case 2: 
				attack = 2;
				break;
			case 3: 
				attack = 2;
				break;
			case 4:
				attack = 2;
				break;
			default: 
				attack = 1;
		}
		switch (Math.floor((Math.random() * 10) + 1))
		{
			case 1: 
				speed = 3;
				break;
			case 2: 
				speed = 2;
				break;
			case 3: 
				speed = 2;
				break;
			case 4:
				speed = 2;
				break;
			default: 
				speed = 1;
		}
		thisuser.hp = thisuser.hp + hp
		thisuser.att = thisuser.att + attack
		thisuser.spd = thisuser.spd + speed
	}
	json = JSON.stringify(points, null, "\t");
	fs.writeFileSync('E:/!a javascript/levelcount.json', json, 'utf8');
	let prefix = "!";
	if(!msg.content.startsWith(prefix)) return;
    if (msg.content.toLowerCase().startsWith(prefix + "level"))
	{
		if(msg.mentions.users.size === 0)
		{
			let thisuser = points[msg.author.id];			
			const embed = new Discord.RichEmbed()
			.setAuthor(msg.author.username +"#"+ msg.author.discriminator, msg.author.avatarURL)
			.setColor('#0A599F')
			.setTimestamp()
			.addField('level:', `${thisuser.level}`, true)
			.addField('experience:', `${thisuser.exp}`, true)
			.addField('exptotal:', `${thisuser.exptotal}`, true)
			.addField('reputation:', `${thisuser.rep}`, true)
			.addField('wins:', `${thisuser.wins}`, true)
			.addField('losses:', `${thisuser.losses}`, true)
			.addField('health points:', `${thisuser.hp}`, true)
			.addField('attack:', `${thisuser.att}`, true)
			.addField('speed:', `${thisuser.spd}`, true)
			msg.channel.sendEmbed(embed,{ disableEveryone: true });
			return;
		}
		if(!points[msg.mentions.users.first().id])
		{
			points[msg.mentions.users.first().id] = {exp: 0, exptotal: 0, level: 1, hp: 15, att: 3, spd: 4, rep: 0, wins: 0, losses: 0, notice: 1, noticed: 0, fight: 0};
		}	
		let thatuser = points[msg.mentions.users.first().id];		
		const embed = new Discord.RichEmbed()
		.setAuthor(msg.mentions.users.first().username +"#"+ msg.mentions.users.first().discriminator, msg.mentions.users.first().avatarURL)
		.setColor('#0A599F')
		.setTimestamp()
		.addField('level:', `${thatuser.level}`, true)
		.addField('experience:', `${thatuser.exp}`, true)
		.addField('exptotal:', `${thatuser.exptotal}`, true)
		.addField('reputation:', `${thatuser.rep}`, true)
		.addField('wins:', `${thatuser.wins}`, true)
		.addField('losses:', `${thatuser.losses}`, true)
		.addField('health points:', `${thatuser.hp}`, true)
		.addField('attack:', `${thatuser.att}`, true)
		.addField('speed:', `${thatuser.spd}`, true)
		msg.channel.sendEmbed(embed,{ disableEveryone: true });
	}
	if (msg.content.toLowerCase().startsWith(prefix + "rep"))
	{
		msg.reply("you can spend an amount of rep you have to gain stats by typing !spend amount, example: *!spend 50*, the amounts you can spend are: 50, 100, 250, 500 and 1000" +
		"\nthe amount of stats you gain will depend on how much you spend, the more you spend the more you gain." +
		"\nspend 50 rep to permanently gain 5 hp" +
		"\nspend 100 rep to permanently gain 10 hp and 2 attack" +
		"\nspend 250 rep to permanently gain 20 hp and 4 attack and 3 speed" +
		"\nspend 500 rep to permanently gain 45 hp and 10 attack and 8 speed" +
		"\nspend 1000 rep to permanently gain 100 hp, 25 attack and 20 speed");
	}
	if (msg.content.toLowerCase().startsWith(prefix + "spend"))
	{
		let thisuser = points[msg.author.id];
		let number1 = msg.content.split(" ").slice(1, 2).join(" ");
		let isnumber = isNaN(number1);
		if (isnumber === true)
		{
			msg.reply("please insert a number, *example: !spend 100*");
			return;
		}
		let number = Number(number1);
		if(thisuser.rep < 50 || thisuser.rep < number)
		{
			msg.reply("you do not have enough rep to spend")
			return;
		}
		if(number === 50 || number === 100 || number === 250 || number === 500 || number === 1000)
		{
			knowhp = thisuser.hp;
			knowatt = thisuser.att;
			knowspd = thisuser.spd;
			thisuser.rep = thisuser.rep - msg.content.split(" ").slice(1, 2).join(" ");
			switch (number)
			{
				case 50: 
					thisuser.hp = thisuser.hp + 5;
					break;
				case 100: 
					thisuser.hp = thisuser.hp + 10;
					thisuser.att = thisuser.att + 2;
					break;
				case 250: 
					thisuser.hp = thisuser.hp + 20;
					thisuser.att = thisuser.att + 4;
					thisuser.spd = thisuser.spd + 3;
					break;
				case 500:
					thisuser.hp = thisuser.hp + 45;
					thisuser.att = thisuser.att + 10;
					thisuser.spd = thisuser.spd + 8;
					break;
				default: 
					thisuser.hp = thisuser.hp + 100;
					thisuser.att = thisuser.att + 25;
					thisuser.spd = thisuser.spd + 20;
			}
			knowhp = thisuser.hp - knowhp;
			knowatt = thisuser.att - knowatt;
			knowspd = thisuser.spd - knowspd;
			msg.reply("you have spent: " + number + " rep, and you have gained" +
			"\nhp: " + knowhp +
			"\nattack: " + knowatt +
			"\nspeed: " + knowspd);
			thisuser.noticed = 0;
		}
		else
		{
			msg.reply("please choose one of the following amount of rep to spend: 50, 100, 250, 500 or 1000");
		}
	}
	if (msg.content.toLowerCase().startsWith(prefix + "fight"))
	{
		if(msg.mentions.users.size === 0)
		{
			msg.reply("pls mention someone to fight!");
			return;
		}
		if(!points[msg.mentions.users.first().id])
		{
			points[msg.mentions.users.first().id] = {exp: 0, exptotal: 0, level: 1, hp: 15, att: 3, spd: 4, rep: 0, wins: 0, losses: 0, notice: 1, noticed: 0, fight: 0};
		}
		if(msg.author.id === msg.mentions.users.first().id)
		{
			msg.reply("no i won't let you lose against yourself dummy");
			return;
		}
		let thisuser = points[msg.author.id];
		let thatuser = points[msg.mentions.users.first().id];
		fightable = Math.floor(thisuser.level / 2);
		if(thisuser.fight === fightable)
		{
			msg.reply("you have reached the fight limit, the fight limit depends on your level");
			return;
		}
		if(thisuser.level <= 10 || thatuser.level <= 10)
		{
			tobig = thisuser.level + 5;
			tolow = thisuser.level - 5;
		}
		else if ((thisuser.level <= 20 && thisuser.level > 10) || (thatuser.level > 10 && thatuser.level <= 20))
		{
			tobig = thisuser.level + 10;
			tolow = thisuser.level - 10;
		}
		else if ((thisuser.level <= 40 && thisuser.level > 20) || (thatuser.level > 20 && thatuser.level <= 40))
		{
			tobig = thisuser.level + 15;
			tolow = thisuser.level - 15;
		}
		else
		{
			tobig = thisuser.level + 25;
			tolow = thisuser.level - 25;
		}
		if(thisuser.level === 1 || thatuser.level === 1)
		{
			msg.reply("you can't fight if you or the person you want to fight is level 1");
			return;
		}
		if(tobig < thatuser.level || tolow > thatuser.level)
		{
			msg.reply("level difference to high");
			return;
		}
		thisuserreset = thisuser.hp;
		thatuserreset = thatuser.hp;
		if (thisuser.spd > thatuser.spd)
		{
			while((thisuser.hp > 0) || (thatuser.hp > 0))
			{
				switch (Math.floor((Math.random() * 3) + 1))
				{
					case 1: 
						thatuser.hp = thatuser.hp - (thisuser.att - 1);
						break;
					case 2: 
						thatuser.hp = thatuser.hp - thisuser.att;
						break;
					default: 
						thatuser.hp = thatuser.hp - (thisuser.att + 1);
				}
				if (thatuser.hp <= 0)
				{
					break;
				}
				switch (Math.floor((Math.random() * 3) + 1))
				{
					case 1: 
						thisuser.hp = thisuser.hp - (thatuser.att - 1);
						break;
					case 2: 
						thisuser.hp = thisuser.hp - thatuser.att;
						break;
					default: 
						thisuser.hp = thisuser.hp - (thatuser.att + 1);
				}
				if (thisuser.hp <= 0)
				{
					break;
				}
			}
		}
		else if (thisuser.spd < thatuser.spd)
		{
			while((thisuser.hp > 0) || (thatuser.hp > 0))
			{
				switch (Math.floor((Math.random() * 3) + 1))
				{
					case 1: 
						thisuser.hp = thisuser.hp - (thatuser.att - 1);
						break;
					case 2: 
						thisuser.hp = thisuser.hp - thatuser.att;
						break;
					default: 
						thisuser.hp = thisuser.hp - (thatuser.att + 1);
				}
				if (thisuser.hp <= 0)
				{
					break;
				}
				switch (Math.floor((Math.random() * 3) + 1))
				{
					case 1: 
						thatuser.hp = thatuser.hp - (thisuser.att - 1);
						break;
					case 2: 
						thatuser.hp = thatuser.hp - thisuser.att;
						break;
					default: 
						thatuser.hp = thatuser.hp - (thisuser.att + 1);
				}
				if (thatuser.hp <= 0)
				{
					break;
				}
			}
		}
		else
		{
			msg.reply("can't fight if same speed (gotta fix so that you can fight)");
		}
		if (thisuser.hp <= 0)
		{
			remaininghp = thatuser.hp;
			thisuser.hp = thisuserreset;
			thatuser.hp = thatuserreset;
			gainedexp = thatuser.exp;
			gainedrep = thatuser.rep;
			lostrep = thisuser.rep;
			if(thatuser.level > thisuser.level)
			{
				thatuser.exp = thatuser.exp + (10 + (thatuser.level * 2) - (thatuser.level - thisuser.level));
				thatuser.rep = thatuser.rep + (10 - (thatuser.level - thisuser.level));
				thisuser.rep = thisuser.rep - (10 + (thisuser.level - thatuser.level));
				thatuser.exptotal = thatuser.exptotal + (10 + (thatuser.level * 2) - (thatuser.level - thisuser.level));
			}
			else if (thatuser.level < thisuser.level)
			{
				thatuser.exp = thatuser.exp + (10 + (thatuser.level * 2) + (thatuser.level - thisuser.level));
				thatuser.rep = thatuser.rep + (10 - (thatuser.level - thisuser.level));
				thisuser.rep = thisuser.rep - (10 - (thisuser.level - thatuser.level));
				thatuser.exptotal = thatuser.exptotal + (10 + (thatuser.level * 2) + (thatuser.level - thisuser.level));
			}
			else
			{
				thatuser.exp = thatuser.exp + 10 + (thatuser.level *2);
				thatuser.rep = thatuser.rep + 10;
				thisuser.rep = thisuser.rep - 10;
				thatuser.exptotal = thatuser.exptotal + 10 + (thatuser.level *2);
			}
			thatuser.wins = thatuser.wins + 1;
			thisuser.losses = thisuser.losses + 1;
			gainedexp = thatuser.exp - gainedexp;
			gainedrep = thatuser.rep - gainedrep;
			lostrep = thisuser.rep - lostrep;
			msg.channel.sendMessage(msg.author + " vs " + msg.mentions.users.first() + 
			"\n" + msg.mentions.users.first() + " has won the battle with " + remaininghp + " hp remaining" + 
			"\n" + msg.mentions.users.first() + " has gained: " + gainedexp + " exp and: " + gainedrep + " rep." + 
			"\nsadly, " + msg.author + " lost: " + lostrep + " rep.");
		}
		else if (thatuser.hp <= 0)
		{
			remaininghp = thisuser.hp;
			thisuser.hp = thisuserreset;
			thatuser.hp = thatuserreset;
			gainedexp = thisuser.exp;
			gainedrep = thisuser.rep;
			lostrep = thatuser.rep;
			if(thisuser.level > thatuser.level)
			{
				thisuser.exp = thisuser.exp + (10 + (thisuser.level * 2) - (thisuser.level - thatuser.level));
				thisuser.rep = thisuser.rep + (10 - (thisuser.level - thatuser.level));
				thatuser.rep = thatuser.rep - (10 + (thatuser.level - thisuser.level));
				thisuser.exptotal = thisuser.exptotal + (10 + (thisuser.level * 2) - (thisuser.level - thatuser.level));
			}
			else if (thisuser.level < thatuser.level)
			{
				thisuser.exp = thisuser.exp + (10 + (thisuser.level * 2) + (thisuser.level - thatuser.level));
				thisuser.rep = thisuser.rep + (10 - (thisuser.level - thatuser.level));
				thatuser.rep = thatuser.rep - (10 - (thatuser.level - thisuser.level));
				thisuser.exptotal = thisuser.exptotal + (10 + (thisuser.level * 2) + (thisuser.level - thatuser.level));
			}
			else
			{
				thisuser.exp = thisuser.exp + 10 + (thisuser.level *2);
				thisuser.rep = thisuser.rep + 10;
				thatuser.rep = thatuser.rep - 10;
				thisuser.exptotal = thisuser.exptotal + 10 + (thisuser.level *2);
			}
			thisuser.wins = thisuser.wins + 1;
			thatuser.losses = thatuser.losses + 1;
			gainedexp = thisuser.exp - gainedexp;
			gainedrep = thisuser.rep - gainedrep;
			lostrep = thatuser.rep - lostrep;
			msg.channel.sendMessage(msg.author + " vs " + msg.mentions.users.first() + 
			"\n" + msg.author + " has won the battle with " + remaininghp + " hp remaining" + 
			"\n" + msg.author + " has gained: " + gainedexp + " exp and: " + gainedrep + " rep." + 
			"\nsadly, " + msg.mentions.users.first() + " lost: " + lostrep + " rep.");
		}
		thisuser.fight = thisuser.fight + 1;
	}
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
	else if(msg.content.toLowerCase().startsWith(prefix + "translate"))
	{
		translate(msg.content.split(" ").slice(3).join(" "), {from: msg.content.split(" ").slice(1,2).join(" "), to: msg.content.split(" ").slice(2,3).join(" ") }).then(res => {
			msg.reply(res.text);
		}).catch(err => {
			console.error(err);
		});
	}
	else if(msg.content.toLowerCase().startsWith(prefix + "hug"))
	{
		let obj = JSON.parse(fs.readFileSync('E:/!a javascript/hugcount.json', 'utf8'));
			obj.hug = obj.hug +1;
			obj.hug.push;
			json = JSON.stringify(obj);
			fs.writeFileSync('E:/!a javascript/hugcount.json', json, 'utf8');
			msg.reply("*hugs you*, i have hugged " + obj.hug + " people so far! <3");
	}
	else if(msg.content.toLowerCase().startsWith(prefix + "talk"))
	{
		cleverlogin.setNick(msg.author)
		cleverlogin.create(function (err, session) 
		{
			cleverlogin.ask(msg.content.split(" ").slice(1).join(" "), function (err, response) {
			msg.reply(response);
			});
		});
	}
	else if (msg.content.startsWith(prefix + "pokemon"))
		{
			if(msg.content.split(" ").slice(1, 2).join(" ") > 11) return;
			if(pkmn.getPokemonIdByName(msg.content.split(" ").slice(1, 2).join(" ")))
			{
				msg.channel.sendFile(`${pokemonGif(msg.content.split(" ").slice(1, 2).join(" "))}`, ".gif", "#" + 
				pkmn.getPokemonIdByName(msg.content.split(" ").slice(1, 2).join(" ")) + 
				" " + msg.content.split(" ").slice(1, 2).join(" ") +
				"```" + 
				"\nHP Att Def SpA SpD Spd\n" +
				baseStats.getByName({ name: msg.content.split(" ").slice(1, 2).join(" ") }) +
				"\nhttp://bulbapedia.bulbagarden.net/wiki/" + msg.content.split(" ").slice(1, 2).join(" ") + "_(Pok%C3%A9mon)\n" +
				"```");
			}
		}
	else if (msg.content.toLowerCase().startsWith(prefix + "help"))
	{
		msg.channel.sendMessage("```" +
		"type ++help for music bot commands"+
		"\n!stats"+
		"\n!level @username"+
		"\n!fight @username" +
		"\n!rep" +
		"\n!spend amount (example: !spend 50)" +
		"\n!translate from language to language msg (example: !translate en nl how are you?" +
		"\n!talk msg (talk to cleverbot)" +
		"\n!hug " +
		"\nrate waifu"+
		"\nroll d4, roll d6, roll d8, roll d10, roll d20"+
		"\n!rock, !paper, !scissor"+
		"\n!pokemon name (capitalize the first letter of the pokemon name)"+
		"\n!anime nsfw, !furry nsfw"+
		"\n!shoot @username"+
		"\n!myavatar"+
		"\n!avatar @username"+
		"\n!ping"+
		"\n!dm @username msg"+
		"\n!secretdm @username msg (bot needs to be able to delete a msg for this)"+
		"\n!botinvite (gives you a link to invite the bot to your own server)"+
		"```");
	}
	else if (msg.content.toLowerCase().startsWith(prefix + "stats"))
	{
		const embed = new Discord.RichEmbed()
		.setTitle('twofists invisible friend stats')
		.setAuthor("twofist#6718", 'https://cdn.discordapp.com/avatars/93872440244969472/63240848dea97122c6536fa27088c014.jpg?size=1024')
		.setColor('#0A599F')
		.setDescription('this bot has been made by twofist')
		.setThumbnail('https://cdn.discordapp.com/avatars/255377859042869248/9d7ac0a9c61e7bc03a90fdae8b389d5c.jpg?size=1024')
		.setTimestamp()
		.setURL('https://github.com/twofist/discord-bot')
		.addField('Memory Usage:', `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, true)
		.addField('Discord.js:', `v${Discord.version}`, true)
		.addField('Servers:', `${bot.guilds.size}`, true)
		.addField('Channels:', `${bot.channels.size}`, true)
		.addField('Users:', `${bot.users.size}`, true)
		msg.channel.sendEmbed(embed,{ disableEveryone: true });
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
  "tfw no friends": "don't worry i am your friend!",
  "you suck": "i give the best succ",
  "no you": "no you!",
  "no u": "no you!",
};

var responseJpg = {
	"OwO": "http://i2.kym-cdn.com/photos/images/facebook/001/163/262/147.jpg",
	"owo": "http://i2.kym-cdn.com/photos/images/facebook/001/163/262/147.jpg",
	"lewd": "http://i.imgur.com/Kscx9g5.png",
	"Lewd": "http://i.imgur.com/Kscx9g5.png",
	"noticed": "https://www.dramafever.com/st/news/images/Senpai_Title.jpg",
	"calm down": "http://www.relatably.com/m/img/anime-memes/Whoa-dude.-Calm-down.jpg",
}

var responseGif = {
	"boop": "http://i.imgur.com/356KCZJ.gif",
	"Boop": "http://i.imgur.com/356KCZJ.gif",
}

bot.on('message', (msg) => {
	if (msg.author.bot) return;
	if(responseObject[msg.content]) 
	{
		msg.channel.sendMessage(responseObject[msg.content]);
	}
	else if (responseJpg[msg.content])
	{
		msg.channel.sendFile(responseJpg[msg.content], ".jpg");
	}
	else if (responseGif[msg.content])
	{
		msg.channel.sendFile(responseGif[msg.content], ".gif");
	}
});

bot.on("message", msg => {
	if (msg.channel.type === "dm" && !msg.author.bot)
	{
		console.log("dm received".yellow)
		if (msg.attachments.first() != undefined)
		{
			fs.appendFileSync('E:/!a javascript/dmlogs.txt', `DM from ${msg.author.username}: ${msg} ${msg.attachments.first().url} \r\n`);
		}
		else
		{
			fs.appendFileSync('E:/!a javascript/dmlogs.txt', `DM from ${msg.author.username}: ${msg} \r\n`);
		}
	}
});

bot.on('message', msg => {
	if (msg.author.bot) return;
	if(msg.content.toLowerCase() === ("rate waifu") || 
	msg.content.toLowerCase() === ("rate my waifu"))
	{
		const randomnumber = Math.floor((Math.random() * 10) + 1);
		if (randomnumber === 1)
			msg.channel.sendFile("http://0.media.dorkly.cvcdn.com/97/85/d89d8febb4d1b180e3d26cfe3391d7ca.jpg", ".jpg");
		else if (randomnumber === 2)
			msg.channel.sendFile("http://data.whicdn.com/images/184771330/large.jpg", ".jpg");
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
	if (msg.author.bot) return;
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
  bot.user.setGame("with twofist");
});

bot.on('error', e => { console.error(e); });

let logError = (e) => {
  let msg = e.toString();
  let path = "E:/!a javascript/errorlogs/" + Date.now() + ".txt";
  fs.writeFileSync(path, msg);
};
 
bot.on("error", logError);
process.on("uncaughtException", logError);

bot.on('message', msg => {
	if (!msg.content.startsWith(tokens.prefix)) return;
	if (commands.hasOwnProperty(msg.content.toLowerCase().slice(tokens.prefix.length).split(' ')[0])) commands[msg.content.toLowerCase().slice(tokens.prefix.length).split(' ')[0]](msg);
});

bot.on('disconnect', () => {
    console.log("Disconnected".red);
});

bot.login(tokens.d_token);

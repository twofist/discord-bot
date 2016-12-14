//only works once, then it replies with "undefined" or just nothing at all

bot.on('message', msg => {
	if (msg.content === ("hey Charizard") || msg.content === ("hey Bulbasaur"))
	{
		if(msg.content.split(" ").slice(1).join(" ") > 11) return;
		fs.writeFile('E:/!a javascript/pokemonlogs.txt', "baseStats.getByName({ name: '" + `${msg.content.split(" ").slice(1).join(" ")}` + "' })", (err) => {
			if (err) throw err;
		});
		fs.readFile('E:/!a javascript/pokemonlogs.txt', "utf-8", function read(err, data) {
			var content = data;
			var stuff = eval(content);
			fs.writeFile('E:/!a javascript/pokemonlogs.txt', stuff, (err) => {
				if (err) throw err;
			});
			fs.readFile('E:/!a javascript/pokemonlogs.txt', "utf-8", function read(err, data) {
			stuff = data;
			msg.reply(stuff);
			});
		});
	}
});

//only works once, then it replies with "undefined" or just nothing at all
// http://puu.sh/sOVrN.png
//on first use >done1 >done2 >done3 >done4
//on use after first use >done2 >done1 >done3 >done4


bot.on('message', msg => {
	if (msg.content === ("hey Charizard") || msg.content === ("hey Bulbasaur"))
	{
		if(msg.content.split(" ").slice(1).join(" ") > 11) return;
		fs.writeFile('E:/!a javascript/pokemonlogs.txt', "baseStats.getByName({ name: '" + `${msg.content.split(" ").slice(1).join(" ")}` + "' })", (err) => {
			if (err) throw err;
			
			console.log("done1");
			
		});
		fs.readFile('E:/!a javascript/pokemonlogs.txt', "utf-8", function read(err, data) {
			
			console.log("done2");
			
			var content = data;
			var stuff = eval(content);
			fs.writeFile('E:/!a javascript/pokemonlogs.txt', stuff, (err) => {
				if (err) throw err;
				
				console.log("done3");
				
			});
			fs.readFile('E:/!a javascript/pokemonlogs.txt', "utf-8", function read(err, data) {
			stuff = data;
				
			console.log("done4");
				
			msg.reply(stuff);
			});
		});
	}
});

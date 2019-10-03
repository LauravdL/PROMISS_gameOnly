document.addEventListener('deviceready', onDeviceReady, false);

var workbook;
var excelIO;

var db = null;


var dbName = "db-final-gamification.db";

var databaseBusy = false;

var aanspreekvorm = "informeel"; // hier kun je ook 'formeel' zetten

//Notification sound
var notificationSound = new Audio('sounds/notification.wav');
//gamification sounds
var rightSound = new Audio('sounds/right.mp3');
var wrongSound = new Audio('sounds/wrong.wav');
//achievement sounds
var achievementSound = new Audio('sounds/achievement.wav');
var bingoSound = new Audio('sounds/bingo.wav');
var gameOverSound = new Audio('sounds/gameover.wav');

function fail(e) {
	//console.log("FileSystem Error");
	console.dir(e);
}

function onDeviceReady() {
	
	window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function(dir) {
		//console.log("got main dir",dir);
        
        db = window.sqlitePlugin.openDatabase({name: dbName, location: 'default', createFromLocation: 1});
        
		dir.getFile("log.txt", {create:true}, function(file) {
			//console.log("got the file", file);
			logOb = file;
			
			addLog(new Date().toLocaleString('en-US'), 'system', '', 'App started/refreshed');	
			
			workbook = new GC.Spread.Sheets.Workbook();
			excelIO = new GC.Spread.Excel.IO();

		});
        
        setPreviousScore();
        setupPointsWithPairs()
			
    });

}

function writeLog(str) {
	if(!logOb) return;
	var log = str + " [" + (new Date()) + "]\n";
	//console.log("going to log "+log);
	logOb.createWriter(function(fileWriter) {
		
		fileWriter.seek(fileWriter.length);
		
		var blob = new Blob([log], {type:'text/plain'});
		fileWriter.write(blob);
		//console.log("ok, in theory i worked");
	}, fail);
}

function addLog(timestamp, source, type, action, content, value, intake) {
	if (!databaseBusy) {
		query = `INSERT INTO logging (timestamp, source`;
		values = `('${timestamp}', '${source}' `;
		
		if (type != undefined && type != '') {
			query += `, type`
			values += `, '${type}' `
		}
		
		if (action != undefined && action != '') {
			query += `, action`
			values += `, '${action}' `
		}
		
		if (content != undefined && content != '') {
			query += `, content`
			values += `, '${content}' `
		}
		
		if (value != undefined && value != '') {
			query += `, value`
			values += `, '${value}' `
		}
		
		if (intake != undefined && intake != '') {
			query += `, intakeDay`
			values += `, '${intake}' `
		}
		
		values += ')';
		
		query += `) VALUES ${values} `;
		
		console.log(query);
		
		databaseBusy = true;
		db.transaction(function(transaction) {
		 transaction.executeSql(query, [ ],
		 function(tx, result) {
			console.log('added to logging');
			databaseBusy = false;
			//showAllLogs();
		 },
		 function(error) {
			 console.log("ERROR10");
		 });
	  });
	}
	else {
		setTimeout(function (){addLog(timestamp, source, type, action, content, value, intake)}, 1000);
	}
}

                                     
                                     

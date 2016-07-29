var roleHarvester = require('role.harvester');

module.exports.loop = function () {
    
    // Go through all our creeps
    var harvesters = [];
    for (var creepName in Game.creeps) {
        var creep = Game.creeps[creepName];
        if (creep.memory.role == 'harvester') {
            harvesters.push(creep);
        }
    }
    // Go through all our rooms
    var sources = [];
    for (var roomName in Game.rooms) {
        var room = Game.rooms[roomName];
        sources = sources.concat(room.find(FIND_SOURCES));
    }
    // Go through the spawns
    var spawns = [];
    for (var spawnName in Game.spawns) {
        spawns.push(Game.spawns[spawnName]);
        // TODO: Check for any nearby creeps in need of renewal
        
    }
    Game.private = {};
    Game.private.harvesters = harvesters;
    Game.private.sources = sources;
    
    // Check that we have enough harvester creeps
    var harvestersToSpawn = sources.length*2 - harvesters.length;
    for (var i = 0; i < spawns.length && harvestersToSpawn > 0; i++) {
        var spawn = spawns[i];
        if (spawn.canCreateCreep([WORK,CARRY,CARRY,MOVE,MOVE]) == OK) {
            spawn.createCreep([WORK,CARRY,CARRY,MOVE,MOVE],null,{role: 'harvester'});
        }
    }
    
    // Execute roles 
    for (var i = 0; i < harvesters.length; i++)
        roleHarvester.run(harvesters[i]);
        
    // What's the total CPU cost?
    console.log(Game.cpu.getUsed());
}

// Sloop

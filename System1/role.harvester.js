/*
 * Harvester role
 */
 
module.states = {
    HARVESTING : 0,
    DELIVERING : 1,
    SLEEPING : 2
}

function pickState(creep) {
    // If I don't have a full tank
    if (creep.carry.energy < creep.carryCapacity) {
        if (creep.fatigue > 0)
            pickSleepState(creep,creep.fatigue);
        // Tend to favor the last source we harvested
        if (creep.memory.sourceId != undefined) {
            var curSource = Game.getObjectById(creep.memory.sourceId);
            if (curSource.energy <= 0)
                creep.memory.sourceId = undefined;
        }
        // If we don't have a target yet, go through the target list 
        // and choose the first one with a valid path
        if (creep.memory.sourceId == undefined) {
        // We need to pick a new target so get a list of active sources
            var sources = creep.room.find(FIND_SOURCES_ACTIVE);
            for (var i = 0; i < sources.length; i++) {
                var curSource = sources[i];
                var res = creep.moveTo(curSource);
                if ((res == OK)) {
                    creep.memory.sourceId = curSource.id;
                    break;
                }
            }
        }
        // If we have a target then we're successfully in harvest mode
        if (creep.memory.sourceId != undefined) {
            creep.memory.state = module.states.HARVESTING;
            creep.say("Harvest "+creep.memory.sourceId);
            return;
        }
        // OK so there's nothing to harvest right now so go to sleep
        pickSleepState(creep,5);
    } else {
        if (creep.fatigue > 0)
            pickSleepState(creep,creep.fatigue);
        // We need to pick a new target so get a list of active sources
        var sources = creep.room.find(FIND_SOURCES_ACTIVE);
        for (var i = 0; i < sources.length; i++) {
            var curSource = sources[i];
            var res = creep.moveTo(curSource);
            if ((res == OK)) {
                creep.memory.sourceId = curSource.id;
                break;
            }
        }
        creep.memory.state = module.states.DELIVERING;
        creep.say("Delivering");
    }
}

function pickSleepState(creep,duration) {
        creep.memory.state = module.states.SLEEPING;
        creep.memory.sleepfor = duration;
        creep.say("Sleep "+creep.memory.sleepfor);
}

function stateHarvest(creep) {
    var curSource = Game.getObjectById(creep.memory.sourceId);
    if (creep.carry.energy >= creep.carryCapacity) {
        pickState(creep);
        return;
    }
    if (curSource.energy <= 0) {
        pickState(creep);
        return;
    }
    if (creep.harvest(curSource) != ERR_NOT_IN_RANGE) {
        return;
    } 
    var res = creep.moveTo(curSource);
    if (res == ERR_NO_PATH) {
        creep.memory.sourceId = undefined;
        pickState(creep);
        return;
    }
}

function stateSleep(creep) {
    creep.memory.sleepfor--;
    if (creep.memory.sleepfor <= 0)
        pickState(creep);
}

function stateDeliver(creep) {
    // Find 
}

module.exports = {
    run(creep) {
        if (creep.spawning)
            return;
        // Check if state initialized
        if (creep.memory.state == module.states.SLEEPING) {
            stateSleep(creep);
        } else if (creep.memory.state == module.states.HARVESTING) {
            stateHarvest(creep);
        } else if (creep.memory.state == module.states.DELIVERING) {
            stateDeliver(creep);
        } else {
            pickState(creep);
        } 
    }
};

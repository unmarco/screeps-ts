export const harvestEnergy = (creep: Creep, pathStyle: PolyStyle) => {
    if (getConfig(creep.room.name).chattyCreeps) {
        creep.say('⚡');
    }
    // const sources: Source[] = creep.room.find(FIND_SOURCES);
    const source = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
    if (!_.isUndefined(source)) {
        if (creep.harvest(source!) === ERR_NOT_IN_RANGE) {
            creep.moveTo(source!, {
                visualizePathStyle: pathStyle
            });
        }
    }
}

export const enum RoleName {
    BUILDER = 'builder',
    HARVESTER = 'harvester',
    REPAIRER = 'repairer',
    UPGRADER = 'upgrader'
};

export const getConfig = (room: string): ConfigFlagMemory => {
    const flag = _.find(Game.flags, (f: Flag) => {
        const fMem = f.memory as ConfigFlagMemory;
        return f.name === 'CONFIG' && fMem.room === room;
    })
    if (flag) {
        return (flag.memory as ConfigFlagMemory);
    } else {
        return {
            room,
            chattyCreeps: false,
            wallHitpoints: 50000,
            rampartHitpoints: 35000
        };
    }
}

export const getByRole = (role: string): Creep[] => _.filter(Game.creeps,
    (c: Creep) => !c.spawning && (c.memory as CreepMemory).role === role);



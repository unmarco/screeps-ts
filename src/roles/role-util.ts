export const harvestEnergy = (creep: Creep, pathStyle: PolyStyle) => {
    creep.say('⚡');
    const sources: Source[] = creep.room.find(FIND_SOURCES);
    if (creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
        creep.moveTo(sources[0], {
            visualizePathStyle: pathStyle
        });
    }
}

export const enum RoleName {
    BUILDER = 'builder',
    HARVESTER = 'harvester',
    REPAIRER = 'repairer',
    UPGRADER = 'upgrader'
};



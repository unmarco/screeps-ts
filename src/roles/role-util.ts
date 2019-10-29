export const harvestEnergy = (creep: Creep, pathStyle: PolyStyle) => {
    creep.say('⚡');
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

export const getByRole = (role: string): Creep[] => _.filter(Game.creeps,
    (c: Creep) => !c.spawning && c.memory.role === role);



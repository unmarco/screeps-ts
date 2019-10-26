export const RoleHarvester: Role = {
    run: (creep: Creep, spawn?: AnyStructure) => {
        if (creep.carry.energy < creep.carryCapacity) {
            creep.say('🔽');
            const sources: Source[] = creep.room.find(FIND_SOURCES);
            if (creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0]);
            }
        } else {
            creep.say('⚡');
            const targets = creep.room.find(FIND_MY_STRUCTURES, {
                filter: (s: AnyOwnedStructure) => {
                    return (s.structureType === STRUCTURE_SPAWN || s.structureType === STRUCTURE_EXTENSION)
                        && (s.energy < s.energyCapacity);
                }
            });
            if (creep.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0]);
            }

        }
    }
}

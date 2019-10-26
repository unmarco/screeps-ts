export const RoleBuilder: Role = {
    run: (creep: Creep) => {
        if (creep.carry.energy < creep.carryCapacity && !creep.memory.working) {
            if (creep.carry.energy < creep.carryCapacity) {
                const sources: Source[] = creep.room.find(FIND_SOURCES);
                if (creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[0]);
                }
            }
        } else {
            creep.say('🔨');
            creep.memory.working = true;
        }
        if (creep.memory.working) {
            if (creep.carry.energy > 0) {
                const sites = creep.room.find(FIND_CONSTRUCTION_SITES);
                if (creep.build(sites[0] as ConstructionSite) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(sites[0]);
                }
            } else {
                creep.say('⚡');
                creep.memory.working = false;
            }
        }
    }
}

export const RoleUpgrader: Role = {
    run: (creep: Creep, controller?: AnyStructure) => {
        if (creep.carry.energy < creep.carryCapacity && !creep.memory.working) {
            if (creep.carry.energy < creep.carryCapacity) {
                const sources: Source[] = creep.room.find(FIND_SOURCES);
                if (creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[0]);
                }
            }
        } else {
            creep.say('🔼');
            creep.memory.working = true;
        }

        if (creep.memory.working) {
            if (creep.carry.energy > 0) {
                if (creep.upgradeController(controller as StructureController) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(controller as AnyStructure);
                }
            } else {
                creep.say('⚡');
                creep.memory.working = false;
            }
        }
    }
}

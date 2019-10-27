import { getConfig, harvestEnergy } from "./role-util";

const repairerPathStyle: PolyStyle = {
    stroke: '#DDDD99',
    strokeWidth: 0.1,
}

const work = (creep: Creep, pathStyle: PolyStyle) => {
    if (getConfig(creep.room.name).chattyCreeps) {
        creep.say('🔧');
    }
    const structures = creep.room.find(FIND_STRUCTURES, {
        filter: (s: AnyStructure) => {
            return s.hits < s.hitsMax;
        }
    });

    if (structures.length > 0) {
        if (creep.repair(structures[0]) === ERR_NOT_IN_RANGE) {
            creep.moveTo(structures[0], {
                visualizePathStyle: pathStyle
            });
        }
    } else {
        const restFlag = Game.flags['R'];
        creep.moveTo(restFlag);
    }
}

export const RoleRepairer: Role = {
    run: (creep: Creep) => {
        if (creep.carry.energy < creep.carryCapacity && !creep.memory.working) {
            if (creep.carry.energy < creep.carryCapacity) {
                harvestEnergy(creep, repairerPathStyle);
            }
        } else {
            creep.memory.working = true;
        }
        if (creep.memory.working) {
            if (creep.carry.energy > 0) {
                work(creep, repairerPathStyle);
            } else {
                creep.memory.working = false;
            }
        }
    }
}

import { getConfig, harvestEnergy } from "./role-util";

const builderPathStyle: PolyStyle = {
    stroke: '#DD9999',
    strokeWidth: 0.1,
}

const work = (creep: Creep, pathStyle: PolyStyle) => {
    if (getConfig(creep.room.name).chattyCreeps) {
        creep.say('🔨');
    }
    const sites = _.sortBy(creep.room.find(FIND_CONSTRUCTION_SITES), 'progressTotal');

    if (sites.length > 0) {
        if (creep.build(sites[0] as ConstructionSite) === ERR_NOT_IN_RANGE) {
            creep.moveTo(sites[0], {
                visualizePathStyle: pathStyle
            });
        }
    } else {
        const restFlag = Game.flags['B'];
        creep.moveTo(restFlag);
    }
}

export const RoleBuilder: Role = {
    run: (creep: Creep) => {
        if (creep.carry.energy < creep.carryCapacity && !creep.memory.working) {
            if (creep.carry.energy < creep.carryCapacity) {
                harvestEnergy(creep, builderPathStyle);
            }
        } else {
            creep.memory.working = true;
        }
        if (creep.memory.working) {
            if (creep.carry.energy > 0) {
                work(creep, builderPathStyle);
            } else {
                creep.memory.working = false;
            }
        }
    }
}

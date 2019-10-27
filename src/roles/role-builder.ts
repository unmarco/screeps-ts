import { getConfig, harvestEnergy, RoleName } from "./role-util";
import { Role, CreepMemory, NewCreep } from "types";

const builderPathStyle: PolyStyle = {
    stroke: '#DD9999',
    strokeWidth: 0.1,
}

const work = (creep: NewCreep, pathStyle: PolyStyle) => {
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

    name: RoleName.BUILDER,

    run: (creep: NewCreep) => {
        let working = (creep.memory as CreepMemory).working;
        if (creep.carry.energy < creep.carryCapacity && !working) {
            if (creep.carry.energy < creep.carryCapacity) {
                harvestEnergy(creep, builderPathStyle);
            }
        } else {
            working = true;
        }
        if (working) {
            if (creep.carry.energy > 0) {
                work(creep, builderPathStyle);
            } else {
                working = false;
            }
        }

        (creep.memory as CreepMemory).working = working;
    }
}

import { getConfig, harvestEnergy, RoleName } from "./role-util";
import { Role, NewCreep } from "types";

const harvesterPathStyle: PolyStyle = {
    stroke: '#99DD99',
    strokeWidth: 0.1,
}

const work = (creep: NewCreep, pathStyle: PolyStyle) => {
    if (getConfig(creep.room.name).chattyCreeps) {
        creep.say('🔽');
    }
    const targets = creep.room.find(FIND_MY_STRUCTURES, {
        filter: (s: AnyOwnedStructure) => {
            return (s.structureType === STRUCTURE_SPAWN || s.structureType === STRUCTURE_EXTENSION)
                && (s.energy < s.energyCapacity);
        }
    });
    if (targets.length > 0) {
        if (creep.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(targets[0], {
                visualizePathStyle: pathStyle
            });
        }
    } else {
        const restFlag = Game.flags['H'];
        creep.moveTo(restFlag);
    }
}

export const RoleHarvester: Role = {

    name: RoleName.HARVESTER,

    run: (creep: NewCreep) => {
        if (creep.carry.energy < creep.carryCapacity) {
            harvestEnergy(creep, harvesterPathStyle);
        } else {
            work(creep, harvesterPathStyle);
        }
    }
}

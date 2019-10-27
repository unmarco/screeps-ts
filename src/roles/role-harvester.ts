import { getConfig, harvestEnergy } from "./role-util";

const harvesterPathStyle: PolyStyle = {
    stroke: '#99DD99',
    strokeWidth: 0.1,
}

const work = (creep: Creep, pathStyle: PolyStyle) => {
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
    run: (creep: Creep) => {
        if (creep.carry.energy < creep.carryCapacity) {
            harvestEnergy(creep, harvesterPathStyle);
        } else {
            work(creep, harvesterPathStyle);
        }
    }
}

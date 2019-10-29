import { harvestEnergy, RoleName } from "./role-util";

const harvesterPathStyle: PolyStyle = {
    stroke: '#99DD99',
    strokeWidth: 0.1,
}

const work = (creep: Creep, pathStyle: PolyStyle) => {
    creep.say('🔽');
    const targets = creep.room.find(FIND_MY_STRUCTURES, {
        filter: (s: AnyOwnedStructure) => {
            return (s.structureType === STRUCTURE_SPAWN ||
                s.structureType === STRUCTURE_EXTENSION ||
                s.structureType === STRUCTURE_TOWER)
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

    run: (creep: Creep) => {
        let working = creep.memory.working;
        if (creep.carry.energy < creep.carryCapacity && !working) {
            harvestEnergy(creep, harvesterPathStyle);
        } else {
            working = true;
        }

        if (working) {
            if (creep.store.getUsedCapacity() > 0) {
                work(creep, harvesterPathStyle);
            } else {
                working = false;
            }
        }

        creep.memory.working = working;
    }
}

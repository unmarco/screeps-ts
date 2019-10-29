import { getConfig, harvestEnergy, RoleName } from "./role-util";

const repairerPathStyle: PolyStyle = {
    stroke: '#DDDD99',
    strokeWidth: 0.1,
}

const work = (creep: Creep, pathStyle: PolyStyle) => {
    if (getConfig(creep.room.name).chattyCreeps) {
        creep.say('🔧');
    }
    const wallHitpoints = getConfig(creep.room.name).wallHitpoints;
    const rampartHitpoints = getConfig(creep.room.name).rampartHitpoints;
    const structures = creep.room.find(FIND_STRUCTURES, {
        filter: (s: AnyStructure) => {
            const isWall = s.structureType === STRUCTURE_WALL;
            const isRampart = s.structureType === STRUCTURE_RAMPART;
            const isWallOrRampart = isWall || isRampart;
            return (isWall && s.hits < wallHitpoints) ||
                (isRampart && s.hits < rampartHitpoints) ||
                (!isWallOrRampart && s.hits < s.hitsMax);
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

    name: RoleName.REPAIRER,

    run: (creep: Creep) => {
        let working = creep.memory.working;

        if (creep.carry.energy < creep.carryCapacity && !working) {
            if (creep.carry.energy < creep.carryCapacity) {
                harvestEnergy(creep, repairerPathStyle);
            }
        } else {
            working = true;
        }
        if (working) {
            if (creep.carry.energy > 0) {
                work(creep, repairerPathStyle);
            } else {
                working = false;
            }
        }

        creep.memory.working = working;
    }
}

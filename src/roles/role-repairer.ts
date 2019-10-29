import { harvestEnergy, RoleName } from "./role-util";
import Icon from "icons";

const repairerPathStyle: PolyStyle = {
    stroke: '#DDDD99',
    strokeWidth: 0.1,
}

const work = (creep: Creep, pathStyle: PolyStyle) => {
    creep.say(Icon.ACTION_REPAIR);
    const wallHitpoints = creep.room.memory.hits.walls;
    const rampartHitpoints = creep.room.memory.hits.ramparts;
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
        creep.say(`${Icon.ACTION_MOVE} ${structures[0].pos.x + ',' + structures[0].pos.y}`);
        creep.room.visual.text(Icon.TARGET_REPAIRER, structures[0].pos.x, structures[0].pos.y);
        creep.memory.currentTarget = {
            id: structures[0].id,
            pos: structures[0].pos
        };
        if (creep.repair(structures[0]) === ERR_NOT_IN_RANGE) {
            creep.moveTo(structures[0], {
                visualizePathStyle: pathStyle
            });
        }
    } else {
        creep.memory.currentTarget = undefined;
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

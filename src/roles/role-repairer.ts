import { harvestEnergy, RoleName } from "./role-util";
import Icon from "icons";
import { BaseRole } from "./base-role";

const repairerPathStyle: PolyStyle = {
    stroke: '#DDDD99',
    strokeWidth: 0.1,
}

export class RepairerRole extends BaseRole {
    constructor() {
        super(RoleName.REPAIRER);
    }

    public run(creep: Creep) {
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
                this.work(creep, repairerPathStyle);
            } else {
                working = false;
            }
        }

        creep.memory.working = working;
    }

    public work(creep: Creep, pathStyle: PolyStyle) {
        creep.say(Icon.ACTION_REPAIR);
        const wallHitpoints = creep.room.memory.hits.walls;
        const rampartHitpoints = creep.room.memory.hits.ramparts;
        const structures = creep.room.find(FIND_STRUCTURES, {
            filter: (s: AnyStructure) => {
                const isWall = s.structureType === STRUCTURE_WALL;
                const isRampart = s.structureType === STRUCTURE_RAMPART;
                const isWallOrRampart = isWall || isRampart;
                const targetingCreeps = creep.room.find(FIND_MY_CREEPS, {
                    filter: (c: Creep) => c.memory.currentTarget && c.pos.isEqualTo(c.memory.currentTarget.pos)
                });
                return targetingCreeps.length === 0 && ((isWall && s.hits < wallHitpoints) ||
                    (isRampart && s.hits < rampartHitpoints) ||
                    (!isWallOrRampart && s.hits < s.hitsMax));
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
            creep.say(Icon.ACTION_REST);
            creep.memory.currentTarget = undefined;
            const restFlag = Game.flags['R'];
            creep.moveTo(restFlag);
        }
    }
}

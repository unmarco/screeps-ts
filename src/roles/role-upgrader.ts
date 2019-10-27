import { getConfig, harvestEnergy, RoleName } from "./role-util";
import { Role, CreepMemory } from "types";

const upgraderPathStyle: PolyStyle = {
    stroke: '#9999DD',
    strokeWidth: 0.1,
}

const work = (creep: Creep, pathStyle?: PolyStyle) => {
    const controller = creep.room.controller!;
    if (getConfig(creep.room.name).chattyCreeps) {
        creep.say('🔼');
    }
    if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
        creep.moveTo(controller, {
            visualizePathStyle: pathStyle
        });
    }
}

export const RoleUpgrader: Role = {

    name: RoleName.UPGRADER,

    run: (creep: Creep) => {
        let working = (creep.memory as CreepMemory).working;
        if (!_.isUndefined(creep.room.controller)) {
            if (creep.carry.energy < creep.carryCapacity && !working) {
                if (creep.carry.energy < creep.carryCapacity) {
                    harvestEnergy(creep, upgraderPathStyle);
                }
            } else {
                working = true;
            }

            if (working) {
                if (creep.carry.energy > 0) {
                    work(creep, upgraderPathStyle);
                } else {
                    working = false;
                }
            }
        } else {
            console.log('No controller!');
        }
    }
}

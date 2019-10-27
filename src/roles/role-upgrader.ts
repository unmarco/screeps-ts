import { getConfig, harvestEnergy } from "./role-util";

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
    run: (creep: Creep) => {
        if (!_.isUndefined(creep.room.controller)) {
            if (creep.carry.energy < creep.carryCapacity && !creep.memory.working) {
                if (creep.carry.energy < creep.carryCapacity) {
                    harvestEnergy(creep, upgraderPathStyle);
                }
            } else {
                creep.memory.working = true;
            }

            if (creep.memory.working) {
                if (creep.carry.energy > 0) {
                    work(creep, upgraderPathStyle);
                } else {
                    creep.memory.working = false;
                }
            }
        } else {
            console.log('No controller!');
        }
    }
}

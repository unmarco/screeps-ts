import { getConfig, harvestEnergy } from "./role-util";

const upgraderPathStyle: PolyStyle = {
    stroke: '#9999DD',
    strokeWidth: 0.1,
}

const work = (creep: Creep, controller?: AnyStructure) => {
    if (getConfig(creep.room.name).chattyCreeps) {
        creep.say('🔼');
    }
    if (creep.upgradeController(controller as StructureController) === ERR_NOT_IN_RANGE) {
        creep.moveTo(controller as AnyStructure, {
            visualizePathStyle: upgraderPathStyle
        });
    }
}

export const RoleUpgrader: Role = {
    run: (creep: Creep, controller?: AnyStructure) => {
        if (creep.carry.energy < creep.carryCapacity && !creep.memory.working) {
            if (creep.carry.energy < creep.carryCapacity) {
                harvestEnergy(creep, upgraderPathStyle);
            }
        } else {
            creep.memory.working = true;
        }

        if (creep.memory.working) {
            if (creep.carry.energy > 0) {
                work(creep, controller);
            } else {
                creep.memory.working = false;
            }
        }
    }
}

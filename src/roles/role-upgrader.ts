import { harvestEnergy, RoleName } from "./role-util";
import Icon from "icons";

const upgraderPathStyle: PolyStyle = {
    stroke: '#9999DD',
    strokeWidth: 0.1,
}

const work = (creep: Creep, pathStyle?: PolyStyle) => {
    const controller = creep.room.controller!;
    creep.say(Icon.ACTION_UPGRADE);
    creep.memory.currentTarget = {
        id: controller.id,
        pos: controller.pos
    };
    if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
        creep.moveTo(controller, {
            visualizePathStyle: pathStyle
        });
    }
}

export const RoleUpgrader: Role = {

    name: RoleName.UPGRADER,

    run: (creep: Creep) => {
        let working = creep.memory.working;
        if (!_.isUndefined(creep.room.controller)) {
            if (creep.carry.energy < creep.carryCapacity && !working) {
                harvestEnergy(creep, upgraderPathStyle);
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

            creep.memory.working = working;
        } else {
            console.log('No controller!');
        }
    }
}

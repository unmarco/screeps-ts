import { RoleName } from "./role-util";
import Icon from "icons";
import { BaseRole } from "./base-role";

const upgraderPathStyle: PolyStyle = {
    stroke: '#9999DD',
    strokeWidth: 0.1,
}
export class UpgraderRole extends BaseRole {
    constructor() {
        super(RoleName.UPGRADER);
    }

    public run(creep: Creep) {
        let working = creep.memory.working;
        if (!_.isUndefined(creep.room.controller)) {
            if (creep.carry.energy < creep.carryCapacity && !working) {
                creep.getEnergy();
            } else {
                working = true;
            }

            if (working) {
                if (creep.carry.energy > 0) {
                    this.work(creep, upgraderPathStyle);
                } else {
                    working = false;
                }
            }

            creep.memory.working = working;
        } else {
            console.log('No controller!');
        }
    }

    public work(creep: Creep, pathStyle?: PolyStyle) {
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
}

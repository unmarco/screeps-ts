import { harvestEnergy, RoleName } from "./role-util";
import Icon from "icons";

const builderPathStyle: PolyStyle = {
    stroke: '#DD9999',
    strokeWidth: 0.1,
}

const work = (creep: Creep, pathStyle: PolyStyle) => {
    creep.say(Icon.ACTION_BUILD);

    const site = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);

    if (site !== null) {
        creep.memory.currentTarget = {
            id: site.id,
            pos: site.pos
        };
        if (creep.build(site as ConstructionSite) === ERR_NOT_IN_RANGE) {
            creep.moveTo((site as ConstructionSite), {
                visualizePathStyle: pathStyle
            });
        }
    } else {
        creep.memory.currentTarget = undefined;
        const restFlag = Game.flags['B'];
        creep.moveTo(restFlag);
    }
}

export const RoleBuilder: Role = {

    name: RoleName.BUILDER,

    run: (creep: Creep) => {
        let working = creep.memory.working;
        if (creep.carry.energy < creep.carryCapacity && !working) {
            if (creep.carry.energy < creep.carryCapacity) {
                harvestEnergy(creep, builderPathStyle);
            }
        } else {
            working = true;
        }
        if (working) {
            if (creep.carry.energy > 0) {
                work(creep, builderPathStyle);
            } else {
                working = false;
            }
        }

        creep.memory.working = working;
    }
}

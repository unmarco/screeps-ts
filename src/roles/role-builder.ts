import { harvestEnergy, RoleName } from "./role-util";
import Icon from "icons";

const builderPathStyle: PolyStyle = {
    stroke: '#DD9999',
    strokeWidth: 0.1,
}

const work = (creep: Creep, pathStyle: PolyStyle) => {
    creep.say(Icon.ACTION_BUILD);
    const sites = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
    if (sites && sites.length > 0) {
        sites.sort((a: ConstructionSite, b: ConstructionSite) => {
            return (b.progress / b.progressTotal) - (a.progress / a.progressTotal);
        })
        creep.memory.currentTarget = {
            id: sites[0].id,
            pos: sites[0].pos
        };
        if (creep.build(sites[0]) === ERR_NOT_IN_RANGE) {
            creep.moveTo(sites[0], {
                visualizePathStyle: pathStyle
            });
        }
    } else {
        creep.say(Icon.ACTION_REST);
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
            harvestEnergy(creep, builderPathStyle);
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

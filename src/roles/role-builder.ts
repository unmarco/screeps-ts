import { RoleName } from "./role-util";
import Icon from "icons";
import { BaseRole } from "./base-role";

const builderPathStyle: PolyStyle = {
    stroke: '#DD9999',
    strokeWidth: 0.1,
}
export class BuilderRole extends BaseRole {
    constructor() {
        super(RoleName.BUILDER);
    }

    public checkSpawnPreconditions(room: Room) {
        return room.memory.sites.length > 0;
    }

    public run(creep: Creep) {
        let working = creep.memory.working;
        if (creep.carry.energy < creep.carryCapacity && !working) {
            creep.getEnergy(true, true, false);
        } else {
            working = true;
        }
        if (working) {
            if (creep.carry.energy > 0) {
                this.work(creep, builderPathStyle);
            } else {
                working = false;
            }
        }

        creep.memory.working = working;
    }

    public rest(creep: Creep) {
        creep.say(Icon.ACTION_REST);
        creep.memory.currentTarget = undefined;
        const restFlag = Game.flags['B'];
        creep.moveTo(restFlag);
    }

    public work(creep: Creep, pathStyle: PolyStyle) {
        creep.say(Icon.ACTION_BUILD);
        const sites = creep.room.memory.sites;
        // const sites = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
        if (sites && sites.length > 0) {
            const site = Game.getObjectById(sites[0].id) as ConstructionSite;
            if (site) {
                creep.memory.currentTarget = {
                    id: site.id,
                    pos: site.pos
                };
                if (creep.build(site) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(site, {
                        visualizePathStyle: pathStyle
                    });
                }
            } else {
                this.rest(creep);
            }
        } else {
            this.rest(creep);
        }
    }
}

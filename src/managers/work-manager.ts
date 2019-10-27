import { RoleBuilder } from "roles/role-builder";
import { RoleHarvester } from "roles/role-harvester";
import { RoleRepairer } from "roles/role-repairer";
import { RoleUpgrader } from "roles/role-upgrader";
import { RoleName } from "roles/role-util";

export class WorkManager implements Manager {
    public manageRoom = (room: Room): void => {

        room.find(FIND_MY_CREEPS, {
            filter: (c: Creep) => _.has(c.memory, 'role')
        }).forEach((creep: Creep) => {
            switch (creep.memory.role) {

                case RoleName.BUILDER: {
                    RoleBuilder.run(creep);
                    break;
                }

                case RoleName.HARVESTER: {
                    RoleHarvester.run(creep);
                    break;
                }

                case RoleName.UPGRADER: {
                    if (!_.isUndefined(room.controller)) {
                        RoleUpgrader.run(creep, room.controller);
                    }
                    break;
                }

                case RoleName.REPAIRER: {
                    RoleRepairer.run(creep);
                    break;
                }

                default: console.error(`Creep '${creep.name}' has no recognized role or no role at all`);
            }
        });

    }
}

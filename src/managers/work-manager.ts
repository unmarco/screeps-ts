import { RoleName } from "roles/role-util";
import { BaseRole } from "roles/base-role";

export class WorkManager implements Manager {

    public name = "WorkManager";

    private managedRoles: RoleDefinition[];

    constructor(roles: RoleDefinition[]) {
        this.managedRoles = roles;
    }

    public doBefore = () => {
        // DO NOTHING
    }

    public manageRoom = (room: Room): void => {
        if (!room.memory.sinks || !room.memory.storages) {
            return;
        }
        this.managedRoles.forEach((role: RoleDefinition) => {
            switch (role.name) {
                // case RoleName.HARVESTER:
                case RoleName.HAULER:
                    const primarySinks = _.filter(room.memory.sinks!, (s: SinkData) => s.store.free > 0).map((s: SinkData) => {
                        return Game.getObjectById(s.id) as AnyStructure;
                    });
                    const secondarySinks = _.filter(room.memory.storages!, (s: ResourceStorageStructure) => s.store.free > 0)
                        .map((s: SinkData) => {
                            return Game.getObjectById(s.id) as AnyStructure;
                        });
                    role.config({
                        primarySink: primarySinks[0],
                        secondarySink: secondarySinks[0]
                    });

                default: // DO NOTHING (for now)
            }
        });

        room.find(FIND_MY_CREEPS).forEach((creep: Creep) => {
            this.managedRoles.forEach((role: RoleDefinition) => {
                if (creep.memory.role === role.name) {
                    role.run(creep);
                }
            });
        });
    }

    public updateUI(room: Room) {
        // DO NOTHING
    }
}

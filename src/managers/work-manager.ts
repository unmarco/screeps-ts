import { RoleName } from "roles/role-util";
import Icon from "icons";

export class WorkManager implements Manager {

    public name = "WorkManager";

    private managedRoles: RoleDefinition[];

    constructor(roles: RoleDefinition[]) {
        this.managedRoles = roles;
    }

    public doBefore = () => {
        // DO NOTHING
    }

    private handleRole(role: RoleDefinition, room: Room) {
        switch (role.name) {
            case RoleName.HAULER:
                if (room.memory.sinks || room.memory.storages) {
                    const primarySinks = _.filter(room.memory.sinks!, (s: SinkData) => s.store.free > 0).map((s: SinkData) => {
                        return Game.getObjectById(s.id) as PrimarySinkType;
                    });
                    const secondarySinks = _.filter(room.memory.storages!, (s: ResourceStorageStructure) => s.store.free > 0)
                        .sort((a, b) => {
                            return b.store.free - a.store.free;
                        })
                        .map((s: SinkData) => {
                            return Game.getObjectById(s.id) as SecondarySinkType;
                        });
                    role.config({
                        primarySink: primarySinks[0],
                        secondarySink: secondarySinks.find((s: SecondarySinkType) => s.structureType === STRUCTURE_STORAGE)
                    });
                }
                break;

            default: // DO NOTHING (for now)
        }
    }

    public manageRoom = (room: Room): void => {
        this.managedRoles.forEach((role: RoleDefinition) => this.handleRole(role, room));

        room.find(FIND_MY_CREEPS).forEach((creep: Creep) => {
            if (creep.ticksToLive !== undefined && creep.ticksToLive < 25) {
                creep.say(Icon.RECYCLE);
                creep.recycle();
            } else {
                this.managedRoles.forEach((role: RoleDefinition) => {
                    if (creep.memory.role === role.name) {
                        role.run(creep);
                    }
                });
            }
        });
    }

    public updateUI(room: Room) {
        // DO NOTHING
    }
}

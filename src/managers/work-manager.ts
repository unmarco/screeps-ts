export class WorkManager implements Manager {

    private managedRoles: Role[];

    constructor(roles: Role[]) {
        this.managedRoles = roles;
    }

    public doBefore = () => {
        // DO NOTHING
    }

    public manageRoom = (room: Room): void => {
        room.find(FIND_MY_CREEPS, {
            filter: (c: Creep) => _.has(c.memory, 'role')
        }).forEach((creep: Creep) => {
            const nCreep = creep as Creep;
            this.managedRoles.forEach((role: Role) => {
                if ((nCreep.memory as CreepMemory).role === role.name) {
                    role.run(nCreep);
                }
            });
        });
    }
}

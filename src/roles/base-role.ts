import { RoleName } from "./role-util";

export abstract class BaseRole implements RoleDefinition {
    public name: RoleName;

    constructor(name: RoleName) {
        this.name = name;
    }

    public checkSpawnPreconditions(room: Room) {
        return true; // Default implementation
    }

    public config(data?: any) { /* default implementation does nothing */ }

    public abstract run(creep: Creep): void;

}

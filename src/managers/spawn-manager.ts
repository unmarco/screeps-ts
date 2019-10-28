import { getByRole, RoleName } from "roles/role-util";
import { Role, WorkerFlagMemory, RoomMemory, Manager, TiersByRole } from "types";

/*
  CARRY 50
  MOVE 50
  WORK 100

  ATTACK 80
  RANGED_ATTACK 150
  HEAL 250
  TOUGH 10
  CLAIM 600
 */

const BodyTier: TiersByRole = {
    builder: {
        1: [CARRY, WORK, MOVE],
        2: [CARRY, WORK, WORK, MOVE, MOVE, MOVE],
        3: [CARRY, CARRY, WORK, WORK, WORK, MOVE, MOVE, MOVE]
    },
    harvester: {
        1: [CARRY, WORK, MOVE],
        2: [CARRY, WORK, WORK, MOVE, MOVE, MOVE],
        3: [CARRY, CARRY, WORK, WORK, WORK, MOVE, MOVE, MOVE]
    },
    repairer: {
        1: [CARRY, WORK, MOVE],
        2: [CARRY, WORK, WORK, MOVE, MOVE, MOVE],
        3: [CARRY, CARRY, WORK, WORK, WORK, MOVE, MOVE, MOVE]
    },
    upgrader: {
        1: [CARRY, WORK, MOVE],
        2: [CARRY, WORK, WORK, MOVE, MOVE, MOVE],
        3: [CARRY, CARRY, WORK, WORK, WORK, MOVE, MOVE, MOVE]
    }
};

export class SpawnManager implements Manager {

    private managedRoles: Role[];

    constructor(roles: Role[]) {
        this.managedRoles = roles;
    }

    private bodyCost = (body: BodyPartConstant[]): number => {
        return body.reduce((cost: number, part: BodyPartConstant) => cost + BODYPART_COST[part], 0);
    }

    private attemptSpawnWorker = _.curry((spawn: StructureSpawn, tier: number, roleName: RoleName) => {
        const body = BodyTier[roleName][tier];
        const cost = this.bodyCost(body);
        if (spawn.room.energyAvailable >= cost && !spawn.spawning) {
            console.log(`Spawning a new creep with role: ${roleName}`);
            spawn.spawnCreep(body, roleName + Game.time, {
                memory: {
                    role: roleName,
                    tier,
                    room: spawn.room.name,
                    working: false
                }
            });
        }

    });

    /**
     * Automatically delete memory of missing creeps
     */
    public handleDeadCreeps = () => {
        for (const name in Memory.creeps) {
            if (!(name in Game.creeps)) {
                delete Memory.creeps[name];
            }
        }
    }

    public doBefore = () => {
        this.handleDeadCreeps();
    }

    public manageRoom = (room: Room): void => {
        const spawns = room.find(FIND_MY_STRUCTURES, {
            filter: (s: AnyOwnedStructure) => {
                return s.structureType === STRUCTURE_SPAWN && !s.spawning
            }
        }) as StructureSpawn[];

        if (!_.isEmpty(spawns)) {
            const limits = (room.memory as RoomMemory).limits;
            const tiers = (room.memory as RoomMemory).tiers;

            const spawner = this.attemptSpawnWorker(spawns[0]);
            this.managedRoles.forEach((role: Role) => {
                const foundCreeps = getByRole(role.name);
                if (foundCreeps && foundCreeps.length < limits[role.name]) {
                    const tier: number = tiers[role.name];
                    spawner(tier, role.name);
                }
            });
        }
    }
}

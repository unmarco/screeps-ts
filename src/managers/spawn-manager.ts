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
        TIER_1: [CARRY, WORK, WORK, MOVE, MOVE],
        TIER_2: [CARRY, WORK, WORK, MOVE, MOVE, MOVE],
        TIER_3: [CARRY, CARRY, WORK, WORK, WORK, MOVE, MOVE, MOVE]
    },
    harvester: {
        TIER_1: [CARRY, WORK, MOVE],
        TIER_2: [CARRY, WORK, WORK, MOVE, MOVE, MOVE],
        TIER_3: [CARRY, CARRY, WORK, WORK, WORK, MOVE, MOVE, MOVE]
    },
    repairer: {
        TIER_1: [CARRY, WORK, WORK, MOVE, MOVE],
        TIER_2: [CARRY, WORK, WORK, MOVE, MOVE, MOVE],
        TIER_3: [CARRY, CARRY, WORK, WORK, WORK, MOVE, MOVE, MOVE]
    },
    upgrader: {
        TIER_1: [CARRY, WORK, WORK, MOVE, MOVE],
        TIER_2: [CARRY, WORK, WORK, MOVE, MOVE, MOVE],
        TIER_3: [CARRY, CARRY, WORK, WORK, WORK, MOVE, MOVE, MOVE]
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

    private attemptSpawnWorker = _.curry((spawn: StructureSpawn, tier: string, roleName: RoleName) => {
        const body = BodyTier[roleName][tier];
        const cost = this.bodyCost(body);
        if (spawn.room.energyAvailable >= cost && !spawn.spawning) {
            console.log(`Spawning a ${roleName} creep`);
            spawn.spawnCreep(body, roleName + Game.time, {
                memory: {
                    role: roleName,
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
        const limits = (room.memory as RoomMemory).limits;

        const spawns = room.find(FIND_MY_STRUCTURES, {
            filter: (s: AnyOwnedStructure) => {
                return s.structureType === STRUCTURE_SPAWN && !s.spawning
            }
        }) as StructureSpawn[];

        if (!_.isEmpty(spawns)) {
            const spawner = this.attemptSpawnWorker(spawns[0]);
            this.managedRoles.forEach((role: Role) => {
                const foundCreeps = getByRole(role.name);
                if (foundCreeps && foundCreeps.length < limits[role.name]) {
                    const flagName = role.name.substr(0, 1).toUpperCase();
                    const flags = room.find(FIND_FLAGS, {
                        filter: (f: Flag) =>
                            f.name === flagName &&
                            (f.memory as WorkerFlagMemory).room === room.name
                    });
                    if (!_.isEmpty(flags)) {
                        const tier = (flags[0].memory as WorkerFlagMemory).tier;
                        spawner(tier)(role.name);
                    }
                }
            });

            // Visuals
            const v = new RoomVisual(room.name);

            const numHarvesters = getByRole(RoleName.HARVESTER).length;
            const maxHarvesters = (room.memory as RoomMemory).limits[RoleName.HARVESTER];
            v.text(`⚡ H: ${numHarvesters}/${maxHarvesters}`, 17, 18, { align: 'left' });

            const numUpgraders = getByRole(RoleName.UPGRADER).length;
            const maxUpgraders = (room.memory as RoomMemory).limits[RoleName.UPGRADER];
            v.text(`🔼 U: ${numUpgraders}/${maxUpgraders}`, 17, 19, { align: 'left' });

            const numBuilders = getByRole(RoleName.BUILDER).length;
            const maxBuilders = (room.memory as RoomMemory).limits[RoleName.BUILDER];
            v.text(`🔨 B: ${numBuilders}/${maxBuilders}`, 17, 20, { align: 'left' });

            const numRepairers = getByRole(RoleName.REPAIRER).length;
            const maxRepairers = (room.memory as RoomMemory).limits[RoleName.REPAIRER];
            v.text(`🔧 R: ${numRepairers}/${maxRepairers}`, 17, 21, { align: 'left' });
        }
    }
}

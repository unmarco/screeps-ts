import { getByRole, RoleName } from "roles/role-util";

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

/*
[CARRY,WORK,MOVE]
[CARRY,CARRY,WORK,WORK,MOVE,MOVE]
[CARRY,CARRY,CARRY,WORK,WORK,WORK,MOVE,MOVE,MOVE]
[CARRY,CARRY,CARRY,CARRY,WORK,WORK,WORK,WORK,MOVE,MOVE,MOVE,MOVE]
*/

export const BodyTier: TiersByRole = {
    builder: {
        1: [CARRY, WORK, MOVE],
        2: [CARRY, CARRY, WORK, WORK, MOVE, MOVE],
        3: [CARRY, CARRY, CARRY, WORK, WORK, WORK, MOVE, MOVE, MOVE],
        4: [CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE]
    },
    harvester: {
        1: [CARRY, WORK, MOVE],
        2: [CARRY, CARRY, WORK, WORK, MOVE, MOVE],
        3: [CARRY, CARRY, CARRY, WORK, WORK, WORK, MOVE, MOVE, MOVE],
        4: [CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE]
    },
    repairer: {
        1: [CARRY, WORK, MOVE],
        2: [CARRY, CARRY, WORK, WORK, MOVE, MOVE],
        3: [CARRY, CARRY, CARRY, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE],
        4: [CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE]
    },
    upgrader: {
        1: [CARRY, WORK, MOVE],
        2: [CARRY, CARRY, WORK, WORK, MOVE, MOVE],
        3: [CARRY, CARRY, CARRY, WORK, WORK, WORK, MOVE, MOVE, MOVE],
        4: [CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE]
    }
};

export class SpawnManager implements Manager {

    private managedRoles: RoleDefinition[];

    constructor(roles: RoleDefinition[]) {
        this.managedRoles = roles;
    }

    private attemptSpawnWorker = _.curry((spawn: StructureSpawn, tier: number, roleName: string) => {
        const body = BodyTier[roleName][tier];
        const cost = global.bodyCost(body);
        if (spawn.room.energyAvailable >= cost && !spawn.spawning) {
            console.log(`New Creep [Room: ${spawn.room.name}, Spawn: ${spawn.name}, Role: ${roleName}, Tier: ${tier}]`);
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
            const limits = room.memory.limits;
            const tiers = room.memory.tiers;

            const spawner = this.attemptSpawnWorker(spawns[0]);
            this.managedRoles.forEach((role: RoleDefinition) => {
                const foundCreeps = getByRole(role.name);
                if (foundCreeps && foundCreeps.length < limits[role.name]) {
                    const tier: number = tiers[role.name];
                    spawner(tier, role.name);
                }
            });
        }
    }

    public updateUI(room: Room) {
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

        v.text(`⚡: ${room.energyAvailable}/${room.energyCapacityAvailable}`, 17, 22, { align: 'left' });
    }
}

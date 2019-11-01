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

    public name = "SpawnManager";

    private managedRoles: RoleDefinition[];

    constructor(roles: RoleDefinition[]) {
        this.managedRoles = roles;
    }

    private attemptSpawnWorker = _.curry((spawn: StructureSpawn, tier: number, roleName: string): boolean => {
        // console.log(`Attempting to spawn a ${roleName}, tier ${tier}`);
        const body = BodyTier[roleName][tier];
        const cost = global.bodyCost(body);
        if (spawn.room.energyAvailable >= cost && !spawn.spawning) {
            console.log(`New Creep [Room: ${spawn.room.name}, Spawn: ${spawn.name}, Role: ${roleName}, Tier: ${tier}]`);
            spawn.spawnCreep(body, `T${tier}_${roleName}_${Game.time}`, {
                memory: {
                    role: roleName,
                    tier,
                    room: spawn.room.name,
                    working: false
                }
            });
            return true;
        }
        return false;
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
        const priorities = room.memory.priorities;
        this.managedRoles.sort((a: RoleDefinition, b: RoleDefinition) => {
            return priorities[b.name] - priorities[a.name];
        });
        const spawns = room.find(FIND_MY_STRUCTURES, {
            filter: (s: AnyOwnedStructure) => {
                return s.structureType === STRUCTURE_SPAWN && !s.spawning
            }
        }) as StructureSpawn[];

        if (!_.isEmpty(spawns)) {
            const limits = room.memory.limits;
            const tiers = room.memory.tiers;

            const spawner = this.attemptSpawnWorker(spawns[0]);
            for (const role of this.managedRoles) {
                const foundCreeps = getByRole(role.name);
                // console.log(`Maybe spawn a ${role.name}`);
                if (foundCreeps.length < limits[role.name]) {
                    const tier: number = tiers[role.name];
                    const result = spawner(tier, role.name);
                    if (result) {
                        // console.log(`Yep, a ${role.name}`);
                        break;
                    }
                } else {
                    // console.log(`Nope, not a ${role.name}`);
                }
            }
        } else {
            // console.log('No spawns');
        }
    }

    public updateUI(room: Room) {
        const v = new RoomVisual(room.name);

        const priorities = room.memory.priorities;
        this.managedRoles.sort((a: RoleDefinition, b: RoleDefinition) => {
            return priorities[b.name] - priorities[a.name];
        });

        let startY = 18;

        for (const roleName in priorities) {
            const num = getByRole(roleName).length;
            const tier = room.memory.tiers[roleName];
            const max = room.memory.limits[roleName];
            v.text(`${roleName}s: T${tier} ${num}/${max}`, 12, startY++, { align: 'right' });
        }

        v.text(`⚡: ${room.energyAvailable}/${room.energyCapacityAvailable}`, 12, startY, { align: 'right' });
    }
}

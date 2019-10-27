import { RoleBuilder } from "roles/role-builder";
import { RoleHarvester } from "roles/role-harvester";
import { RoleRepairer } from "roles/role-repairer";
import { RoleUpgrader } from "roles/role-upgrader";
import { RoleName } from "roles/role-util";
import { ErrorMapper } from "utils/ErrorMapper";

const maxHarvesters = 3;
const maxUpgraders = 2;
const maxBuilders = 2;
const maxRepairers = 1;

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
    TIER_1: [CARRY, WORK, WORK, MOVE, MOVE],
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

const getByRole = (role: string): Creep[] => _.filter(Game.creeps,
  (c: Creep) => c.memory.role === role)

const bodyCost = (body: BodyPartConstant[]) => {
  return body.reduce((cost: number, part: BodyPartConstant) => cost + BODYPART_COST[part], 0);
};

const attemptSpawnWorker = _.curry((spawn: StructureSpawn, tier: string, roleName: RoleName) => {
  const body = BodyTier[roleName][tier];
  const cost = bodyCost(body);
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

export const loop = ErrorMapper.wrapLoop(() => {
  // console.log(`Current game tick is ${Game.time}`);

  const spawn1: StructureSpawn = Game.spawns['spawn-1'];
  const controller: StructureController | null = Game.getObjectById('59f1a3b782100e1594f3be39');

  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }

  const allCreeps: CreepCollection[] = [
    {
      creeps: getByRole(RoleName.HARVESTER),
      role: RoleName.HARVESTER
    },
    {
      creeps: getByRole(RoleName.BUILDER),
      role: RoleName.BUILDER
    },
    {
      creeps: getByRole(RoleName.UPGRADER),
      role: RoleName.UPGRADER
    },
    {
      creeps: getByRole(RoleName.REPAIRER),
      role: RoleName.REPAIRER
    }
  ];

  // The Creep Spawner
  const spawner = attemptSpawnWorker(spawn1)('TIER_1');

  const foundHarvesters = _.find(allCreeps, (c: CreepCollection) => c.role === RoleName.HARVESTER);
  if (foundHarvesters && foundHarvesters.creeps.length < maxHarvesters) {
    spawner(RoleName.HARVESTER);
  }

  const foundUpgraders = _.find(allCreeps, (c: CreepCollection) => c.role === RoleName.UPGRADER);
  if (foundUpgraders && foundUpgraders.creeps.length < maxUpgraders) {
    spawner(RoleName.UPGRADER);
  }

  const foundBuilders = _.find(allCreeps, (c: CreepCollection) => c.role === RoleName.BUILDER);
  if (foundBuilders && foundBuilders.creeps.length < maxBuilders) {
    spawner(RoleName.BUILDER);
  }

  const foundRepairers = _.find(allCreeps, (c: CreepCollection) => c.role === RoleName.REPAIRER);
  if (foundRepairers && foundRepairers.creeps.length < maxRepairers) {
    spawner(RoleName.REPAIRER);
  }


  // The Creep Loop
  _.forEach(Game.creeps, (creep: Creep) => {

    if (creep.memory.role) {
      switch (creep.memory.role) {

        case RoleName.BUILDER: {
          RoleBuilder.run(creep);
          break;
        }

        case RoleName.HARVESTER: {
          RoleHarvester.run(creep, spawn1);
          break;
        }

        case RoleName.UPGRADER: {
          if (controller !== null) {
            RoleUpgrader.run(creep, controller);
          }
          break;
        }

        case RoleName.REPAIRER: {
          RoleRepairer.run(creep);
          break;
        }

        default: console.error(`Creep '${creep.name}' has no recognized role or no role at all`);
      }
    }

  });

  // Visuals
  const v = new RoomVisual('E11N18');
  v.text(`⚡ Harvesters: ${foundHarvesters ? foundHarvesters.creeps.length : 0}`, 17, 18, { align: 'left' });
  v.text(`🔼 Upgraders: ${foundUpgraders ? foundUpgraders.creeps.length : 0}`, 17, 19, { align: 'left' });
  v.text(`🔨 Builders: ${foundBuilders ? foundBuilders.creeps.length : 0}`, 17, 20, { align: 'left' });
  v.text(`🔧 Repairers: ${foundRepairers ? foundRepairers.creeps.length : 0}`, 17, 21, { align: 'left' });

});

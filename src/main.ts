import { RoleBuilder } from "roles/role-builder";
import { RoleHarvester } from "roles/role-harvester";
import { RoleUpgrader } from "roles/role-upgrader";
import { ErrorMapper } from "utils/ErrorMapper";

const maxBuilders = 2;
const maxHarvesters = 2;
const maxUpgraders = 3;

const getByRole = (role: string): Creep[] => _.filter(Game.creeps,
  (c: Creep) => c.memory.role === role)

const bodyCost = (body: BodyPartConstant[]) => {
  return body.reduce((cost: number, part: BodyPartConstant) => {
    return cost + BODYPART_COST[part];
  }, 0);
};

const enum RoleName {
  BUILDER = 'builder',
  HARVESTER = 'harvester',
  UPGRADER = 'upgrader'
};

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
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
    }
  ];

  const foundHarvesters = _.find(allCreeps, (c: CreepCollection) => c.role === RoleName.HARVESTER);
  if (foundHarvesters && foundHarvesters.creeps.length < maxHarvesters) {
    const cost = bodyCost([CARRY, WORK, MOVE]);
    if (spawn1.room.energyAvailable >= cost) {
      console.log(`Spawning a ${RoleName.HARVESTER} creep`);
      spawn1.spawnCreep([CARRY, WORK, MOVE], RoleName.HARVESTER + Game.time, {
        memory: {
          role: RoleName.HARVESTER,
          room: spawn1.room.name,
          working: false
        }
      });
    }
  }

  const foundUpgraders = _.find(allCreeps, (c: CreepCollection) => c.role === RoleName.UPGRADER);
  if (foundUpgraders && foundUpgraders.creeps.length < maxUpgraders) {
    const cost = bodyCost([CARRY, WORK, MOVE]);
    if (spawn1.room.energyAvailable >= cost) {
      console.log(`Spawning a ${RoleName.UPGRADER} creep`);
      spawn1.spawnCreep([CARRY, WORK, MOVE], RoleName.UPGRADER + Game.time, {
        memory: {
          role: RoleName.UPGRADER,
          room: spawn1.room.name,
          working: false
        }
      });
    }
  }

  const foundBuilders = _.find(allCreeps, (c: CreepCollection) => c.role === RoleName.BUILDER);
  if (foundBuilders && foundBuilders.creeps.length < maxBuilders) {
    const cost = bodyCost([CARRY, WORK, MOVE]);
    if (spawn1.room.energyAvailable >= cost) {
      console.log(`Spawning a ${RoleName.BUILDER} creep`);
      spawn1.spawnCreep([CARRY, WORK, MOVE], RoleName.BUILDER + Game.time, {
        memory: {
          role: RoleName.BUILDER,
          room: spawn1.room.name,
          working: false
        }
      });
    }
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

        default: console.error(`Creep '${creep.name}' has no recognized role or no role at all`);
      }
    }

  });

});

import { RoleBuilder } from "roles/role-builder";
import { RoleHarvester } from "roles/role-harvester";
import { RoleRepairer } from "roles/role-repairer";
import { RoleUpgrader } from "roles/role-upgrader";
import { RoleName, getByRole } from "roles/role-util";
import { ErrorMapper } from "utils/ErrorMapper";
import { WorkManager } from "managers/work-manager";

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

const workManager: WorkManager = new WorkManager([
  RoleHarvester,
  RoleUpgrader,
  RoleBuilder,
  RoleRepairer
]);

export const loop = ErrorMapper.wrapLoop(() => {
  // console.log(`Current game tick is ${Game.time}`);

  const spawn1: StructureSpawn = Game.spawns['spawn-1'];
  const controller: StructureController | null = Game.getObjectById('59f1a3b782100e1594f3be39');

  const maxHarvesters = (Game.flags['H'].memory as WorkerFlagMemory).maxCount;
  const maxUpgraders = (Game.flags['U'].memory as WorkerFlagMemory).maxCount;
  const maxBuilders = (Game.flags['B'].memory as WorkerFlagMemory).maxCount;
  const maxRepairers = (Game.flags['R'].memory as WorkerFlagMemory).maxCount;

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
  const spawner = attemptSpawnWorker(spawn1);

  const foundHarvesters = _.find(allCreeps, (c: CreepCollection) => c.role === RoleName.HARVESTER);
  if (foundHarvesters && foundHarvesters.creeps.length < maxHarvesters) {
    const hFlag = Game.flags['H'];
    const hTier = (hFlag.memory as WorkerFlagMemory).tier;
    spawner(hTier)(RoleName.HARVESTER);
  }

  const foundUpgraders = _.find(allCreeps, (c: CreepCollection) => c.role === RoleName.UPGRADER);
  if (foundUpgraders && foundUpgraders.creeps.length < maxUpgraders) {
    const uFlag = Game.flags['H'];
    const uTier = (uFlag.memory as WorkerFlagMemory).tier;
    spawner(uTier)(RoleName.UPGRADER);
  }

  const foundBuilders = _.find(allCreeps, (c: CreepCollection) => c.role === RoleName.BUILDER);
  if (foundBuilders && foundBuilders.creeps.length < maxBuilders) {
    const bFlag = Game.flags['H'];
    const bTier = (bFlag.memory as WorkerFlagMemory).tier;
    spawner(bTier)(RoleName.BUILDER);
  }

  const foundRepairers = _.find(allCreeps, (c: CreepCollection) => c.role === RoleName.REPAIRER);
  if (foundRepairers && foundRepairers.creeps.length < maxRepairers) {
    const rFlag = Game.flags['H'];
    const rTier = (rFlag.memory as WorkerFlagMemory).tier;
    spawner(rTier)(RoleName.REPAIRER);
  }

  workManager.manageRoom(Game.rooms['E11N18']);

  // Visuals
  const v = new RoomVisual('E11N18');

  const numHarvesters = foundHarvesters ? foundHarvesters.creeps.length : 0;
  v.text(`⚡ H: ${numHarvesters}/${maxHarvesters}`, 17, 18, { align: 'left' });

  const numUpgraders = foundUpgraders ? foundUpgraders.creeps.length : 0;
  v.text(`🔼 U: ${numUpgraders}/${maxUpgraders}`, 17, 19, { align: 'left' });

  const numBuilders = foundBuilders ? foundBuilders.creeps.length : 0;
  v.text(`🔨 B: ${numBuilders}/${maxBuilders}`, 17, 20, { align: 'left' });

  const numRepairers = foundRepairers ? foundRepairers.creeps.length : 0;
  v.text(`🔧 R: ${numRepairers}/${maxRepairers}`, 17, 21, { align: 'left' });

});

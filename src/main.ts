import { ErrorMapper } from "utils/ErrorMapper";

import { RoleBuilder } from "roles/role-builder";
import { RoleHarvester } from "roles/role-harvester";
import { RoleRepairer } from "roles/role-repairer";
import { RoleUpgrader } from "roles/role-upgrader";

import { WorkManager } from "managers/work-manager";
import { SpawnManager, BodyTier } from "managers/spawn-manager";
import { getByRole, RoleName } from "roles/role-util";
import { DefenseManager } from "managers/defense-manager";
import { GeneralManager } from "managers/general-manager";

// console.log('------------------------ DEPLOY');

global.setLimit = (roomParam: string | Room, roleName: RoleName, limit: number) => {
  const room = typeof roomParam === 'string' ? Game.rooms[roomParam] : roomParam;
  if (room !== undefined && room.memory.limits !== undefined) {
    room.memory.limits[roleName] = limit;
    console.log(room.memory.limits);
  }
};

global.setTier = (roomParam: string | Room, roleName: RoleName, tier: number) => {
  const room = typeof roomParam === 'string' ? Game.rooms[roomParam] : roomParam;
  if (room !== undefined && room.memory.tiers !== undefined) {
    room.memory.tiers[roleName] = tier;
    console.log(room.memory.tiers);
  }
};

global.bodyCost = (body: BodyPartConstant[]): number => {
  return body.reduce((cost: number, part: BodyPartConstant) => cost + BODYPART_COST[part], 0);
}


global.spawnWorker = (roomName: string, spawnName: string, roleName: string, tier: number) => {
  const room = Game.rooms[roomName];
  const spawns = room.find(FIND_MY_STRUCTURES, {
    filter: (s: AnyOwnedStructure) => s.structureType === STRUCTURE_SPAWN && s.name === spawnName
  })
  const spawn = spawns[0] as StructureSpawn;

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
}

console.log('------------------------ DEPLOY');

const managedRoles = [
  RoleHarvester, RoleUpgrader, RoleBuilder, RoleRepairer
];

const managers: Manager[] = [
  new GeneralManager(),
  new SpawnManager(managedRoles),
  new WorkManager(managedRoles),
  new DefenseManager(),
];

export const loop = ErrorMapper.wrapLoop(() => {



  managers.forEach((manager: Manager) => {

    manager.doBefore();

    _.forEach(Game.rooms, (room: Room) => {
      manager.manageRoom(room);
      manager.updateUI(room);
    });

  });

});

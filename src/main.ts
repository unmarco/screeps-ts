import { ErrorMapper } from "utils/ErrorMapper";

import { RoleBuilder } from "roles/role-builder";
import { RoleHarvester } from "roles/role-harvester";
import { RoleRepairer } from "roles/role-repairer";
import { RoleUpgrader } from "roles/role-upgrader";

import { WorkManager } from "managers/work-manager";
import { SpawnManager } from "managers/spawn-manager";

const spawnManager: SpawnManager = new SpawnManager([
  RoleHarvester,
  RoleUpgrader,
  RoleBuilder,
  RoleRepairer
]);

const workManager: WorkManager = new WorkManager([
  RoleHarvester,
  RoleUpgrader,
  RoleBuilder,
  RoleRepairer
]);

export const loop = ErrorMapper.wrapLoop(() => {
  // console.log(`Current game tick is ${Game.time}`);

  spawnManager.handleDeadCreeps();

  _.forEach(Game.rooms, (room: Room) => {
    spawnManager.manageRoom(room)
    workManager.manageRoom(room);
  });

});

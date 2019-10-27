import { ErrorMapper } from "utils/ErrorMapper";

import { RoleBuilder } from "roles/role-builder";
import { RoleHarvester } from "roles/role-harvester";
import { RoleRepairer } from "roles/role-repairer";
import { RoleUpgrader } from "roles/role-upgrader";

import { WorkManager } from "managers/work-manager";
import { SpawnManager } from "managers/spawn-manager";
import { Manager } from "types";

const managedRoles = [
  RoleHarvester, RoleUpgrader, RoleBuilder, RoleRepairer
];

const managers: Manager[] = [
  new SpawnManager(managedRoles),
  new WorkManager(managedRoles)
];

export const loop = ErrorMapper.wrapLoop(() => {

  managers.forEach((manager: Manager) => {

    manager.doBefore();

    _.forEach(Game.rooms, (room: Room) => {
      manager.manageRoom(room);
    });

  });

});

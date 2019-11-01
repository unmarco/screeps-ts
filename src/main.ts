import { ErrorMapper } from "utils/ErrorMapper";

import { BuilderRole } from "roles/role-builder";
import { HarvesterRole } from "roles/role-harvester";
import { RepairerRole } from "roles/role-repairer";
import { UpgraderRole } from "roles/role-upgrader";

import { WorkManager } from "managers/work-manager";
import { SpawnManager, BodyTier } from "managers/spawn-manager";
import { DefenseManager } from "managers/defense-manager";
import { GeneralManager } from "managers/general-manager";

import "globals";

console.log('------------------------ DEPLOY');

export const loop = ErrorMapper.wrapLoop(() => {

  const managedRoles: RoleDefinition[] = [
    new HarvesterRole(),
    new UpgraderRole(),
    new BuilderRole(),
    new RepairerRole()
  ];

  const managers: Manager[] = [
    new GeneralManager(),
    new SpawnManager(managedRoles),
    new WorkManager(managedRoles),
    new DefenseManager(),
  ];


  managers.forEach((manager: Manager) => {

    manager.doBefore();

    _.forEach(Game.rooms, (room: Room) => {
      manager.manageRoom(room);
      manager.updateUI(room);
    });

  });

});

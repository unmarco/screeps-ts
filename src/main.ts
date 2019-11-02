import { ErrorMapper } from "utils/ErrorMapper";

import { BuilderRole } from "roles/role-builder";
import { RepairerRole } from "roles/role-repairer";
import { UpgraderRole } from "roles/role-upgrader";

import { WorkManager } from "managers/work-manager";
import { SpawnManager } from "managers/spawn-manager";
import { DefenseManager } from "managers/defense-manager";
import { GeneralManager } from "managers/general-manager";

import "globals";
import { MinerRole } from "roles/role-miner";
import { HaulerRole } from "roles/role-hauler";

console.log('------------------------ DEPLOY');

const managedRoles: RoleDefinition[] = [
  new MinerRole(),
  new HaulerRole(),
  new UpgraderRole(),
  new BuilderRole(),
  new RepairerRole(),
];


const managers: Manager[] = [
  new GeneralManager(managedRoles),
  new SpawnManager(managedRoles),
  new WorkManager(managedRoles),
  new DefenseManager(),
];


export const loop = ErrorMapper.wrapLoop(() => {



  managers.forEach((manager: Manager) => {

    manager.doBefore();

    _.forEach(Game.rooms, (room: Room) => {
      // console.log(`Calling the ${manager.name}`);
      manager.manageRoom(room);
      manager.updateUI(room);
    });

  });

});

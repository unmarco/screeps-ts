import { ErrorMapper } from "utils/ErrorMapper";

import { RoleBuilder } from "roles/role-builder";
import { RoleHarvester } from "roles/role-harvester";
import { RoleRepairer } from "roles/role-repairer";
import { RoleUpgrader } from "roles/role-upgrader";

import { WorkManager } from "managers/work-manager";
import { SpawnManager } from "managers/spawn-manager";
import { Manager, RoomMemory } from "types";
import { getByRole, RoleName } from "roles/role-util";

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

      // Visuals
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
    });

  });

});

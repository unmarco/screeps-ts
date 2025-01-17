import { RoleName } from "roles/role-util";
import Icon from "icons";

export class WorkManager implements Manager {

  public name = "WorkManager";

  private managedRoles: RoleDefinition[];

  constructor(roles: RoleDefinition[]) {
    this.managedRoles = roles;
  }

  public doBefore = () => {
    // DO NOTHING
  }

  public manageRoom = (room: Room): void => {
    if (!room.memory.sinks || !room.memory.storages) {
      return;
    }
    this.managedRoles.forEach((role: RoleDefinition) => {
      switch (role.name) {
        case RoleName.HAULER:
          const primarySinks = _.filter(room.memory.sinks!, (s: SinkData) => s.store.free > 0).map((s: SinkData) => {
            return Game.getObjectById(s.id) as AnyStructure;
          });
          const secondarySinks = _.filter(room.memory.storages!, (s: ResourceStorageStructure) => s.store.free > 0)
            .map((s: SinkData) => {
              return Game.getObjectById(s.id) as AnyStructure;
            });

          primarySinks.sort((a, b) => {
            const sinkA = (a as PrimarySinkType);
            const sinkB = (b as PrimarySinkType);
            const diffA = sinkA.energyCapacity - sinkA.energy;
            const diffB = sinkB.energyCapacity - sinkB.energy;
            return diffB - diffA;
          })

          secondarySinks.sort((a, b) => {
            const sinkA = (a as SecondarySinkType);
            const sinkB = (b as SecondarySinkType);
            const diffA = sinkA.storeCapacity - sinkA.store[RESOURCE_ENERGY];
            const diffB = sinkB.storeCapacity - sinkB.store[RESOURCE_ENERGY];
            return diffB - diffA;
          })

          role.config({
            primarySinks, secondarySinks,
            primarySink: primarySinks[0],
            secondarySink: secondarySinks[0]
          });

        default: // DO NOTHING (for now)
      }
    });

    room.find(FIND_MY_CREEPS).forEach((creep: Creep) => {
      if (creep.ticksToLive !== undefined && creep.ticksToLive < 25) {
        creep.say(Icon.RECYCLE);
        creep.recycle();
      } else {
        this.managedRoles.forEach((role: RoleDefinition) => {
          if (creep.memory.role === role.name) {
            role.run(creep);
          }
        });
      }
    });
  }

  public updateUI(room: Room) {
    // DO NOTHING
  }
}

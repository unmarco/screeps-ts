import { BodyTier } from "managers/spawn-manager";
import { RoleName, harvestEnergy } from "roles/role-util";
import Icon from "icons";

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

// proto/creep.ts
Creep.prototype.getEnergy = function (useContainers: boolean = true, useSources: boolean = true, useDroplets: boolean = false) {
  const containers = _.filter(this.room.memory.storages, (s: ResourceStorageStructure) => s.store.used > 0);
  const droppedEnergy = this.room.memory.droplets;
  const sources = this.room.find(FIND_SOURCES_ACTIVE);

  if (useContainers && containers.length > 0) {
    const target = Game.getObjectById(containers[0].id) as (StructureStorage | StructureContainer);
    if (target) {
      this.memory.currentTarget = {
        id: target.id,
        pos: target.pos
      };
      this.say(Icon.ACTION_RECHARGE + Icon.TARGET_CONTAINER);
      if (this.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        this.moveTo(target);
      }
    }
  } else if (useDroplets && droppedEnergy.length > 0) {
    const target = Game.getObjectById(droppedEnergy[0].id) as Resource;
    if (target) {
      this.say(Icon.ACTION_RECHARGE + Icon.ACTION_PICKUP);

      if (!this.pos.isNearTo(target.pos)) {
        this.moveTo(target.pos);
      } else {
        this.pickup(target);
      }
    }
  } else if (useSources && sources.length > 0) {
    sources.sort((a: Source, b: Source) => {

      const energyA = a.energy;
      const rangeToA = this.pos.getRangeTo(a);

      const energyB = b.energy;
      const rangeToB = this.pos.getRangeTo(b);

      if (rangeToA < rangeToB) {
        return -1;
      } else if (rangeToA > rangeToB) {
        return 1;
      } else {
        if (energyA > energyB) {
          return -1;
        } else if (energyA < energyB) {
          return 1;
        } else {
          return 0;
        }
      }

    });
    if (sources[0] !== null) {
      this.memory.currentTarget = {
        id: sources[0].id,
        pos: sources[0].pos
      };
      this.say(Icon.ACTION_RECHARGE + Icon.TARGET_SOURCE);
      if (this.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
        this.moveTo(sources[0], {
          visualizePathStyle: {
            stroke: '#0000FF'
          }
        });
      }
    }
  } else {
    if (useSources) {
      console.log('NO SOURCES!');
    }
    if (useContainers) {
      console.log('NO CONTAINERS!');
    }
  }
};

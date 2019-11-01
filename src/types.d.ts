// interface StoreDefinition {
//   energy: number;
//   getCapacity(resource?: ResourceConstant): number;
//   getFreeCapacity(resource?: ResourceConstant): number;
//   getUsedCapacity(resource?: ResourceConstant): number;
// }

// interface Creep { store: Store }
// interface StructureContainer { store: Store }
// interface StructureSpawn { store: Store }
// interface StructureExtension { store: Store }
// interface StructureTower { store: Store }



interface TiersByRole {
  [roleName: string]: Tiers;
}

interface Tiers {
  [tierName: number]: BodyPartConstant[];
}

interface Manager {
  doBefore(): void;
  manageRoom(room: Room): void;
}

interface Role {
  name: string;
  run: (creep: Creep) => void;
}

// Memory extension
interface CreepMemory {
  role: string;
  tier: number;
  room: string;
  working: boolean;
  currentTarget?: {
    id: string;
    pos: RoomPosition;
  }
}

interface RoomMemory {
  limits: {
    [roleName: string]: number;
  };

  tiers: {
    [roleName: string]: number;
  }

  hits: {
    walls: number;
    ramparts: number;
  }
}

interface ConfigFlagMemory {
  room: string;
  chattyCreeps: boolean;
  wallHitpoints: number;
  rampartHitpoints: number;
}

interface WorkerFlagMemory {
  room: string;
  role: string;
}

interface Memory {
  uuid: number;
  log: any;
}

// `global` extension samples
declare namespace NodeJS {
  interface Global {
    Role: string[]; // RoleName
    bodyCost(body: BodyPartConstant[]): number;
    setLimit(roomName: string, roleName: string, limit: number): void;
    setTier(roomName: string, roleName: string, tier: number): void;
    spawnWorker(roomName: string, spawnName: string, roleName: string, tier: number): void;
  }
}

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
  name: string;
  doBefore(): void;
  manageRoom(room: Room): void;
  updateUI(room: Room): void;
}

interface RoleDefinition {
  name: string;
  config: (data?: any) => void;
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
  };
}

interface StructureData {
  id: string;
  type: StructureConstant;
  pos: RoomPosition;
  my: boolean;
}

interface DroppedResourceData {
  id: string;
  resource: ResourceConstant;
  pos: RoomPosition;
  amount: number;
}

interface ResourceStore {
  capacity: number;
  used: number;
  free: number;
}

interface ResourceStorageStructure extends StructureData {
  resource: ResourceConstant;
  store: ResourceStore;
}

interface SourceData {
  id: string;
  pos: RoomPosition;
  active: boolean;
  resource: ResourceConstant;
  available: number;
}

interface SinkData extends StructureData {
  type: StructureConstant;
  resource: ResourceConstant;
  store: ResourceStore;
}

interface ConstructionSiteData extends StructureData {
  progress: number;
  progressTotal: number;
  ratio: number;
}

interface ReparirTargetData extends StructureData {
  hits: number;
  hitsMax: number;
  ratio: number;
}

interface DefenseStructureData extends StructureData {
  hits: number;
  hitsMax: number;
  ratio: number;
}

interface RoomMemory {
  structures: StructureData[];
  sources: SourceData[];
  sinks: SinkData[];
  storages: ResourceStorageStructure[];
  sites: ConstructionSiteData[];
  repairTargets: ReparirTargetData[];
  droplets: DroppedResourceData[];

  defenses: DefenseStructureData[];

  limits: {
    [roleName: string]: number;
  };

  priorities: {
    [roleName: string]: number;
  }

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

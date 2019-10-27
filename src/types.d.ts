// example declaration file - remove these and add your own custom typings

interface ConfigFlagMemory {
  room: string;
  chattyCreeps: boolean;
}

interface WorkerFlagMemory {
  room: string;
  role: string;
  tier: string;
  maxCount: number;
}

interface CreepCollection {
  role: string;
  creeps: Creep[];
}

interface TiersByRole {
  [roleName: string]: RoleTiers;
}

interface RoleTiers {
  [tierName: string]: BodyPartConstant[];
}

interface Role {
  run: (creep: Creep, s?: AnyStructure) => void;
}

// memory extension samples
interface CreepMemory {
  role: string;
  room: string;
  working: boolean;
}

interface Memory {
  uuid: number;
  log: any;
}

// `global` extension samples
declare namespace NodeJS {
  interface Global {
    log: any;
  }
}
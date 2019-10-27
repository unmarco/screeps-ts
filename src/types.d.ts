import { RoleName } from "roles/role-util";

// example declaration file - remove these and add your own custom typings

interface Manager {
  doBefore(): void;
  manageRoom(room: Room): void;
}

interface RoomMemory {
  limits: {
    [roleName: string]: number;
  };

  tiers: {
    [roleName: string]: number;
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
  // tier: number;
  // maxCount: number;
}

interface CreepCollection {
  role: string;
  creeps: Creep[];
}

interface TiersByRole {
  [roleName: string]: RoleTiers;
}

interface RoleTiers {
  [tierName: number]: BodyPartConstant[];
}

interface Role {
  name: RoleName;
  run: (creep: Creep) => void;
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

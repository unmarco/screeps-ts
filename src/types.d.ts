import { RoleName } from "roles/role-util";

// example declaration file - remove these and add your own custom typings

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
  name: RoleName;
  run: (creep: Creep) => void;
}

// Memory extension
interface CreepMemory {
  role: string;
  room: string;
  working: boolean;
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
}

interface Memory {
  uuid: number;
  log: any;
}

// `global` extension samples
// declare namespace NodeJS {
//   interface Global {
//     log: any;
//   }
// }

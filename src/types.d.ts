// example declaration file - remove these and add your own custom typings

interface CreepCollection {
  role: string;
  creeps: Creep[];
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

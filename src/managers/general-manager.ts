const defaultRoomMemory: RoomMemory = {
    limits: {
        harvesters: 2,
        upgraders: 2,
        builders: 1,
        repairers: 0
    },
    tiers: {
        harvester: 1,
        upgrader: 1,
        builder: 1,
        repairer: 1
    },
    hits: {
        walls: 100000,
        ramparts: 75000
    }
};

export class GeneralManager implements Manager {

    public doBefore(): void {
        // throw new Error("Method not implemented.");
    }

    private initStoragesMemory(room: Room) {
        const storages = room.find<StructureStorage | StructureContainer>(FIND_STRUCTURES, {
            filter: struct => {
                return (struct.structureType === STRUCTURE_STORAGE || struct.structureType === STRUCTURE_CONTAINER);
            }
        }).map((struct: StructureStorage | StructureContainer) => {
            const res = RESOURCE_ENERGY;
            const data: ResourceStorageStructure = {
                id: struct.id,
                pos: struct.pos,
                type: struct.structureType,
                resource: res,
                store: {
                    capacity: struct.storeCapacity,
                    used: struct.store[res],
                    free: struct.storeCapacity - struct.store[res]
                }
            };
            return data;
        });
        room.memory.storages = storages;
    }

    private initSinksMemory(room: Room) {
        const sinks = room.find(FIND_STRUCTURES, {
            filter: (s: AnyStructure) => {
                return (s.structureType === STRUCTURE_SPAWN) ||
                    (s.structureType === STRUCTURE_EXTENSION) ||
                    (s.structureType === STRUCTURE_TOWER)
            }
        }).map((s) => {
            const capacity = (s as StructureSpawn | StructureExtension | StructureTower).energyCapacity;
            const used = (s as StructureSpawn | StructureExtension | StructureTower).energy;
            const free = capacity - used;
            const sink: SinkData = {
                id: s.id,
                pos: s.pos,
                type: s.structureType,
                resource: RESOURCE_ENERGY,
                store: { capacity, used, free }
            };
            return sink;
        });
        sinks.sort((a: SinkData, b: SinkData) => b.store.free - a.store.free);
        room.memory.sinks = sinks;
    }

    private initSourcesMemory(room: Room) {
        const sources = room.find(FIND_SOURCES).map((s: Source) => {
            const data: SourceData = {
                id: s.id,
                pos: s.pos,
                resource: RESOURCE_ENERGY,
                active: s.energy > 0,
                available: s.energy
            }
            return data;
        });
        sources.sort((a: SourceData, b: SourceData) => b.available - a.available);
        room.memory.sources = sources;
    }

    private initLimitsAndTiers(room: Room) {
        if (room.memory.limits === undefined) {
            console.log(`GeneralManager: Setting default limits for room ${room.name}`)
            room.memory.limits = defaultRoomMemory.limits;
        }
        if (room.memory.tiers === undefined) {
            console.log(`GeneralManager: Setting default tiers for room ${room.name}`)
            room.memory.tiers = defaultRoomMemory.tiers;
        }
        if (room.memory.hits === undefined) {
            console.log(`GeneralManager: Setting default hits for room ${room.name}`)
            room.memory.hits = defaultRoomMemory.hits;
        }
    }

    public initMemory(room: Room) {
        this.initLimitsAndTiers(room);
        this.initSourcesMemory(room);
        this.initStoragesMemory(room);
        this.initSinksMemory(room);
    }

    public manageRoom(room: Room): void {
        if (Game.time % 10 === 0) {
            this.initMemory(room);
        }
    }

    public updateUI(room: Room) {
        // DO NOTHING
    }

}

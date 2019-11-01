const defaultRoomMemory: RoomMemory = {
    structures: [],
    sources: [],
    sinks: [],
    storages: [],
    sites: [],
    repairTargets: [],
    droplets: [],
    defenses: [],
    limits: {
        harvester: 2,
        upgrader: 2,
        builder: 1,
        repairer: 0
    },
    priorities: {
        harvester: 3,
        upgrader: 2,
        builder: 1,
        repairer: 0
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

    public name = "GeneralManager";

    public doBefore(): void {
        // DO NOTHING
    }

    private initStructuresMemory(room: Room) {
        const structures = room.find<AnyStructure>(FIND_STRUCTURES, {
            filter: s => s.structureType !== STRUCTURE_ROAD
        }).map((s: AnyStructure) => {
            const structure: StructureData = {
                id: s.id,
                type: s.structureType,
                pos: s.pos,
                my: s instanceof OwnedStructure ? s.my : false,
            };
            return structure;
        });
        room.memory.structures = structures;
    }

    private initStoragesMemory(room: Room) {
        const storages = _.filter(room.memory.structures, (s: StructureData) => s.type === STRUCTURE_CONTAINER)
            .map((sd: StructureData) => {
                const struct = Game.getObjectById(sd.id) as StructureContainer;
                const storageStructure: ResourceStorageStructure = {
                    id: struct.id,
                    pos: struct.pos,
                    type: struct.structureType,
                    resource: RESOURCE_ENERGY,
                    my: sd.my,
                    store: {
                        capacity: struct.storeCapacity,
                        used: struct.store[RESOURCE_ENERGY],
                        free: struct.storeCapacity - struct.store[RESOURCE_ENERGY]
                    }
                };
                return storageStructure;
            });
        room.memory.storages = storages;
    }

    private initDropletsMemory(room: Room) {
        const droplets = room.find(FIND_DROPPED_RESOURCES).map((d: Resource) => {
            const droplet: DroppedResourceData = {
                id: d.id,
                pos: d.pos,
                resource: d.resourceType,
                amount: d.amount
            }
            return droplet;
        });
        droplets.sort((a: DroppedResourceData, b: DroppedResourceData) => a.amount - b.amount);
        room.memory.droplets = droplets;
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
                my: s instanceof OwnedStructure ? s.my : false,
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

    private initConstructionSitesMemory(room: Room) {
        const sites = room.find(FIND_MY_CONSTRUCTION_SITES).map((s: ConstructionSite) => {
            const site: ConstructionSiteData = {
                id: s.id,
                type: s.structureType,
                my: true,
                pos: s.pos,
                progress: s.progress,
                progressTotal: s.progressTotal,
                ratio: s.progress / s.progressTotal
            }
            return site;
        });
        sites.sort((a: ConstructionSiteData, b: ConstructionSiteData) => b.ratio - a.ratio);
        room.memory.sites = sites;
    }

    private initRepairTargetsMemory(room: Room) {
        const wallHitpoints = room.memory.hits.walls;
        const rampartHitpoints = room.memory.hits.ramparts;
        const repairTargets = room.find(FIND_STRUCTURES, {
            filter: (s: AnyStructure) => {
                const isWall = s.structureType === STRUCTURE_WALL;
                const isRampart = s.structureType === STRUCTURE_RAMPART;
                const isWallOrRampart = isWall || isRampart;
                return (isWall && s.hits < wallHitpoints) ||
                    (isRampart && s.hits < rampartHitpoints) ||
                    (!isWallOrRampart && s.hits < s.hitsMax);
            }
        }).map((s: AnyStructure) => {
            const repairTarget: ReparirTargetData = {
                id: s.id,
                type: s.structureType,
                my: ('owner' in s) ? (room.controller !== undefined && s.owner === room.controller.owner) : false,
                pos: s.pos,
                hits: s.hits,
                hitsMax: s.hitsMax,
                ratio: s.hits / s.hitsMax
            }
            return repairTarget;
        });
        repairTargets.sort((a: ReparirTargetData, b: ReparirTargetData) => a.ratio - b.ratio);
        room.memory.repairTargets = repairTargets;
    }

    private initLimitsAndTiers(room: Room) {
        if (room.memory.limits === undefined) {
            console.log(`GeneralManager: Setting default limits for room ${room.name}`)
            room.memory.limits = defaultRoomMemory.limits;
        }
        if (room.memory.priorities === undefined) {
            console.log(`GeneralManager: Setting default priorities for room ${room.name}`)
            room.memory.priorities = defaultRoomMemory.priorities;
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
        this.initStructuresMemory(room);
        this.initLimitsAndTiers(room);
        this.initSourcesMemory(room);
        this.initStoragesMemory(room);
        this.initDropletsMemory(room);
        this.initSinksMemory(room);
        this.initConstructionSitesMemory(room);
        this.initRepairTargetsMemory(room);
    }

    public manageRoom(room: Room): void {
        this.initMemory(room);
    }

    public updateUI(room: Room) {
        // DO NOTHING
    }

}

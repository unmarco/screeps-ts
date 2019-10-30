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

    public manageRoom(room: Room): void {
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

}

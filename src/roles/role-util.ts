import Icon from "icons";

export const sortByDistance = _.curry(
    <T extends RoomPosition>(pos: RoomPosition, a: T, b: T) => pos.getRangeTo(b) - pos.getRangeTo(a)
);

export const isInRangeTo = _.curry(<T extends RoomPosition>(range: number, a: T, b: T): boolean => {
    return a.inRangeTo(b, range);
});

// ()

export const harvestEnergy = (creep: Creep, pathStyle: PolyStyle, useContainers: boolean = true) => {
    const containers = _.filter(creep.room.memory.storages, (s: ResourceStorageStructure) => s.store.used > 0);
    const droppedEnergy = creep.room.memory.droplets;
    const sources = creep.room.find(FIND_SOURCES_ACTIVE);

    const byDistance = sortByDistance(creep.pos);

    if (useContainers && containers.length > 0) {
        containers.sort(byDistance);
        const target = Game.getObjectById(containers[0].id) as (StructureStorage | StructureContainer);
        if (target) {
            creep.memory.currentTarget = {
                id: target.id,
                pos: target.pos
            };
            creep.say(Icon.ACTION_RECHARGE + Icon.TARGET_CONTAINER);
            if (creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        }
    } else if (droppedEnergy && droppedEnergy.length > 0) {
        const target = Game.getObjectById(droppedEnergy[0].id) as Resource;
        if (target) {
            creep.say(Icon.ACTION_RECHARGE + Icon.ACTION_PICKUP);

            if (!creep.pos.isNearTo(target.pos)) {
                creep.moveTo(target.pos);
            } else {
                creep.pickup(target);
            }
        }
    } else if (sources && sources.length > 0) {
        sources.sort((a: Source, b: Source) => {

            const energyA = a.energy;
            const rangeToA = creep.pos.getRangeTo(a);

            const energyB = b.energy;
            const rangeToB = creep.pos.getRangeTo(b);

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
            creep.memory.currentTarget = {
                id: sources[0].id,
                pos: sources[0].pos
            };
            creep.say(Icon.ACTION_RECHARGE + Icon.TARGET_SOURCE);
            if (creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0], {
                    visualizePathStyle: pathStyle
                });
            }
        }
    } else {
        console.log('NO SOURCES OR CONTAINERS');
    }
}

export enum RoleName {
    ALL = 'all',

    BUILDER = 'builder',
    HARVESTER = 'harvester',
    REPAIRER = 'repairer',
    UPGRADER = 'upgrader',

    HAULER = 'hauler',
    MINER = 'miner'
};

export const getByRole = (role: string): Creep[] => _.filter(Game.creeps,
    (c: Creep) => !c.spawning && c.memory.role === role);



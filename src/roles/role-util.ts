import Icon from "icons";

export const sortByDistance = _.curry(
    <T extends RoomPosition>(pos: RoomPosition, a: T, b: T) => pos.getRangeTo(b) - pos.getRangeTo(a)
);

export const isInRangeTo = _.curry(<T extends RoomPosition>(range: number, a: T, b: T): boolean => {
    return a.inRangeTo(b, range);
});

// ()

export const harvestEnergy = (creep: Creep, pathStyle: PolyStyle, useContainers: boolean = true) => {
    const containers = creep.room.find(FIND_STRUCTURES, {
        filter: (c: AnyStructure) => {
            return c.structureType === STRUCTURE_CONTAINER &&
                ((c as StructureContainer).store.getUsedCapacity() > 0);
        }
    });

    const sources = creep.room.find(FIND_SOURCES_ACTIVE);

    const droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {
        filter: (r: Resource) => r.resourceType === RESOURCE_ENERGY
    });

    const byDistance = sortByDistance(creep.pos);

    if (useContainers && containers.length > 0) {
        containers.sort(byDistance);
        creep.memory.currentTarget = {
            id: containers[0].id,
            pos: containers[0].pos
        };
        creep.say(Icon.ACTION_RECHARGE + Icon.TARGET_CONTAINER);
        if (creep.withdraw(containers[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(containers[0]);
        }
    } else if (droppedEnergy && droppedEnergy.length > 0) {
        creep.say(Icon.ACTION_RECHARGE + Icon.ACTION_PICKUP);

        if (!creep.pos.isNearTo(droppedEnergy[0].pos)) {
            creep.moveTo(droppedEnergy[0].pos);
        } else {
            creep.pickup(droppedEnergy[0]);
        }
    } else if (sources && sources.length > 0) {
        // const withRange = isInRangeTo(1);
        // const filter = withRange(creep.pos);
        // sources.forEach((s: Source) => {
        //     const creepsAtSource = creep.room.find(FIND_CREEPS, { filter });
        //     creep.room.visual.text(String(creepsAtSource.length), s.pos.x + 1, s.pos.y + 0.25);
        // })

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

export const enum RoleName {
    BUILDER = 'builder',
    HARVESTER = 'harvester',
    REPAIRER = 'repairer',
    UPGRADER = 'upgrader'
};

export const getByRole = (role: string): Creep[] => _.filter(Game.creeps,
    (c: Creep) => !c.spawning && c.memory.role === role);



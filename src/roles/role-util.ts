import Icon from "icons";

export const harvestEnergy = (creep: Creep, pathStyle: PolyStyle) => {
    creep.say(Icon.ACTION_RECHARGE);
    const containers = creep.room.find(FIND_STRUCTURES, {
        filter: (c: AnyStructure) => {
            return c.structureType === STRUCTURE_CONTAINER &&
                ((c as StructureContainer).store.getUsedCapacity() > 0);
        }
    });
    if (containers.length > 0) {
        containers.sort((a: AnyStructure, b: AnyStructure) => {
            return (creep.pos.getRangeTo(b) - creep.pos.getRangeTo(a));
        });
        creep.memory.currentTarget = {
            id: containers[0].id,
            pos: containers[0].pos
        };
        if (creep.withdraw(containers[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(containers[0]);
        }
    } else {
        const sources: Source[] = creep.room.find(FIND_SOURCES_ACTIVE, {
            filter: (s: Source) => {
                return creep.pos.inRangeTo(s.pos, 20);
            }
        });
        if (sources && sources.length > 0) {
            sources.sort((a: Source, b: Source) => b.energy - a.energy);
            if (sources[0] !== null) {
                creep.memory.currentTarget = {
                    id: sources[0].id,
                    pos: sources[0].pos
                };
                if (creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[0], {
                        visualizePathStyle: pathStyle
                    });
                }
            }
        } else {
            console.log('NO SOURCES');
        }
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



export const sortByDistance = _.curry(
    <T extends RoomPosition>(pos: RoomPosition, a: T, b: T) => pos.getRangeTo(b) - pos.getRangeTo(a)
);

export const isInRangeTo = _.curry(<T extends RoomPosition>(range: number, a: T, b: T): boolean => {
    return a.inRangeTo(b, range);
});

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



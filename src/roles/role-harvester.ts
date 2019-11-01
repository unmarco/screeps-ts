import { harvestEnergy, RoleName } from "./role-util";
import Icon from "icons";

const harvesterPathStyle: PolyStyle = {
    stroke: '#99DD99',
    strokeWidth: 0.1,
}

const work = (creep: Creep, pathStyle: PolyStyle) => {
    const primaryTargets = creep.room.find(FIND_STRUCTURES, {
        filter: (s: AnyStructure) => {
            return (s.structureType === STRUCTURE_SPAWN && s.energy < s.energyCapacity) ||
                (s.structureType === STRUCTURE_EXTENSION && s.energy < s.energyCapacity) ||
                (s.structureType === STRUCTURE_TOWER && s.energy < s.energyCapacity)
        }
    });
    const storageStructures = creep.room.find(FIND_STRUCTURES, {
        filter: (s: AnyStructure) => {
            return (
                (s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_STORAGE) &&
                (s.storeCapacity - s.store.energy) > 0
            );
        }
    });
    if (primaryTargets.length > 0) {
        creep.say(Icon.ACTION_TRANSFER);
        creep.memory.currentTarget = {
            id: primaryTargets[0].id,
            pos: primaryTargets[0].pos
        };
        if (creep.transfer(primaryTargets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(primaryTargets[0], {
                visualizePathStyle: pathStyle
            });
        }
    } else if (storageStructures.length > 0) {
        // console.log(`No primary targets found. Found ${containers.length} containers instead`)
        creep.say(Icon.ACTION_DROP + Icon.TARGET_CONTAINER);
        creep.memory.currentTarget = {
            id: storageStructures[0].id,
            pos: storageStructures[0].pos
        };
        if (!creep.pos.isEqualTo(storageStructures[0])) {
            creep.moveTo(storageStructures[0]);
        } else {
            console.log(`Feeding container at ${storageStructures[0].pos.x + ',' + storageStructures[0].pos.y}`)
            if (storageStructures[0] instanceof StructureContainer || storageStructures[0] instanceof StructureStorage) {
                // @ts-ignore
                const missing = storageStructures[0].storeCapacity - storageStructures[0].store.energy;
                creep.drop(RESOURCE_ENERGY, Math.min(missing, creep.carry.energy));
            }
        }
    } else {
        creep.say(Icon.ACTION_REST);
        // console.log(`No targets of any type found. Resting at flag`)
        creep.memory.currentTarget = undefined;
        const restFlag = Game.flags['H'];
        creep.moveTo(restFlag);
    }
}

export const RoleHarvester: Role = {

    name: RoleName.HARVESTER,

    run: (creep: Creep) => {
        let working = creep.memory.working;
        if (creep.carry.energy < creep.carryCapacity && !working) {
            harvestEnergy(creep, harvesterPathStyle, false);
        } else {
            working = true;
        }

        if (working) {
            if (creep.carry.energy > 0) {
                work(creep, harvesterPathStyle);
            } else {
                working = false;
            }
        }

        creep.memory.working = working;
    }
}

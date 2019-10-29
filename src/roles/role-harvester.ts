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
    const containers = creep.room.find(FIND_STRUCTURES, {
        filter: (s: AnyStructure) => {
            return (s.structureType === STRUCTURE_CONTAINER && s.store.getFreeCapacity() > 0);
        }
    });
    // console.log(`Found ${containers.length} containers`)
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
    } else if (containers.length > 0) {
        console.log(`No primary targets found. Found ${containers.length} containers instead`)
        creep.say(Icon.ACTION_DROP);
        containers.sort((a: AnyStructure, b: AnyStructure) => {
            return (creep.pos.getRangeTo(b) - creep.pos.getRangeTo(a));
        })
        creep.memory.currentTarget = {
            id: containers[0].id,
            pos: containers[0].pos
        };
        if (!creep.pos.isEqualTo(containers[0])) {
            creep.moveTo(containers[0]);
        } else {
            console.log(`Feeding container at ${containers[0].pos.x + ',' + containers[0].pos.y}`)
            const missing = (containers[0] as { store: Store }).store.getFreeCapacity();
            creep.drop(RESOURCE_ENERGY, Math.min(missing, creep.store.getUsedCapacity()));
        }
    } else {
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
            if (creep.store.getUsedCapacity() > 0) {
                work(creep, harvesterPathStyle);
            } else {
                working = false;
            }
        }

        creep.memory.working = working;
    }
}

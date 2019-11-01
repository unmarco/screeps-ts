import { harvestEnergy, RoleName } from "./role-util";
import Icon from "icons";
import { BaseRole } from "./base-role";

const harvesterPathStyle: PolyStyle = {
    stroke: '#99DD99',
    strokeWidth: 0.1,
}

type PrimaryTargetType = StructureSpawn | StructureExtension | StructureTower;
type StorageStructureType = StructureStorage | StructureContainer;

export class HarvesterRole extends BaseRole {
    public primaryTarget: PrimaryTargetType | null = null;
    public storageStructure: StorageStructureType | null = null;

    constructor() {
        super(RoleName.HARVESTER);
    }

    public config(data?: any) {
        this.primaryTarget = data.primaryTarget || null;
        this.storageStructure = data.storageStructure || null;
    }

    public run(creep: Creep) {
        let working = creep.memory.working;
        if (creep.carry.energy < creep.carryCapacity && !working) {
            harvestEnergy(creep, harvesterPathStyle, false);
        } else {
            working = true;
        }

        if (working) {
            if (creep.carry.energy > 0) {
                this.work(creep, harvesterPathStyle);
            } else {
                working = false;
            }
        }

        creep.memory.working = working;
    }

    public work(creep: Creep, pathStyle: PolyStyle) {
        if (creep.memory.data) {
            if (this.primaryTarget !== null) {
                creep.say(Icon.ACTION_TRANSFER);
                creep.memory.currentTarget = {
                    id: this.primaryTarget.id,
                    pos: this.primaryTarget.pos
                };
                if (creep.transfer(this.primaryTarget, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(this.primaryTarget, {
                        visualizePathStyle: pathStyle
                    });
                }
            } else if (this.storageStructure !== null) {
                // console.log(`No primary targets found. Found ${containers.length} containers instead`)
                creep.say(Icon.ACTION_DROP + Icon.TARGET_CONTAINER);
                creep.memory.currentTarget = {
                    id: this.storageStructure.id,
                    pos: this.storageStructure.pos
                };
                if (!creep.pos.isEqualTo(this.storageStructure)) {
                    creep.moveTo(this.storageStructure);
                } else {
                    // console.log(`Feeding container at ${this.storageStructures[0].pos.x + ',' + this.storageStructures[0].pos.y}`)
                    const missing = this.storageStructure.storeCapacity - this.storageStructure.store.energy;
                    creep.drop(RESOURCE_ENERGY, Math.min(missing, creep.carry.energy));
                }
            } else {
                creep.say(Icon.ACTION_REST);
                // console.log(`No targets of any type found. Resting at flag`)
                creep.memory.currentTarget = undefined;
                const restFlag = Game.flags['H'];
                creep.moveTo(restFlag);
            }
        } else {
            console.log('NO DATA');
        }
    }
}

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
    public primarySink: PrimaryTargetType | null = null;
    public secondarySink: StorageStructureType | null = null;

    constructor() {
        super(RoleName.HARVESTER);
    }

    public config(data?: any) {
        this.primarySink = data.primarySink || null;
        this.secondarySink = data.secondarySink || null;
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
        if (this.primarySink !== null) {
            creep.say(Icon.ACTION_TRANSFER);
            creep.memory.currentTarget = {
                id: this.primarySink.id,
                pos: this.primarySink.pos
            };
            if (creep.transfer(this.primarySink, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(this.primarySink, {
                    visualizePathStyle: pathStyle
                });
            }
        } else if (this.secondarySink !== null) {
            // console.log(`No primary targets found. Found ${containers.length} containers instead`)
            creep.say(Icon.ACTION_DROP + Icon.TARGET_CONTAINER);
            creep.memory.currentTarget = {
                id: this.secondarySink.id,
                pos: this.secondarySink.pos
            };
            if (!creep.pos.isEqualTo(this.secondarySink.pos)) {
                creep.moveTo(this.secondarySink.pos);
            } else {
                // console.log(`Feeding container at ${this.storageStructures[0].pos.x + ',' + this.storageStructures[0].pos.y}`)
                const missing = this.secondarySink.storeCapacity - this.secondarySink.store.energy;
                creep.drop(RESOURCE_ENERGY, Math.min(missing, creep.carry.energy));
            }
        } else {
            creep.say(Icon.ACTION_REST);
            // console.log(`No targets of any type found. Resting at flag`)
            creep.memory.currentTarget = undefined;
            const restFlag = Game.flags['H'];
            creep.moveTo(restFlag);
        }
    }
}

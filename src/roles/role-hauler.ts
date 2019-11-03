import { RoleName } from "./role-util";
import Icon from "icons";
import { BaseRole } from "./base-role";

const haulerPathStyle: PolyStyle = {
    stroke: '#99DD99',
    opacity: 0.9,
    strokeWidth: 0.1,
}

export class HaulerRole extends BaseRole {
    public primarySink: PrimarySinkType | null = null;
    public secondarySink: SecondarySinkType | null = null;

    constructor() {
        super(RoleName.HAULER);
    }

    public config(data?: any) {
        this.primarySink = data.primarySink || null;
        this.secondarySink = data.secondarySink || null;
    }

    public run(creep: Creep) {
        let working = creep.memory.working;
        if (creep.carry.energy < creep.carryCapacity && !working) {
            creep.getEnergy(false, false, true, haulerPathStyle);
        } else {
            working = true;
        }

        if (working) {
            if (creep.carry.energy > 0) {
                this.work(creep, haulerPathStyle);
            } else {
                working = false;
            }
        }

        creep.memory.working = working;
    }

    public work(creep: Creep, pathStyle?: PolyStyle) {
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
            creep.say(Icon.ACTION_DROP + Icon.TARGET_CONTAINER);
            creep.memory.currentTarget = {
                id: this.secondarySink.id,
                pos: this.secondarySink.pos
            };
            if (!creep.pos.isEqualTo(this.secondarySink.pos)) {
                creep.moveTo(this.secondarySink.pos);
            } else {
                // console.log(`Feeding container at ${this.storageStructures[0].pos.x + ',' + this.storageStructures[0].pos.y}`)
                creep.drop(RESOURCE_ENERGY);
            }
        } else {
            creep.say(Icon.ACTION_REST);
            // console.log(`No targets of any type found. Resting at flag`)
            creep.memory.currentTarget = undefined;
            creep.memory.working = false;
            const restFlag = Game.flags['H'];
            if (!creep.pos.isNearTo(restFlag)) {
                creep.moveTo(restFlag);
            } else {
                // creep.drop(RESOURCE_ENERGY);
            }
        }
    }
}

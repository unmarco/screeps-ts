import { RoleName } from "./role-util";
import Icon from "icons";
import { BaseRole } from "./base-role";

const haulerPathStyle: PolyStyle = {
  stroke: '#99DD99',
  strokeWidth: 0.1,
}

type PrimaryTargetType = StructureSpawn | StructureExtension | StructureTower;
type StorageStructureType = StructureStorage | StructureContainer;

export class HaulerRole extends BaseRole {
  public primarySinks: PrimaryTargetType[] = [];
  public secondarySinks: StorageStructureType[] = [];
  public primarySink: PrimaryTargetType | null = null;
  public secondarySink: StorageStructureType | null = null;

  constructor() {
    super(RoleName.HAULER);
  }

  public config(data?: any) {
    this.primarySinks = data.primarySinks || [];
    this.secondarySinks = data.secondarySinks || [];
    this.primarySink = data.primarySink || null;
    this.secondarySink = data.secondarySink || null;
  }

  public run(creep: Creep) {
    let working = creep.memory.working;
    if (creep.carry.energy < creep.carryCapacity && !working) {
      creep.getEnergy(false, false, true);
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
    const primarySink = this.primarySinks.shift() || this.primarySink || null;
    const secondarySink = this.secondarySinks.shift() || this.secondarySink || null;
    if (primarySink !== null) {
      creep.say(Icon.ACTION_TRANSFER);
      creep.memory.currentTarget = {
        id: primarySink.id,
        pos: primarySink.pos
      };
      if (creep.transfer(primarySink, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(primarySink, {
          visualizePathStyle: pathStyle
        });
      }
    } else if (secondarySink !== null) {
      // console.log(`No primary targets found. Found ${containers.length} containers instead`)
      creep.say(Icon.ACTION_DROP + Icon.TARGET_CONTAINER);
      creep.memory.currentTarget = {
        id: secondarySink.id,
        pos: secondarySink.pos
      };
      if (!creep.pos.isEqualTo(secondarySink.pos)) {
        creep.moveTo(secondarySink.pos);
      } else {
        // console.log(`Feeding container at ${this.storageStructures[0].pos.x + ',' + this.storageStructures[0].pos.y}`)
        const missing = secondarySink.storeCapacity - secondarySink.store.energy;
        creep.drop(RESOURCE_ENERGY, Math.min(missing, creep.carry.energy));
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

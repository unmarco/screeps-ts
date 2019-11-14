import { RoleName } from "./role-util";
import Icon from "icons";
import { BaseRole } from "./base-role";

const repairerPathStyle: PolyStyle = {
  stroke: '#DDDD99',
  strokeWidth: 0.1,
}

export class RepairerRole extends BaseRole {
  constructor() {
    super(RoleName.REPAIRER);
  }

  public checkSpawnPreconditions(room: Room) {
    return room.memory.repairTargets.length > 0;
  }

  public run(creep: Creep) {
    let working = creep.memory.working;

    if (creep.carry.energy < creep.carryCapacity && !working) {
      if (creep.carry.energy < creep.carryCapacity) {
        creep.getEnergy(true, true, false);
      }
    } else {
      working = true;
    }
    if (working) {
      if (creep.carry.energy > 0) {
        this.work(creep, repairerPathStyle);
      } else {
        working = false;
      }
    }

    creep.memory.working = working;
  }

  public rest(creep: Creep) {
    creep.say(Icon.ACTION_REST);
    creep.memory.currentTarget = undefined;
    const restFlag = Game.flags['R'];
    creep.moveTo(restFlag);
  }

  public work(creep: Creep, pathStyle: PolyStyle) {
    creep.say(Icon.ACTION_REPAIR);
    const repairTargets = creep.room.memory.repairTargets;
    if (repairTargets.length > 0) {
      const target = Game.getObjectById(repairTargets[0].id) as AnyStructure;
      if (target) {
        creep.say(`${Icon.ACTION_MOVE} ${target.pos.x + ',' + target.pos.y}`);
        creep.room.visual.text(Icon.TARGET_REPAIRER, target.pos.x, target.pos.y);
        creep.memory.currentTarget = {
          id: target.id,
          pos: target.pos
        };
        if (creep.repair(target) === ERR_NOT_IN_RANGE) {
          creep.moveTo(target, {
            visualizePathStyle: pathStyle
          });
        }
      } else {
        this.rest(creep);
      }
    } else {
      this.rest(creep);
    }
  }
}

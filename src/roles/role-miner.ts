import { RoleName } from "./role-util";
import Icon from "icons";
import { BaseRole } from "./base-role";

const minerPathStyle: PolyStyle = {
  stroke: '#99DD99',
  strokeWidth: 0.1,
}

export class MinerRole extends BaseRole {

  constructor() {
    super(RoleName.MINER);
  }

  public run(creep: Creep) {
    let working = creep.memory.working;
    const sourcesData = _.filter(creep.room.memory.sources, s => s.active);
    let nearestSource;
    if (sourcesData.length > 0) {
      sourcesData.sort((a, b) => creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b));
      nearestSource = sourcesData[0];
      const source: Source | null = Game.getObjectById<Source>(nearestSource.id);
      if (source === null) {
        working = false;
        // TODO rest somewhere
        return;
      }
      creep.say(Icon.ACTION_RECHARGE);
      this.work(creep, source);
      working = true;
    } else {
      creep.say(Icon.ACTION_REST);
      working = false;
    }
    creep.memory.working = working;
  }

  public work(creep: Creep, source: Source, pathStyle?: PolyStyle) {
    if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
      creep.moveTo(source);
    }
  }
}
